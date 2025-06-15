
import React from 'react';
import { Clock, FileText, Trophy, AlertCircle, Calendar, BookOpen, CheckCircle, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStudentActivities } from '@/hooks/useStudentActivities';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentActivities = () => {
  const { data: activities, isLoading } = useStudentActivities();
  const navigate = useNavigate();

  const getActivityIcon = (type: string, status?: string) => {
    switch (type) {
      case 'assignment_created':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'assignment_graded':
        return <Trophy className="h-4 w-4 text-yellow-600" />;
      case 'document_uploaded':
        return <FileText className="h-4 w-4 text-purple-600" />;
      case 'assignment_due_soon':
        return status === 'urgent' 
          ? <AlertCircle className="h-4 w-4 text-red-600" />
          : <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (type: string, status?: string, grade?: number) => {
    if (type === 'assignment_graded' && grade !== null && grade !== undefined) {
      const color = grade >= 80 ? 'bg-green-100 text-green-800' : 
                   grade >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                   'bg-red-100 text-red-800';
      return <Badge className={color}>Điểm: {grade}/100</Badge>;
    }
    
    switch (type) {
      case 'assignment_created':
        return <Badge className="bg-blue-100 text-blue-800">Bài tập mới</Badge>;
      case 'assignment_graded':
        return <Badge className="bg-yellow-100 text-yellow-800">Đã chấm điểm</Badge>;
      case 'document_uploaded':
        return <Badge className="bg-purple-100 text-purple-800">Tài liệu mới</Badge>;
      case 'assignment_due_soon':
        return status === 'urgent' 
          ? <Badge className="bg-red-100 text-red-800">Khẩn cấp</Badge>
          : <Badge className="bg-orange-100 text-orange-800">Sắp đến hạn</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Thông báo</Badge>;
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

  const formatDueDate = (dueDateString: string) => {
    const dueDate = new Date(dueDateString);
    const now = new Date();
    const diffInDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) return 'Đã quá hạn';
    if (diffInDays === 0) return 'Đến hạn hôm nay';
    if (diffInDays === 1) return 'Đến hạn ngày mai';
    return `Còn ${diffInDays} ngày`;
  };

  const handleActivityClick = (activity: any) => {
    if (activity.type === 'assignment_created' || activity.type === 'assignment_graded' || activity.type === 'assignment_due_soon') {
      // Navigate to assignments page or specific assignment if we have the ID
      navigate('/dashboard/assignments');
    } else if (activity.type === 'document_uploaded') {
      navigate('/dashboard/documents');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Hoạt động gần đây</span>
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
            <span>Hoạt động gần đây</span>
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
          <span>Hoạt động gần đây</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
              onClick={() => handleActivityClick(activity)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type, activity.status)}
                </div>
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{activity.title}</h4>
                      {getStatusBadge(activity.type, activity.status, activity.grade)}
                    </div>
                    <span className="text-xs text-gray-500 flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatTimeAgo(activity.created_at)}</span>
                    </span>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-700 mb-2">{activity.description}</p>

                  {/* Course info */}
                  {activity.course_title && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <BookOpen className="h-3 w-3 text-blue-500" />
                      <span className="font-medium">Lớp học:</span>
                      <span>{activity.course_title}</span>
                    </div>
                  )}

                  {/* Due date for upcoming assignments */}
                  {activity.due_date && activity.type === 'assignment_due_soon' && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <AlertCircle className="h-3 w-3 text-orange-500" />
                      <span className="font-medium">Thời hạn:</span>
                      <span className={activity.status === 'urgent' ? 'text-red-600 font-semibold' : 'text-orange-600'}>
                        {formatDueDate(activity.due_date)}
                      </span>
                    </div>
                  )}

                  {/* Action indicator */}
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <span className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Nhấn để xem chi tiết
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentActivities;
