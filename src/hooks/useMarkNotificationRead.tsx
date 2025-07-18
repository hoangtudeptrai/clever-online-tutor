
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Local storage key for read notifications
const READ_NOTIFICATIONS_KEY = 'read_notifications';

// Helper functions for localStorage
const getReadNotifications = (): string[] => {
  try {
    const stored = localStorage.getItem(READ_NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const setReadNotifications = (notificationIds: string[]) => {
  try {
    localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(notificationIds));
  } catch {
    // Ignore localStorage errors
  }
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      // For computed notifications, store in localStorage
      if (notificationId.includes('_')) {
        const readNotifications = getReadNotifications();
        if (!readNotifications.includes(notificationId)) {
          readNotifications.push(notificationId);
          setReadNotifications(readNotifications);
        }
        return { success: true };
      }

      // For database notifications, update in database
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
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Get all current notifications to mark them as read
      const queryClient = useQueryClient();
      const notifications = queryClient.getQueryData(['notifications']) as any[];
      
      if (notifications) {
        const allNotificationIds = notifications.map(n => n.id);
        setReadNotifications(allNotificationIds);
      }

      // Also update database notifications
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
