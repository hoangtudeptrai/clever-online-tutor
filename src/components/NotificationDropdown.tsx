
import React from 'react';
import { Bell, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { useMarkNotificationRead } from '@/hooks/useMarkNotificationRead';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface NotificationDropdownProps {
  unreadCount: number;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ unreadCount }) => {
  const { data: notifications } = useNotifications();
  const markAsReadMutation = useMarkNotificationRead();

  // Get only the first 5 notifications for dropdown
  const recentNotifications = notifications?.slice(0, 5) || [];

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markAsReadMutation.mutate(notificationId);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment_submitted':
      case 'assignment_graded':
      case 'assignment_created':
        return '📝';
      case 'document_uploaded':
        return '📄';
      case 'course_enrolled':
        return '📚';
      case 'message':
        return '💬';
      default:
        return '🔔';
    }
  };

  const truncateContent = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Thông báo</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} chưa đọc
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {recentNotifications && recentNotifications.length > 0 ? (
          <>
            {recentNotifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className="flex items-start space-x-3 p-3 cursor-pointer"
                onClick={() => handleNotificationClick(notification.id, notification.is_read)}
              >
                <div className="text-lg">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 space-y-1">
                  <p className={`text-sm font-medium ${!notification.is_read ? 'text-blue-600' : 'text-gray-900'}`}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-600">
                    {truncateContent(notification.content)}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(notification.created_at), { 
                      addSuffix: true, 
                      locale: vi 
                    })}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/dashboard/notifications" className="w-full text-center py-2 text-blue-600 hover:text-blue-700">
                Xem tất cả thông báo
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem disabled>
            <div className="text-center py-4 text-gray-500">
              Không có thông báo nào
            </div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
