
import React, { useState } from 'react';
import { Bell, Check, Trash2, Filter, MoreVertical, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';

const Notifications = () => {
  const [filter, setFilter] = useState('all');

  const notifications = [
    {
      id: 1,
      type: 'assignment',
      title: 'Bài tập mới được giao',
      message: 'Bạn có bài tập mới "JavaScript DOM" trong khóa học Lập trình Web. Hạn nộp: 20/04/2025',
      time: '5 phút trước',
      read: false,
      priority: 'high'
    },
    {
      id: 2,
      type: 'grade',
      title: 'Điểm bài tập đã được cập nhật',
      message: 'Bài tập "HTML/CSS cơ bản" của bạn đã được chấm điểm: 9.0/10',
      time: '2 giờ trước',
      read: false,
      priority: 'medium'
    },
    {
      id: 3,
      type: 'course',
      title: 'Khóa học mới có sẵn',
      message: 'Khóa học "Vue.js Fundamentals" đã được thêm vào danh sách khóa học.',
      time: '1 ngày trước',
      read: true,
      priority: 'low'
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Nhắc nhở hạn nộp bài',
      message: 'Bài tập "React Components" sẽ hết hạn trong 2 ngày nữa.',
      time: '1 ngày trước',
      read: false,
      priority: 'high'
    },
    {
      id: 5,
      type: 'system',
      title: 'Cập nhật hệ thống',
      message: 'Hệ thống sẽ bảo trì vào 22:00 - 23:00 ngày 15/04/2025.',
      time: '2 ngày trước',
      read: true,
      priority: 'medium'
    },
    {
      id: 6,
      type: 'announcement',
      title: 'Thông báo từ giảng viên',
      message: 'Lịch học tuần tới sẽ thay đổi do giảng viên có công tác. Xem chi tiết trong khóa học.',
      time: '3 ngày trước',
      read: true,
      priority: 'medium'
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'grade':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'course':
        return <Info className="h-5 w-5 text-blue-600" />;
      case 'reminder':
        return <Bell className="h-5 w-5 text-red-600" />;
      case 'system':
        return <Info className="h-5 w-5 text-gray-600" />;
      case 'announcement':
        return <Info className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">Cao</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Trung bình</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Thấp</Badge>;
      default:
        return null;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Thông báo</h1>
            <p className="text-gray-600 mt-2">
              Theo dõi các cập nhật mới nhất về khóa học và bài tập
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Check className="h-4 w-4 mr-2" />
              Đánh dấu tất cả đã đọc
            </Button>
            <Button variant="outline">
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa đã đọc
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{notifications.length}</p>
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
                  <p className="text-2xl font-bold text-green-600">
                    {notifications.filter(n => n.type === 'grade').length}
                  </p>
                  <p className="text-sm text-gray-600">Điểm số</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Info className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {notifications.filter(n => n.type === 'assignment').length}
                  </p>
                  <p className="text-sm text-gray-600">Bài tập</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
              <SelectItem value="assignment">Bài tập</SelectItem>
              <SelectItem value="grade">Điểm số</SelectItem>
              <SelectItem value="course">Khóa học</SelectItem>
              <SelectItem value="reminder">Nhắc nhở</SelectItem>
              <SelectItem value="system">Hệ thống</SelectItem>
              <SelectItem value="announcement">Thông báo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                !notification.read ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                        {getPriorityBadge(notification.priority)}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <Button variant="ghost" size="sm">
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không có thông báo</h3>
              <p className="text-gray-500">Bạn đã xem hết tất cả thông báo theo bộ lọc đã chọn.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
