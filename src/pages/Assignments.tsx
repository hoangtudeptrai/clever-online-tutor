
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar, User, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import CreateAssignmentDialog from '@/components/CreateAssignmentDialog';
import AssignmentActionsMenu from '@/components/AssignmentActionsMenu';
import { useAssignments } from '@/hooks/useAssignments';

const Assignments = () => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: assignments = [], isLoading, error } = useAssignments();

  const getStatusBadge = (status: string) => {
    if (profile?.role === 'tutor') {
      switch (status) {
        case 'published':
          return <Badge className="bg-blue-100 text-blue-800">Đang diễn ra</Badge>;
        case 'completed':
          return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>;
        case 'draft':
          return <Badge className="bg-gray-100 text-gray-800">Nháp</Badge>;
        default:
          return <Badge>{status}</Badge>;
      }
    } else {
      switch (status) {
        case 'submitted':
          return <Badge className="bg-green-100 text-green-800">Đã nộp</Badge>;
        case 'pending':
          return <Badge className="bg-yellow-100 text-yellow-800">Chưa nộp</Badge>;
        case 'late':
          return <Badge className="bg-red-100 text-red-800">Nộp muộn</Badge>;
        case 'graded':
          return <Badge className="bg-blue-100 text-blue-800">Đã chấm điểm</Badge>;
        default:
          return <Badge className="bg-yellow-100 text-yellow-800">Chưa nộp</Badge>;
      }
    }
  };

  const getStatusIcon = (assignment: any) => {
    if (profile?.role === 'tutor') {
      switch (assignment.assignment_status) {
        case 'completed':
          return <CheckCircle className="h-5 w-5 text-green-600" />;
        case 'published':
          return <Clock className="h-5 w-5 text-blue-600" />;
        case 'draft':
          return <XCircle className="h-5 w-5 text-gray-600" />;
        default:
          return <Clock className="h-5 w-5" />;
      }
    } else {
      const status = assignment.submission?.status || 'pending';
      switch (status) {
        case 'submitted':
        case 'graded':
          return <CheckCircle className="h-5 w-5 text-green-600" />;
        case 'pending':
          return <Clock className="h-5 w-5 text-yellow-600" />;
        case 'late':
          return <XCircle className="h-5 w-5 text-red-600" />;
        default:
          return <Clock className="h-5 w-5" />;
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa xác định';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Có lỗi xảy ra khi tải dữ liệu</p>
            <Button onClick={() => window.location.reload()}>
              Thử lại
            </Button>
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
            <h1 className="text-3xl font-bold text-gray-900">
              {profile?.role === 'tutor' ? 'Quản lý bài tập' : 'Bài tập của tôi'}
            </h1>
            <p className="text-gray-600 mt-2">
              {profile?.role === 'tutor' 
                ? 'Tạo và quản lý bài tập cho học sinh'
                : 'Theo dõi và nộp bài tập được giao'
              }
            </p>
          </div>
          {profile?.role === 'tutor' && <CreateAssignmentDialog />}
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm bài tập..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Lọc
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Đang tải dữ liệu...</span>
          </div>
        )}

        {/* Assignments Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {searchTerm ? 'Không tìm thấy bài tập nào' : 'Chưa có bài tập nào'}
                </p>
              </div>
            ) : (
              filteredAssignments.map((assignment) => {
                const submissionStatus = assignment.submission?.status || 'pending';
                return (
                  <Card key={assignment.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(assignment)}
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        </div>
                        <div className="flex items-center space-x-2">
                          {profile?.role === 'tutor' 
                            ? getStatusBadge(assignment.assignment_status)
                            : getStatusBadge(submissionStatus)
                          }
                          {profile?.role === 'tutor' && (
                            <AssignmentActionsMenu assignment={assignment} />
                          )}
                        </div>
                      </div>
                      <CardDescription className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{assignment.course?.title || 'Không có khóa học'}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {assignment.description || 'Không có mô tả'}
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            Hạn nộp:
                          </span>
                          <span className="font-medium">{formatDate(assignment.due_date)}</span>
                        </div>

                        {profile?.role === 'tutor' ? (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Điểm tối đa:</span>
                            <span className="font-medium">{assignment.max_score}</span>
                          </div>
                        ) : (
                          <>
                            {assignment.submission?.submitted_at && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Ngày nộp:</span>
                                <span className="font-medium">
                                  {formatDate(assignment.submission.submitted_at)}
                                </span>
                              </div>
                            )}
                            {assignment.submission?.grade !== null && assignment.submission?.grade !== undefined && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Điểm:</span>
                                <span className="font-medium text-blue-600">
                                  {assignment.submission.grade}/{assignment.max_score}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <Link to={`/dashboard/assignments/${assignment.id}`}>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                          >
                            {profile?.role === 'tutor' ? 'Xem chi tiết' : 
                              submissionStatus === 'pending' ? 'Nộp bài' : 'Xem chi tiết'}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Assignments;
