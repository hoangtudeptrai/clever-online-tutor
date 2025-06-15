import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, FileText, Calendar, Clock, Edit, Trash2, Save, Eye, Send, BookCheck, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import AssignmentFilesList from '@/components/AssignmentFilesList';
import SubmissionDetailDialog from '@/components/SubmissionDetailDialog';
import { useAssignmentWithSubmissions } from '@/hooks/useAssignments';
import { useDeleteAssignment } from '@/hooks/useDeleteAssignment';
import { useGradeSubmission } from '@/hooks/useSubmissions';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Define a more specific type for submissions within this component
// to include graded_at, as it seems the hook's type is out of date.
interface AssignmentSubmission {
  id: string;
  status: string;
  submitted_at: string;
  grade?: number | null;
  feedback?: string | null;
  graded_at?: string | null;
  student?: {
    full_name: string;
  };
}

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
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showSubmissionDetail, setShowSubmissionDetail] = useState(false);

  const { data: assignment, isLoading, refetch } = useAssignmentWithSubmissions(assignmentId || '');
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

  const submissions = (assignment.submissions || []) as AssignmentSubmission[];
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
    }, {
      onSuccess: () => {
        refetch();
        setGradingData(prev => {
          const newData = { ...prev };
          delete newData[submissionId];
          return newData;
        });
      }
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
        window.location.reload();
      }
    });
  };

  const handleEditSuccess = () => {
    refetch();
    setShowEditDialog(false);
  };

  const handleSubmissionSuccess = () => {
    refetch();
    setShowSubmissionDialog(false);
  };

  const handleViewSubmission = (submission: any) => {
    setSelectedSubmission(submission);
    setShowSubmissionDetail(true);
  };

  const filteredSubmissions = submissions.filter(submission =>
    submission.student?.full_name?.toLowerCase().includes(searchSubmissions.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard/assignments">
              <Button variant="outline" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
              <p className="text-gray-600 mt-1">Khóa học: 
                <Link to={`/dashboard/courses/${assignment.course?.id}`} className="font-medium text-blue-600 hover:underline ml-1">
                  {assignment.course?.title}
                </Link>
              </p>
            </div>
          </div>
          <div className="flex space-x-2 flex-shrink-0">
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
                  Xóa
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
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue={profile?.role === 'tutor' ? 'submissions' : 'instructions'} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                 {profile?.role === 'tutor' && <TabsTrigger value="submissions">Bài nộp ({submissions.length})</TabsTrigger>}
                <TabsTrigger value="instructions">Hướng dẫn</TabsTrigger>
                <TabsTrigger value="files">File đính kèm</TabsTrigger>
              </TabsList>
              
              <TabsContent value="instructions">
                <Card>
                  <CardHeader>
                    <CardTitle>Nội dung bài tập</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p>{assignment.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="files">
                <AssignmentFilesList 
                  assignmentId={assignment.id} 
                  canDelete={profile?.role === 'tutor'}
                />
              </TabsContent>

              {profile?.role === 'tutor' && (
                <TabsContent value="submissions">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Quản lý bài nộp ({submissions.length})</CardTitle>
                        <Input
                          placeholder="Tìm kiếm học sinh..."
                          value={searchSubmissions}
                          onChange={(e) => setSearchSubmissions(e.target.value)}
                          className="max-w-sm"
                        />
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
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleViewSubmission(submission)}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Xem
                                    </Button>
                                    {submission.status === 'submitted' && (
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button size="sm">
                                            {submission.grade !== null ? 'Sửa điểm' : 'Chấm điểm'}
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
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
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Right Column: Info Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin bài tập</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trạng thái</span>
                  {getStatusBadge(assignment.assignment_status || 'draft')}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Hạn nộp</span>
                  <span className="font-medium">{assignment.due_date ? formatDate(assignment.due_date) : 'Không có'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Điểm tối đa</span>
                  <span className="font-medium">{assignment.max_score || 100}</span>
                </div>
                 <div className="flex justify-between items-center">
                  <span className="text-gray-600">Đã nộp</span>
                  <span className="font-medium">{submittedCount} / {assignment.course?.students_count || submissions.length}</span>
                </div>
                 <div className="flex justify-between items-center">
                  <span className="text-gray-600">Đã chấm</span>
                  <span className="font-medium">{gradedCount} / {submittedCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Người tạo</span>
                  <span className="font-medium">{assignment.creator?.full_name}</span>
                </div>
              </CardContent>
            </Card>

             {/* Student's submission status */}
            {profile?.role === 'student' && (
              <Card>
                <CardHeader>
                  <CardTitle>Bài nộp của bạn</CardTitle>
                </CardHeader>
                <CardContent>
                  {userSubmission ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Trạng thái</span>
                           {getStatusBadge(userSubmission.grade !== null ? 'graded' : 'submitted')}
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Nộp lúc</span>
                          <span className="font-medium">{userSubmission.submitted_at ? formatDate(userSubmission.submitted_at) : 'N/A'}</span>
                        </div>
                        {userSubmission.grade !== null && (
                          <>
                            <div className="flex justify-between items-center text-sm">
                               <span className="text-gray-600">Điểm</span>
                               <span className="font-bold text-lg text-green-600">{userSubmission.grade}/{assignment.max_score || 100}</span>
                            </div>
                          </>
                        )}
                        {userSubmission.feedback && (
                          <div className="text-sm">
                            <Label className="text-gray-600">Nhận xét từ giáo viên:</Label>
                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{userSubmission.feedback}</p>
                          </div>
                        )}
                        <div className="pt-2 border-t">
                          <Button variant="outline" size="sm" onClick={() => handleViewSubmission(userSubmission)} className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết bài nộp
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500 mb-3">Bạn chưa nộp bài tập này.</p>
                        <Button onClick={() => setShowSubmissionDialog(true)}>
                          <Send className="h-4 w-4 mr-2" />
                          Nộp bài ngay
                        </Button>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>

      {/* Dialogs */}
      {showEditDialog && (
        <EditAssignmentDialog
          assignment={assignment}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSuccess={handleEditSuccess}
        />
      )}
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
      {showSubmissionDialog && (
        <StudentSubmissionDialog
          assignmentId={assignment.id}
          assignmentTitle={assignment.title}
          open={showSubmissionDialog}
          onOpenChange={setShowSubmissionDialog}
          onSuccess={handleSubmissionSuccess}
        />
      )}
      {selectedSubmission && (
        <SubmissionDetailDialog
          submission={selectedSubmission}
          assignment={assignment}
          open={showSubmissionDetail}
          onOpenChange={setShowSubmissionDetail}
        />
      )}
    </DashboardLayout>
  );
};

export default AssignmentDetail;
