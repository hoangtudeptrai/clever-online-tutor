
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate notifications and unread counts
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-counts'] });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Lỗi",
        description: "Không thể đánh dấu thông báo đã đọc",
        variant: "destructive",
      });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate notifications and unread counts
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-counts'] });
      
      toast({
        title: "Thành công",
        description: "Đã đánh dấu tất cả thông báo là đã đọc",
      });
    },
    onError: (error) => {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Lỗi",
        description: "Không thể đánh dấu tất cả thông báo đã đọc",
        variant: "destructive",
      });
    },
  });
};
