
import React from 'react';
import { Clock, FileText, Trophy, AlertCircle, Calendar, BookOpen, CheckCircle, Bell } from 'lucide-react';
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
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'assignment_graded':
        return <Trophy className="h-5 w-5 text-yellow-600" />;
      case 'document_uploaded':
        return <FileText className="h-5 w-5 text-purple-600" />;
      case 'assignment_due_soon':
        return status === 'urgent' 
          ? <AlertCircle className="h-5 w-5 text-red-600" />
          : <Clock className="h-5 w-5 text-orange-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (type: string, status?: string, grade?: number) => {
    if (type === 'assignment_graded' && grade !== null && grade !== undefined) {
      const gradeOutOf10 = grade / 10;
      const color = gradeOutOf10 >= 8 ? 'bg-green-100 text-green-800' : 
                   gradeOutOf10 >= 6 ? 'bg-yellow-100 text-yellow-800' : 
                   'bg-red-100 text-red-800';
      return <Badge className={color}>Điểm: {gradeOutOf10}/10</Badge>;
    }
    
    switch (type) {
      case 'assignment_created':
        return <Badge variant="outline">Đã nộp</Badge>;
      case 'assignment_graded':
        return <Badge className="bg-yellow-100 text-yellow-800">Đã chấm</Badge>;
      case 'document_uploaded':
        return <Badge className="bg-purple-100 text-purple-800">Tài liệu</Badge>;
      case 'assignment_due_soon':
        return status === 'urgent' 
          ? <Badge variant="destructive">Khẩn cấp</Badge>
          : <Badge className="bg-orange-100 text-orange-800">Sắp đến hạn</Badge>;
      default:
        return <Badge variant="secondary">Thông báo</Badge>;
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

  const handleActivityClick = (activity: any) => {
    if (activity.type === 'assignment_created' || activity.type === 'assignment_graded' || activity.type === 'assignment_due_soon') {
      navigate('/dashboard/assignments');
    } else if (activity.type === 'document_uploaded') {
      navigate('/dashboard/documents');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Đang tải...</span>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p>Chưa có hoạt động nào gần đây</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <div 
          key={activity.id} 
          className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          onClick={() => handleActivityClick(activity)}
        >
          <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
            {getActivityIcon(activity.type, activity.status)}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm text-gray-800 truncate">
              <span className="font-medium">{activity.title}</span>
              {activity.description && ` - ${activity.description}`}
            </p>
            <span className="text-xs text-gray-500">
              {formatTimeAgo(activity.created_at)}
            </span>
          </div>
          <div className="ml-2 flex-shrink-0">
            {getStatusBadge(activity.type, activity.status, activity.grade)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentActivities;
