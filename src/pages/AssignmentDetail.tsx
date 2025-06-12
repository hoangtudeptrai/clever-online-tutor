
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, FileText, Calendar, Clock, Edit, Trash2, Save, Eye, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/components/DashboardLayout';
import EditAssignmentDialog from '@/components/EditAssignmentDialog';
import StudentSubmissionDialog from '@/components/StudentSubmissionDialog';
import { useAssignmentWithSubmissions } from '@/hooks/useAssignments';
import { useDeleteAssignment } from '@/hooks/useDeleteAssignment';
import { useGradeSubmission } from '@/hooks/useSubmissions';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AssignmentDetail = () => {
  const { assignmentId } = useParams();
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchSubmissions, setSearchSubmissions] = useState('');
  const [gradingData, setGradingData] = useState<{[key: string]: { grade: string; feedback: string }}>({});
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSubmissionDialog, setShowSubmissionDialog] = useState(false);

  const { data: assignment, isLoading } = useAssignmentWithSubmissions(assignmentId || '');
  const deleteAssignmentMutation = useDeleteAssignment();
  const gradeSubmissionMutation = useGradeSubmission();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!assignment) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Không tìm thấy bài tập</p>
        </div>
      </DashboardLayout>
    );
  }

  const submissions = assignment.submissions || [];
  const submittedCount = submissions.filter(s => s.status === 'submitted' || s.status === 'graded').length;
  const gradedCount = submissions.filter(s => s.grade !== null && s.grade !== undefined).length;

  // Check if current user has submitted
  const userSubmission = submissions.find(s => s.student?.full_name === profile?.full_name);

  const getStatusBadge = (status: string) => {
    const colors = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      graded: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    
    const labels = {
      published: 'Đã xuất bản',
      draft: 'Nháp',
      archived: 'Đã lưu trữ',
      submitted: 'Đã nộp',
      graded: 'Đã chấm',
      pending: 'Chờ nộp'
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const handleGradeSubmission = (submissionId: string) => {
    const data = gradingData[submissionId];
    if (!data || !data.grade) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập điểm số",
        variant: "destructive",
      });
      return;
    }

    gradeSubmissionMutation.mutate({
      submissionId,
      grade: Number(data.grade),
      feedback: data.feedback
    });
  };

  const updateGradingData = (submissionId: string, field: 'grade' | 'feedback', value: string) => {
    setGradingData(prev => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: value
      }
    }));
  };

  const handleDelete = () => {
    deleteAssignmentMutation.mutate(assignmentId!, {
      onSuccess: () => {
        navigate('/dashboard/assignments');
      }
    });
  };

  const filteredSubmissions = submissions.filter(submission =>
    submission.student?.full_name?.toLowerCase().includes(searchSubmissions.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link to="/dashboard/assignments">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
            <p className="text-gray-600 mt-1">{assignment.description}</p>
          </div>
          <div className="flex space-x-2">
            {profile?.role === 'tutor' ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa bài tập
                </Button>
              </>
            ) : !userSubmission && (
              <Button onClick={() => setShowSubmissionDialog(true)}>
                <Send className="h-4 w-4 mr-2" />
                Nộp bài
              </Button>
            )}
          </div>
        </div>

        {/* Assignment Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{submittedCount}</p>
                  <p className="text-sm text-gray-600">Đã nộp</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{gradedCount}</p>
                  <p className="text-sm text-gray-600">Đã chấm</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm font-bold">{assignment.due_date ? formatDate(assignment.due_date) : 'Không có'}</p>
                  <p className="text-sm text-gray-600">Hạn nộp</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{assignment.max_score || 100}</p>
                  <p className="text-sm text-gray-600">Điểm tối đa</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignment Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Chi tiết bài tập</CardTitle>
              {getStatusBadge(assignment.assignment_status || 'draft')}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-600">Khóa học</Label>
                <p className="text-lg">{assignment.course?.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Người tạo</Label>
                <p className="text-lg">{assignment.creator?.full_name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Ngày tạo</Label>
                <p className="text-lg">{formatDate(assignment.created_at)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Lần cập nhật cuối</Label>
                <p className="text-lg">{formatDate(assignment.updated_at)}</p>
              </div>
            </div>

            {/* Student's submission status */}
            {profile?.role === 'student' && (
              <div className="pt-4 border-t">
                <Label className="text-sm font-medium text-gray-600">Trạng thái nộp bài</Label>
                {userSubmission ? (
                  <div className="mt-2 space-y-2">
                    {getStatusBadge(userSubmission.grade !== null ? 'graded' : 'submitted')}
                    <p className="text-sm text-gray-600">
                      Nộp lúc: {userSubmission.submitted_at ? formatDate(userSubmission.submitted_at) : 'N/A'}
                    </p>
                    {userSubmission.grade !== null && (
                      <p className="text-sm font-medium text-green-600">
                        Điểm: {userSubmission.grade}/{assignment.max_score || 100}
                      </p>
                    )}
                    {userSubmission.feedback && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Nhận xét:</Label>
                        <p className="text-sm mt-1">{userSubmission.feedback}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-2">
                    {getStatusBadge('pending')}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submissions Management - Only for tutors */}
        {profile?.role === 'tutor' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Quản lý bài nộp ({submissions.length})</CardTitle>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Tìm kiếm học sinh..."
                    value={searchSubmissions}
                    onChange={(e) => setSearchSubmissions(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredSubmissions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Học sinh</TableHead>
                      <TableHead>Ngày nộp</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Điểm</TableHead>
                      <TableHead>Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">
                          {submission.student?.full_name}
                        </TableCell>
                        <TableCell>
                          {submission.submitted_at ? formatDate(submission.submitted_at) : 'Chưa nộp'}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(submission.grade !== null ? 'graded' : submission.status)}
                        </TableCell>
                        <TableCell>
                          {submission.grade !== null ? `${submission.grade}/${assignment.max_score || 100}` : 'Chưa chấm'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Xem
                            </Button>
                            {submission.status === 'submitted' && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm">
                                    {submission.grade !== null ? 'Chỉnh sửa điểm' : 'Chấm điểm'}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Chấm điểm cho {submission.student?.full_name}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="grade">Điểm số</Label>
                                      <Input
                                        id="grade"
                                        type="number"
                                        min="0"
                                        max={assignment.max_score || 100}
                                        placeholder={`0 - ${assignment.max_score || 100}`}
                                        value={gradingData[submission.id]?.grade || submission.grade || ''}
                                        onChange={(e) => updateGradingData(submission.id, 'grade', e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="feedback">Nhận xét</Label>
                                      <Textarea
                                        id="feedback"
                                        placeholder="Nhập nhận xét cho học sinh..."
                                        value={gradingData[submission.id]?.feedback || submission.feedback || ''}
                                        onChange={(e) => updateGradingData(submission.id, 'feedback', e.target.value)}
                                        rows={4}
                                      />
                                    </div>
                                    <Button 
                                      onClick={() => handleGradeSubmission(submission.id)}
                                      className="w-full"
                                      disabled={gradeSubmissionMutation.isPending}
                                    >
                                      <Save className="h-4 w-4 mr-2" />
                                      {gradeSubmissionMutation.isPending ? 'Đang lưu...' : 'Lưu điểm'}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchSubmissions ? 'Không tìm thấy học sinh nào' : 'Chưa có bài nộp nào'}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Assignment Dialog */}
      {showEditDialog && (
        <EditAssignmentDialog
          assignment={{
            id: assignment.id,
            title: assignment.title,
            description: assignment.description || '',
            course: assignment.course?.title || '',
            dueDate: assignment.due_date || '',
            maxScore: assignment.max_score || 100
          }}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bài tập</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài tập "{assignment.title}"? 
              Hành động này không thể hoàn tác và sẽ xóa tất cả bài nộp của học sinh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteAssignmentMutation.isPending}
            >
              {deleteAssignmentMutation.isPending ? 'Đang xóa...' : 'Xóa bài tập'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Student Submission Dialog */}
      {showSubmissionDialog && (
        <StudentSubmissionDialog
          assignmentId={assignment.id}
          assignmentTitle={assignment.title}
          open={showSubmissionDialog}
          onOpenChange={setShowSubmissionDialog}
        />
      )}
    </DashboardLayout>
  );
};

export default AssignmentDetail;
