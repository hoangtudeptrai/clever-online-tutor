
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Message } from '@/types/message';

export const useMessages = (conversationWith?: string, page: number = 1, pageSize: number = 10) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['messages', profile?.id, conversationWith, page],
    queryFn: async () => {
      if (!profile?.id) return { data: [], hasMore: false, total: 0 };

      // First get total count
      let countQuery = supabase
        .from('messages')
        .select('id', { count: 'exact', head: true });

      if (conversationWith) {
        countQuery = countQuery.or(`and(sender_id.eq.${profile.id},receiver_id.eq.${conversationWith}),and(sender_id.eq.${conversationWith},receiver_id.eq.${profile.id})`);
      } else {
        countQuery = countQuery.or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`);
      }

      const { count, error: countError } = await countQuery;
      if (countError) throw countError;

      // Then get the paginated data
      const offset = (page - 1) * pageSize;
      let query = supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!messages_sender_id_fkey(full_name, role, avatar_url),
          receiver_profile:profiles!messages_receiver_id_fkey(full_name, role, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (conversationWith) {
        query = query.or(`and(sender_id.eq.${profile.id},receiver_id.eq.${conversationWith}),and(sender_id.eq.${conversationWith},receiver_id.eq.${profile.id})`);
      } else {
        query = query.or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Reverse to show oldest first in UI
      const reversedData = (data as Message[])?.reverse() || [];
      
      return {
        data: reversedData,
        hasMore: (count || 0) > offset + pageSize,
        total: count || 0
      };
    },
    enabled: !!profile?.id,
  });
};

// Re-export all hooks from their new locations for backward compatibility
export { useConversations } from './useConversations';
export { useSendMessage } from './useSendMessage';
export { useMarkMessageAsRead, useMarkConversationAsRead } from './useMessageActions';
export { useUsers } from './useUsers';
export type { Message } from '@/types/message';
