
import React, { useState } from 'react';
import { Plus, Search, Filter, Calendar, User, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { useAssignments } from '@/hooks/useAssignments';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

const Assignments = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: assignments, isLoading, error } = useAssignments();

  const getStatusBadge = (status: string) => {
    if (user?.role === 'teacher') {
      switch (status) {
        case 'active':
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
        case 'graded':
          return <Badge className="bg-green-100 text-green-800">Đã nộp</Badge>;
        case 'pending':
          return <Badge className="bg-yellow-100 text-yellow-800">Chưa nộp</Badge>;
        case 'late':
          return <Badge className="bg-red-100 text-red-800">Nộp muộn</Badge>;
        default:
          return <Badge>{status}</Badge>;
      }
    }
  };

  const getStatusIcon = (status: string) => {
    if (user?.role === 'teacher') {
      switch (status) {
        case 'completed':
          return <CheckCircle className="h-5 w-5 text-green-600" />;
        case 'active':
          return <Clock className="h-5 w-5 text-blue-600" />;
        case 'draft':
          return <XCircle className="h-5 w-5 text-gray-600" />;
        default:
          return <Clock className="h-5 w-5" />;
      }
    } else {
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

  const filteredAssignments = assignments?.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.course?.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.role === 'teacher' ? 'Quản lý bài tập' : 'Bài tập của tôi'}
              </h1>
              <p className="text-gray-600 mt-2">
                {user?.role === 'teacher' 
                  ? 'Tạo và quản lý bài tập cho học sinh'
                  : 'Theo dõi và nộp bài tập được giao'
                }
              </p>
            </div>
            {user?.role === 'teacher' && (
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Tạo bài tập mới
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Lỗi khi tải dữ liệu bài tập</p>
            <p className="text-gray-600">Vui lòng thử lại sau</p>
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
              {user?.role === 'teacher' ? 'Quản lý bài tập' : 'Bài tập của tôi'}
            </h1>
            <p className="text-gray-600 mt-2">
              {user?.role === 'teacher' 
                ? 'Tạo và quản lý bài tập cho học sinh'
                : 'Theo dõi và nộp bài tập được giao'
              }
            </p>
          </div>
          {user?.role === 'teacher' && (
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Tạo bài tập mới
            </Button>
          )}
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

        {/* Assignments Grid */}
        {filteredAssignments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {searchTerm ? 'Không tìm thấy bài tập nào' : 'Chưa có bài tập nào'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map((assignment) => {
              const submissionStatus = assignment.submission?.status || 'pending';
              const displayStatus = user?.role === 'teacher' ? assignment.status : submissionStatus;
              
              return (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(displayStatus)}
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      </div>
                      {getStatusBadge(displayStatus)}
                    </div>
                    <CardDescription className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{assignment.course?.title}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{assignment.description}</p>
                    
                    <div className="space-y-3">
                      {assignment.due_date && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            Hạn nộp:
                          </span>
                          <span className="font-medium">
                            {new Date(assignment.due_date).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      )}

                      {user?.role === 'teacher' ? (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Đã nộp:</span>
                          <span className="font-medium">
                            {assignment.submissions_count || 0}/{assignment.total_students || 0}
                          </span>
                        </div>
                      ) : (
                        <>
                          {assignment.submission?.submitted_at && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Ngày nộp:</span>
                              <span className="font-medium">
                                {new Date(assignment.submission.submitted_at).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          )}
                          {assignment.submission?.grade && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Điểm:</span>
                              <span className="font-medium text-blue-600">
                                {assignment.submission.grade}/10
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <Link to={user?.role === 'teacher' ? `/dashboard/assignments/${assignment.id}` : '#'}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                        >
                          {user?.role === 'teacher' ? 'Xem chi tiết' : 
                            submissionStatus === 'pending' ? 'Nộp bài' : 'Xem chi tiết'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Assignments;
