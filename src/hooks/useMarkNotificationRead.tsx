
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      // Since we're using computed notifications (not stored in DB), 
      // we just return success. In a real implementation, you'd store read status separately
      return Promise.resolve();
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
      // Since we're using computed notifications (not stored in DB), 
      // we just return success. In a real implementation, you'd store read status separately
      return Promise.resolve();
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
