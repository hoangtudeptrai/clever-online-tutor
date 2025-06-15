
import React from 'react';
import { Clock, FileText, User, BookOpen, CheckCircle, AlertCircle, Trophy, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRecentActivities } from '@/hooks/useRecentActivities';
import { Loader2 } from 'lucide-react';

const RecentActivities = () => {
  const { data: activities, isLoading } = useRecentActivities();

  const getActivityIcon = (type: string, status?: string, grade?: number) => {
    if (type === 'submission') {
      if (grade !== null && grade !== undefined) {
        return <Trophy className="h-4 w-4 text-yellow-600" />;
      }
      if (status === 'submitted') {
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      }
      return <FileText className="h-4 w-4 text-blue-600" />;
    }
    return <AlertCircle className="h-4 w-4 text-gray-600" />;
  };

  const getStatusBadge = (status?: string, grade?: number) => {
    if (grade !== null && grade !== undefined) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Đã chấm điểm</Badge>;
    }
    
    switch (status) {
      case 'submitted':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Đã nộp bài</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">Chờ nộp</Badge>;
      case 'late':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Nộp muộn</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Chưa xác định</Badge>;
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

  const formatSubmissionTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Thông báo hoạt động gần đây</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Đang tải...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Thông báo hoạt động gần đây</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Chưa có hoạt động nào gần đây</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Thông báo hoạt động gần đây</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type, activity.status, activity.grade)}
                </div>
                <div className="flex-1 min-w-0">
                  {/* Header with student name and status */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {activity.student_name}
                      </span>
                      {getStatusBadge(activity.status, activity.grade)}
                    </div>
                    <span className="text-xs text-gray-500 flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(activity.created_at)}</span>
                    </span>
                  </div>
                  
                  {/* Activity description */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-800 font-medium">
                      {activity.type === 'submission' && activity.grade !== null && activity.grade !== undefined
                        ? `Bài tập đã được chấm điểm: ${activity.assignment_title}`
                        : `Đã nộp bài tập: ${activity.assignment_title}`
                      }
                    </p>
                  </div>

                  {/* Course and assignment details */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <BookOpen className="h-3 w-3 text-blue-500" />
                      <span className="font-medium">Lớp học:</span>
                      <span>{activity.course_title}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-3 w-3 text-green-500" />
                      <span className="font-medium">Thời gian nộp:</span>
                      <span>{formatSubmissionTime(activity.created_at)}</span>
                    </div>

                    {activity.grade !== null && activity.grade !== undefined && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Trophy className="h-3 w-3 text-yellow-500" />
                        <span className="font-medium">Điểm số:</span>
                        <span className="font-semibold text-yellow-700">{activity.grade}/100</span>
                      </div>
                    )}
                  </div>

                  {/* Action needed indicator */}
                  {activity.status === 'submitted' && (activity.grade === null || activity.grade === undefined) && (
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <span className="inline-flex items-center text-xs font-medium text-orange-700 bg-orange-50 px-2 py-1 rounded-full">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Cần chấm điểm
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
