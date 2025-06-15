
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-counts'] });
    },
  });
};

export const useMarkConversationAsRead = () => {
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (conversationWith: string) => {
      if (!profile?.id) throw new Error('Not authenticated');

      console.log('Marking conversation as read - conversationWith:', conversationWith, 'profile:', profile.id);

      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', conversationWith)
        .eq('receiver_id', profile.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    // Remove onSuccess to prevent automatic query invalidation that causes loops
    onSuccess: () => {
      console.log('Successfully marked conversation as read');
      // Don't invalidate queries immediately to prevent loops
      // The UI will update on next natural refresh
    },
  });
};
