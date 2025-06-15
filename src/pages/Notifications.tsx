
import React, { useState } from 'react';
import { Bell, Check, Trash2, Filter, AlertCircle, Info, CheckCircle, Loader2, Upload, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';
import NotificationItem from '@/components/NotificationItem';
import { useNotifications, useMarkAsRead } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';

const Notifications = () => {
  const [filter, setFilter] = useState('all');
  const { profile } = useAuth();
  const { data: notifications, isLoading } = useNotifications();
  const markAsReadMutation = useMarkAsRead();

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    // Mark all notifications as read
    notifications?.forEach(notification => {
      if (!notification.is_read) {
        markAsReadMutation.mutate(notification.id);
      }
    });
  };

  const filteredNotifications = notifications?.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.is_read;
    return notification.type === filter;
  }) || [];

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;
  const submissionCount = notifications?.filter(n => n.type === 'assignment_submitted').length || 0;
  const gradeCount = notifications?.filter(n => n.type === 'assignment_graded').length || 0;
  const newAssignmentCount = notifications?.filter(n => n.type === 'assignment_created').length || 0;
  const documentCount = notifications?.filter(n => n.type === 'document_uploaded').length || 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Đang tải thông báo...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Thông báo</h1>
            <p className="text-gray-600 mt-2">
              {profile?.role === 'tutor' 
                ? 'Theo dõi các bài tập mới được nộp và cần chấm điểm'
                : 'Theo dõi các cập nhật về khóa học, bài tập, tài liệu và điểm số'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Đánh dấu tất cả đã đọc
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{notifications?.length || 0}</p>
                  <p className="text-sm text-gray-600">Tổng thông báo</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
                  <p className="text-sm text-gray-600">Chưa đọc</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{gradeCount}</p>
                  <p className="text-sm text-gray-600">
                    {profile?.role === 'tutor' ? 'Đã chấm' : 'Điểm số'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Info className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">{submissionCount}</p>
                  <p className="text-sm text-gray-600">
                    {profile?.role === 'tutor' ? 'Bài nộp' : 'Đã nộp'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          {profile?.role === 'student' && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-8 w-8 text-indigo-600" />
                  <div>
                    <p className="text-2xl font-bold text-indigo-600">{newAssignmentCount + documentCount}</p>
                    <p className="text-sm text-gray-600">Mới</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="unread">Chưa đọc</SelectItem>
              <SelectItem value="assignment_submitted">
                {profile?.role === 'tutor' ? 'Bài nộp mới' : 'Đã nộp bài'}
              </SelectItem>
              <SelectItem value="assignment_graded">Điểm số</SelectItem>
              {profile?.role === 'student' && (
                <>
                  <SelectItem value="assignment_created">Bài tập mới</SelectItem>
                  <SelectItem value="document_uploaded">Tài liệu mới</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <NotificationItem 
              key={notification.id} 
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </div>

        {filteredNotifications.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không có thông báo</h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? 'Bạn chưa có thông báo nào.' 
                  : 'Không có thông báo nào theo bộ lọc đã chọn.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
