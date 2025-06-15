
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useCallback } from 'react';

export const useSendMessage = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { uploadFile } = useFileUpload();

  const sendMessageMutation = useMutation({
    mutationFn: async ({ receiverId, subject, content, repliedTo, file }: {
      receiverId: string;
      subject?: string;
      content: string;
      repliedTo?: string;
      file?: File;
    }) => {
      if (!profile?.id) throw new Error('Not authenticated');

      let fileUrl, fileName, fileType;
      
      // Upload file first if exists
      if (file) {
        const uploadResult = await uploadFile(file, 'message-files', profile.id);
        fileUrl = uploadResult.url;
        fileName = uploadResult.name;
        fileType = uploadResult.type;
      }

      // Insert message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: profile.id,
          receiver_id: receiverId,
          subject,
          content,
          replied_to: repliedTo,
          file_url: fileUrl,
          file_name: fileName,
          file_type: fileType,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ receiverId, content, file }) => {
      // Optimistic update - add message immediately to UI
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        sender_id: profile?.id || '',
        receiver_id: receiverId,
        content: content || (file ? '📎 Đang gửi file...' : ''),
        created_at: new Date().toISOString(),
        is_read: false,
        sender_profile: {
          full_name: profile?.full_name || '',
          role: profile?.role || 'student',
          avatar_url: profile?.avatar_url,
        },
        file_url: null,
        file_name: file?.name,
        file_type: file?.type,
        replied_to: null,
        subject: null,
        receiver_profile: null,
      };

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['messages'] });
      await queryClient.cancelQueries({ queryKey: ['conversations'] });

      // Get current data
      const previousMessages = queryClient.getQueryData(['messages', profile?.id, receiverId, 1]);
      
      // Optimistically update messages
      queryClient.setQueryData(['messages', profile?.id, receiverId, 1], (old: any) => {
        if (!old) return { data: [optimisticMessage], hasMore: false, total: 1 };
        return {
          ...old,
          data: [...old.data, optimisticMessage],
          total: old.total + 1
        };
      });

      return { previousMessages };
    },
    onSuccess: (data, variables) => {
      // Update with real message data
      queryClient.setQueryData(['messages', profile?.id, variables.receiverId, 1], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((msg: any) => 
            msg.id.toString().startsWith('temp-') && 
            msg.sender_id === data.sender_id &&
            msg.receiver_id === data.receiver_id
              ? data 
              : msg
          )
        };
      });

      // Invalidate related queries for fresh data
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-counts'] });
    },
    onError: (error, variables, context) => {
      // Revert optimistic update on error
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', profile?.id, variables.receiverId, 1], context.previousMessages);
      }
      console.error('Error sending message:', error);
    },
  });

  const sendMessage = useCallback((params: {
    receiverId: string;
    subject?: string;
    content: string;
    repliedTo?: string;
    file?: File;
  }) => {
    return sendMessageMutation.mutateAsync(params);
  }, [sendMessageMutation]);

  return {
    sendMessage,
    isPending: sendMessageMutation.isPending,
    error: sendMessageMutation.error,
  };
};
