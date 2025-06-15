import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

export const useUnreadCounts = () => {
  const { profile } = useAuth();
  const { data: notifications } = useNotifications();

  return useQuery({
    queryKey: ['unread-counts', profile?.id, notifications],
    queryFn: async () => {
      if (!profile?.id) return { messages: 0, notifications: 0 };

      // Get unread messages count
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id')
        .eq('receiver_id', profile.id)
        .eq('is_read', false);

      if (messagesError) throw messagesError;

      // Count unread notifications from the notifications hook data
      const unreadNotifications = notifications?.filter(n => !n.is_read).length || 0;

      return {
        messages: messagesData?.length || 0,
        notifications: unreadNotifications,
      };
    },
    enabled: !!profile?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useRecentMessages = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['recent-messages', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!messages_sender_id_fkey(full_name, role, avatar_url)
        `)
        .eq('receiver_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });
};
