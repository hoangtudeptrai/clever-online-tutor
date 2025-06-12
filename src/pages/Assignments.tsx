import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Search, Plus, FileText, User, Book, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';
import CreateAssignmentDialog from '@/components/CreateAssignmentDialog';
import AssignmentActionsMenu from '@/components/AssignmentActionsMenu';
import { useAssignments } from '@/hooks/useAssignments';
import { useAuth } from '@/contexts/AuthContext';

const Assignments = () => {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data: assignments, isLoading } = useAssignments();

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      draft: 'Nháp',
      published: 'Đã xuất bản',
      archived: 'Đã lưu trữ'
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAssignments = assignments?.filter(assignment => {
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.course?.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' || 
      assignment.assignment_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Quản lý bài tập</h1>
          {profile?.role === 'tutor' && <CreateAssignmentDialog />}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Tìm kiếm bài tập..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="published">Đã xuất bản</SelectItem>
              <SelectItem value="archived">Đã lưu trữ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments?.map((assignment) => (
            <Card key={assignment.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1.5">
                    <Link 
                      to={`/dashboard/assignments/${assignment.id}`}
                      className="hover:underline"
                    >
                      <CardTitle>{assignment.title}</CardTitle>
                    </Link>
                    <CardDescription className="line-clamp-2">
                      {assignment.description || 'Không có mô tả'}
                    </CardDescription>
                  </div>
                  <AssignmentActionsMenu assignment={assignment} />
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Link 
                        to={`/dashboard/courses/${assignment.course_id}`}
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                      >
                        <Book className="h-4 w-4" />
                        <span>Khóa học:</span>
                        <span className="font-medium">{assignment.course?.title}</span>
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>Người tạo:</span>
                      <span className="font-medium">{assignment.creator?.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Hạn nộp:</span>
                      <span className="font-medium">
                        {assignment.due_date ? formatDate(assignment.due_date) : 'Không có'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>Điểm tối đa:</span>
                      <span className="font-medium">{assignment.max_score || 100} điểm</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Ngày tạo:</span>
                      <span className="font-medium">{formatDate(assignment.created_at)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between pt-4">
                {getStatusBadge(assignment.assignment_status || 'draft')}
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/dashboard/assignments/${assignment.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Xem chi tiết
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredAssignments?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchQuery
                ? 'Không tìm thấy bài tập nào phù hợp'
                : 'Chưa có bài tập nào'}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Assignments;
