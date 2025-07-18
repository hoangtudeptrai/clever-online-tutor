
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DashboardLayout from '@/components/DashboardLayout';
import CreateAssignmentDialog from '@/components/CreateAssignmentDialog';
import AssignmentActionsMenu from '@/components/AssignmentActionsMenu';
import { useAssignments } from '@/hooks/useAssignments';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Assignments = () => {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data: assignments, isLoading } = useAssignments();

  // Get submission status for students
  const { data: submissions } = useQuery({
    queryKey: ['student-submissions', profile?.id],
    queryFn: async () => {
      if (!profile?.id || profile.role !== 'student') return [];
      
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('assignment_id, status, submitted_at, grade')
        .eq('student_id', profile.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id && profile.role === 'student'
  });

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

  const getSubmissionStatusBadge = (assignmentId: string) => {
    const submission = submissions?.find(s => s.assignment_id === assignmentId);
    
    if (!submission) {
      return <Badge variant="outline">Chưa nộp</Badge>;
    }
    
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      submitted: 'bg-blue-100 text-blue-800',
      graded: 'bg-green-100 text-green-800',
      late: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      pending: 'Chờ chấm điểm',
      submitted: 'Đã nộp',
      graded: 'Đã chấm điểm',
      late: 'Nộp muộn'
    };
    
    return (
      <Badge className={colors[submission.status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {labels[submission.status as keyof typeof labels] || submission.status}
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

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Tiêu đề</TableHead>
                  <TableHead>Khóa học</TableHead>
                  <TableHead>Hạn nộp</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  {profile?.role === 'student' && <TableHead>Tình trạng nộp bài</TableHead>}
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments && filteredAssignments.length > 0 ? (
                  filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        <Link
                          to={`/dashboard/assignments/${assignment.id}`}
                          className="hover:underline"
                        >
                          {assignment.title}
                        </Link>
                      </TableCell>
                      <TableCell>{assignment.course?.title || 'N/A'}</TableCell>
                      <TableCell>
                        {assignment.due_date ? formatDate(assignment.due_date) : 'Không có'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(assignment.assignment_status || 'draft')}
                      </TableCell>
                      {profile?.role === 'student' && (
                        <TableCell>
                          {getSubmissionStatusBadge(assignment.id)}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        {profile?.role === 'tutor' ? (
                          <AssignmentActionsMenu assignment={assignment} />
                        ) : (
                          <Link to={`/dashboard/assignments/${assignment.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Xem chi tiết
                            </Button>
                          </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={profile?.role === 'student' ? 6 : 5} className="h-24 text-center">
                      {searchQuery
                        ? 'Không tìm thấy bài tập nào phù hợp.'
                        : 'Chưa có bài tập nào.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Assignments;
