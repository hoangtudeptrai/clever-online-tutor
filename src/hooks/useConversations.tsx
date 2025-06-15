
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Message } from '@/types/message';

export const useConversations = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['conversations', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      // Get latest message from each conversation
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!messages_sender_id_fkey(full_name, role, avatar_url),
          receiver_profile:profiles!messages_receiver_id_fkey(full_name, role, avatar_url)
        `)
        .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by conversation partner
      const conversations = new Map();
      data?.forEach(message => {
        const partnerId = message.sender_id === profile.id ? message.receiver_id : message.sender_id;
        const partnerProfile = message.sender_id === profile.id ? message.receiver_profile : message.sender_profile;
        
        if (!conversations.has(partnerId)) {
          conversations.set(partnerId, {
            partnerId,
            partnerProfile,
            lastMessage: message,
            unreadCount: 0
          });
        }
        
        // Count unread messages
        if (message.receiver_id === profile.id && !message.is_read) {
          conversations.get(partnerId).unreadCount++;
        }
      });

      return Array.from(conversations.values());
    },
    enabled: !!profile?.id,
  });
};
