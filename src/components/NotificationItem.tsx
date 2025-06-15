
import React from 'react';
import { Bell, FileText, Trophy, CheckCircle, AlertCircle, Calendar, User, BookOpen, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Notification } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead 
}) => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment_submitted':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'assignment_graded':
        return <Trophy className="h-5 w-5 text-yellow-600" />;
      case 'assignment_created':
        return <AlertCircle className="h-5 w-5 text-green-600" />;
      case 'document_uploaded':
        return <Upload className="h-5 w-5 text-purple-600" />;
      case 'course_enrolled':
        return <CheckCircle className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'assignment_submitted':
        return <Badge className="bg-blue-100 text-blue-800">Bài tập</Badge>;
      case 'assignment_graded':
        return <Badge className="bg-yellow-100 text-yellow-800">Điểm số</Badge>;
      case 'assignment_created':
        return <Badge className="bg-green-100 text-green-800">Bài tập mới</Badge>;
      case 'document_uploaded':
        return <Badge className="bg-purple-100 text-purple-800">Tài liệu</Badge>;
      case 'course_enrolled':
        return <Badge className="bg-purple-100 text-purple-800">Khóa học</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Hệ thống</Badge>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
  };

  const handleClick = () => {
    if (onMarkAsRead && !notification.is_read) {
      onMarkAsRead(notification.id);
    }

    // Navigate based on notification type and user role
    if (notification.type === 'assignment_created' || notification.type === 'assignment_graded' || notification.type === 'assignment_submitted') {
      if (notification.metadata?.assignment_id) {
        navigate(`/dashboard/assignments/${notification.metadata.assignment_id}`);
      }
    } else if (notification.type === 'document_uploaded') {
      navigate('/dashboard/documents');
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (profile?.role === 'tutor' && notification.type === 'assignment_submitted') {
      // For tutors, go to assignment detail to view and grade submissions
      if (notification.metadata?.assignment_id) {
        navigate(`/dashboard/assignments/${notification.metadata.assignment_id}`);
      }
    } else if (profile?.role === 'student') {
      if (notification.type === 'assignment_graded' || notification.type === 'assignment_created') {
        // For students, go to assignment detail
        if (notification.metadata?.assignment_id) {
          navigate(`/dashboard/assignments/${notification.metadata.assignment_id}`);
        }
      } else if (notification.type === 'document_uploaded') {
        navigate('/dashboard/documents');
      }
    }
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${
        !notification.is_read ? 'bg-blue-50 border-blue-200' : ''
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-shrink-0 mt-1">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h4 className={`font-medium ${!notification.is_read ? 'font-semibold' : ''}`}>
                    {notification.title}
                  </h4>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                  {getTypeBadge(notification.type)}
                </div>
                <span className="text-xs text-gray-500 flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatTimeAgo(notification.created_at)}</span>
                </span>
              </div>

              {/* Content */}
              <p className="text-sm text-gray-700 mb-3">{notification.content}</p>

              {/* Metadata */}
              {notification.metadata && (
                <div className="space-y-1">
                  {notification.metadata.student_name && (
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <User className="h-3 w-3 text-blue-500" />
                      <span className="font-medium">Học sinh:</span>
                      <span>{notification.metadata.student_name}</span>
                    </div>
                  )}
                  {notification.metadata.course_title && (
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <BookOpen className="h-3 w-3 text-green-500" />
                      <span className="font-medium">Khóa học:</span>
                      <span>{notification.metadata.course_title}</span>
                    </div>
                  )}
                  {notification.metadata.grade !== null && notification.metadata.grade !== undefined && (
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <Trophy className="h-3 w-3 text-yellow-500" />
                      <span className="font-medium">Điểm:</span>
                      <span className="font-semibold text-yellow-700">{notification.metadata.grade}/100</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action button for tutors */}
              {profile?.role === 'tutor' && notification.type === 'assignment_submitted' && (
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <Button 
                    size="sm" 
                    onClick={handleActionClick}
                    className="text-xs"
                  >
                    <Trophy className="h-3 w-3 mr-1" />
                    Xem và chấm điểm
                  </Button>
                </div>
              )}

              {/* Action indicators for students */}
              {profile?.role === 'student' && (
                <>
                  {notification.type === 'assignment_graded' && (
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Nhấn để xem chi tiết
                      </span>
                    </div>
                  )}
                  {notification.type === 'assignment_created' && (
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <span className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                        <FileText className="h-3 w-3 mr-1" />
                        Nhấn để xem bài tập
                      </span>
                    </div>
                  )}
                  {notification.type === 'document_uploaded' && (
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <span className="inline-flex items-center text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-full">
                        <Upload className="h-3 w-3 mr-1" />
                        Nhấn để xem tài liệu
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationItem;
