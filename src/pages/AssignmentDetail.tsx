
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Clock, CheckCircle, XCircle, Eye, Download, FileText, User, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Skeleton } from '@/components/ui/skeleton';

interface AssignmentSubmission {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  student_avatar?: string;
  submitted_at: string | null;
  grade: number | null;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  feedback: string | null;
  submission_files?: {
    id: string;
    file_name: string;
    file_path: string;
    file_size: number;
  }[];
}

interface AssignmentDetailData {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: string;
  course: {
    title: string;
  };
  documents: {
    id: string;
    title: string;
    file_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
  }[];
  submissions: AssignmentSubmission[];
}

const AssignmentDetail = () => {
  const { assignmentId } = useParams();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);

  // Mock data - trong thực tế sẽ lấy từ API
  const assignmentData: AssignmentDetailData = {
    id: assignmentId!,
    title: 'Bài tập 1: Cơ bản HTML/CSS',
    description: 'Tạo một trang web cơ bản sử dụng HTML và CSS. Yêu cầu: sử dụng semantic HTML, responsive design, và CSS Grid/Flexbox.',
    due_date: '2025-04-15T23:59:59',
    status: 'active',
    course: {
      title: 'Lập trình Web cơ bản'
    },
    documents: [
      {
        id: '1',
        title: 'Hướng dẫn HTML cơ bản',
        file_name: 'html-guide.pdf',
        file_path: 'documents/html-guide.pdf',
        file_size: 1200000,
        file_type: 'pdf'
      },
      {
        id: '2',
        title: 'Template CSS',
        file_name: 'template.css',
        file_path: 'documents/template.css',
        file_size: 500000,
        file_type: 'css'
      }
    ],
    submissions: [
      {
        id: '1',
        student_id: 'student1',
        student_name: 'Trần Thị Bình',
        student_email: 'binh.tran@student.edu.vn',
        student_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b589?w=150&h=150&fit=crop&crop=face',
        submitted_at: '2025-04-12T14:30:00',
        grade: 9.0,
        status: 'graded',
        feedback: 'Bài làm tốt, code sạch và responsive design đạt yêu cầu.',
        submission_files: [
          {
            id: 'sub1',
            file_name: 'index.html',
            file_path: 'submissions/index.html',
            file_size: 2500
          },
          {
            id: 'sub2',
            file_name: 'style.css',
            file_path: 'submissions/style.css',
            file_size: 1800
          }
        ]
      },
      {
        id: '2',
        student_id: 'student2',
        student_name: 'Lê Văn Cường',
        student_email: 'cuong.le@student.edu.vn',
        student_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        submitted_at: '2025-04-14T20:15:00',
        grade: null,
        status: 'submitted',
        feedback: null,
        submission_files: [
          {
            id: 'sub3',
            file_name: 'website.zip',
            file_path: 'submissions/website.zip',
            file_size: 15000
          }
        ]
      },
      {
        id: '3',
        student_id: 'student3',
        student_name: 'Nguyễn Thị Dung',
        student_email: 'dung.nguyen@student.edu.vn',
        submitted_at: null,
        grade: null,
        status: 'pending',
        feedback: null,
        submission_files: []
      },
      {
        id: '4',
        student_id: 'student4',
        student_name: 'Phạm Minh Tuấn',
        student_email: 'tuan.pham@student.edu.vn',
        submitted_at: '2025-04-16T08:30:00',
        grade: 7.5,
        status: 'late',
        feedback: 'Nộp muộn nhưng chất lượng bài làm tốt. Cần chú ý về thời hạn.',
        submission_files: [
          {
            id: 'sub4',
            file_name: 'project.html',
            file_path: 'submissions/project.html',
            file_size: 3200
          }
        ]
      }
    ]
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'graded':
        return <Badge className="bg-green-100 text-green-800">Đã chấm</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800">Đã nộp</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Chưa nộp</Badge>;
      case 'late':
        return <Badge className="bg-red-100 text-red-800">Nộp muộn</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'graded':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'submitted':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <XCircle className="h-4 w-4 text-yellow-600" />;
      case 'late':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-600" />;
      case 'html':
        return <FileText className="h-4 w-4 text-orange-600" />;
      case 'css':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'js':
        return <FileText className="h-4 w-4 text-yellow-600" />;
      case 'zip':
        return <FileText className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredSubmissions = assignmentData.submissions.filter(submission => {
    const matchesSearch = submission.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.student_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || submission.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const submissionStats = {
    total: assignmentData.submissions.length,
    submitted: assignmentData.submissions.filter(s => s.submitted_at !== null).length,
    graded: assignmentData.submissions.filter(s => s.grade !== null).length,
    pending: assignmentData.submissions.filter(s => s.status === 'pending').length
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link 
            to="/dashboard/assignments"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Quay lại danh sách bài tập
          </Link>
        </div>

        {/* Assignment Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{assignmentData.title}</CardTitle>
                <CardDescription className="mt-2 flex items-center space-x-4">
                  <span className="flex items-center">
                    <GraduationCap className="h-4 w-4 mr-1" />
                    {assignmentData.course.title}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Hạn nộp: {new Date(assignmentData.due_date).toLocaleString('vi-VN')}
                  </span>
                </CardDescription>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Đang diễn ra</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{assignmentData.description}</p>
            
            {/* Assignment Documents */}
            {assignmentData.documents.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Tài liệu đính kèm</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {assignmentData.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(doc.file_name)}
                        <div>
                          <p className="font-medium text-sm">{doc.title}</p>
                          <p className="text-xs text-gray-500">
                            {doc.file_name} • {formatFileSize(doc.file_size)}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng số học sinh</p>
                  <p className="text-2xl font-bold">{submissionStats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Đã nộp</p>
                  <p className="text-2xl font-bold text-blue-600">{submissionStats.submitted}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Đã chấm</p>
                  <p className="text-2xl font-bold text-green-600">{submissionStats.graded}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Chưa nộp</p>
                  <p className="text-2xl font-bold text-yellow-600">{submissionStats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Danh sách bài nộp</CardTitle>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Input
                    placeholder="Tìm kiếm học sinh..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">Tất cả</option>
                  <option value="graded">Đã chấm</option>
                  <option value="submitted">Đã nộp</option>
                  <option value="pending">Chưa nộp</option>
                  <option value="late">Nộp muộn</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Học sinh</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày nộp</TableHead>
                  <TableHead>Điểm</TableHead>
                  <TableHead>File nộp</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img 
                          src={submission.student_avatar || '/placeholder.svg'} 
                          alt={submission.student_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium">{submission.student_name}</p>
                          <p className="text-sm text-gray-500">{submission.student_email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(submission.status)}
                        {getStatusBadge(submission.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {submission.submitted_at ? (
                        <span className="text-sm">
                          {new Date(submission.submitted_at).toLocaleString('vi-VN')}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {submission.grade !== null ? (
                        <span className="font-medium text-blue-600">
                          {submission.grade}/10
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {submission.submission_files && submission.submission_files.length > 0 ? (
                        <div className="flex items-center space-x-1">
                          {getFileIcon(submission.submission_files[0].file_name)}
                          <span className="text-sm">
                            {submission.submission_files.length} file(s)
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Xem chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Submission Detail Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Chi tiết bài nộp - {selectedSubmission.student_name}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedSubmission(null)}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Trạng thái</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(selectedSubmission.status)}
                      {getStatusBadge(selectedSubmission.status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Điểm số</p>
                    <p className="font-medium mt-1">
                      {selectedSubmission.grade !== null ? `${selectedSubmission.grade}/10` : 'Chưa chấm'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày nộp</p>
                    <p className="font-medium mt-1">
                      {selectedSubmission.submitted_at ? 
                        new Date(selectedSubmission.submitted_at).toLocaleString('vi-VN') : 
                        'Chưa nộp'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium mt-1">{selectedSubmission.student_email}</p>
                  </div>
                </div>

                {/* Submission Files */}
                {selectedSubmission.submission_files && selectedSubmission.submission_files.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">File đã nộp</p>
                    <div className="space-y-2">
                      {selectedSubmission.submission_files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(file.file_name)}
                            <div>
                              <p className="font-medium text-sm">{file.file_name}</p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.file_size)}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Nhận xét của giáo viên</p>
                  <div className="p-3 bg-gray-50 rounded-lg min-h-[100px]">
                    {selectedSubmission.feedback ? (
                      <p className="text-sm">{selectedSubmission.feedback}</p>
                    ) : (
                      <p className="text-sm text-gray-400">Chưa có nhận xét</p>
                    )}
                  </div>
                </div>

                {/* Grade Input */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Điểm số (0-10)</label>
                    <Input 
                      type="number" 
                      min="0" 
                      max="10" 
                      step="0.1"
                      defaultValue={selectedSubmission.grade || ''}
                      placeholder="Nhập điểm"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Cập nhật trạng thái</label>
                    <select 
                      defaultValue={selectedSubmission.status}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="submitted">Đã nộp</option>
                      <option value="graded">Đã chấm</option>
                      <option value="late">Nộp muộn</option>
                    </select>
                  </div>
                </div>

                {/* Feedback Input */}
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Nhận xét</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    rows={4}
                    defaultValue={selectedSubmission.feedback || ''}
                    placeholder="Nhập nhận xét cho học sinh..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Lưu đánh giá
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedSubmission(null)}
                  >
                    Hủy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AssignmentDetail;
