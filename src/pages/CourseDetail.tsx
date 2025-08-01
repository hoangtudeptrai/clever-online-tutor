import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Users, BookOpen, Clock, Edit, Trash2, Plus, FileText, Calendar, Eye, Download, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import StudentsManagement from '@/components/StudentsManagement';
import CreateAssignmentDialog from '@/components/CreateAssignmentDialog';
import CreateDocumentDialog from '@/components/CreateDocumentDialog';
import AssignmentActionsMenu from '@/components/AssignmentActionsMenu';
import DocumentActionsMenu from '@/components/DocumentActionsMenu';
import { Link } from 'react-router-dom';
import { useCourses } from '@/hooks/useCourses';
import { useAssignments } from '@/hooks/useAssignments';
import { useCourseAssignments } from '@/hooks/useCourseAssignments';
import { useDocuments } from '@/hooks/useDocuments';
import { useCourseStudents } from '@/hooks/useStudents';
import { useToast } from '@/hooks/use-toast';
import { useJoinCourse } from '@/hooks/useJoinCourse';
import { useCourseAssignmentSubmissions } from '@/hooks/useCourseAssignmentSubmissions';

const CourseDetail = () => {
  const { courseId } = useParams();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [searchAssignments, setSearchAssignments] = useState('');
  const [searchDocuments, setSearchDocuments] = useState('');
  const joinCourseMutation = useJoinCourse();
  const [joining, setJoining] = useState(false);

  // Fetch real data from database
  const { data: courses } = useCourses();
  const { data: courseAssignments, isLoading: assignmentsLoading } = useCourseAssignments(courseId || '');
  const { data: documents } = useDocuments();
  const { data: courseStudents } = useCourseStudents(courseId || '');
  const { data: assignmentSubmissions = [] } = useCourseAssignmentSubmissions(courseId || '');

  // Find current course
  const course = courses?.find(c => c.id === courseId);

  // Filter documents for this course
  const courseDocuments = documents?.filter(d => d.course_id === courseId) || [];

  // Calculate course statistics
  const studentsCount = courseStudents?.length || 0;
  const assignmentsCount = courseAssignments?.length || 0;
  const lessonsCount = course?.lessons_count || 0;
  const avgProgress = courseStudents?.reduce((acc, student) => acc + (student.progress || 0), 0) / (studentsCount || 1) || 0;

  const isStudentEnrolled = profile?.role === 'student' && courseStudents?.some(student => student.id === profile.id);

  const handleJoinCourse = async () => {
    if (!courseId) return;
    setJoining(true);
    try {
      await joinCourseMutation.mutateAsync(courseId);
      toast({ title: 'Thành công', description: 'Bạn đã tham gia khóa học!' });
      // Refetch lại danh sách học sinh để cập nhật giao diện
      if (typeof window !== 'undefined') window.location.reload(); // hoặc refetch hook nếu có
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể tham gia khóa học', variant: 'destructive' });
    } finally {
      setJoining(false);
    }
  };

  // Loading state (nên check cả assignments và students)
  if (assignmentsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Đang tải dữ liệu bài tập...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Không tìm thấy khóa học</p>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      active: 'Đang mở',
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

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'video':
      case 'mp4':
      case 'avi':
        return <Eye className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-blue-500" />;
    }
  };

  // Filtered for this course only
  const filteredAssignments = (courseAssignments || []).filter(assignment =>
    assignment.title.toLowerCase().includes(searchAssignments.toLowerCase()) ||
    (assignment.description && assignment.description.toLowerCase().includes(searchAssignments.toLowerCase()))
  );

  const filteredDocuments = courseDocuments.filter(document =>
    document.title.toLowerCase().includes(searchDocuments.toLowerCase()) ||
    (document.description && document.description.toLowerCase().includes(searchDocuments.toLowerCase()))
  );

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link to="/dashboard/courses">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-600 mt-1">{course.description}</p>
            {/* Nút tham gia cho học sinh */}
            {profile?.role === 'student' && (
              <div className="my-4">
                {isStudentEnrolled ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Đã tham gia
                  </Badge>
                ) : (
                  <Button
                    variant="default"
                    onClick={handleJoinCourse}
                    disabled={joining}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {joining ? 'Đang tham gia...' : 'Tham gia khóa học'}
                  </Button>
                )}
              </div>
            )}
          </div>
          {profile?.role === 'tutor' && (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa khóa học
              </Button>
            </div>
          )}
        </div>

        {/* Course Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{studentsCount}</p>
                  <p className="text-sm text-gray-600">Học sinh</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{lessonsCount}</p>
                  <p className="text-sm text-gray-600">Bài học</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{assignmentsCount}</p>
                  <p className="text-sm text-gray-600">Bài tập</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold">{Math.round(avgProgress)}%</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">Tiến độ</p>
                  <p className="text-sm text-gray-600">Trung bình</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Management Tabs */}
        {profile?.role === 'tutor' ? (
          <Tabs defaultValue="students" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="students">Học sinh</TabsTrigger>
              <TabsTrigger value="lessons">Bài học</TabsTrigger>
              <TabsTrigger value="assignments">Bài tập ({assignmentsCount})</TabsTrigger>
              <TabsTrigger value="documents">Tài liệu</TabsTrigger>
              <TabsTrigger value="grades">Bảng điểm</TabsTrigger>
            </TabsList>
            
            <TabsContent value="students" className="space-y-4">
              <StudentsManagement />
            </TabsContent>
            
            <TabsContent value="lessons" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quản lý bài học</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Chức năng quản lý bài học sẽ được phát triển...</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="assignments" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Quản lý bài tập ({assignmentsCount})</CardTitle>
                    <CreateAssignmentDialog courseId={courseId} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search */}
                  <div className="flex items-center space-x-4">
                    <Input
                      placeholder="Tìm kiếm bài tập..."
                      value={searchAssignments}
                      onChange={(e) => setSearchAssignments(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>

                  {/* Assignments Table */}
                  {filteredAssignments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tên bài tập</TableHead>
                          <TableHead>Mô tả</TableHead>
                          <TableHead>Hạn nộp</TableHead>
                          <TableHead>Điểm tối đa</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Ngày tạo</TableHead>
                          <TableHead className="w-[100px]">Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAssignments.map((assignment) => (
                          <TableRow key={assignment.id}>
                            <TableCell className="font-medium">
                              <Link 
                                to={`/dashboard/assignments/${assignment.id}`}
                                className="text-blue-600 hover:underline"
                              >
                                {assignment.title}
                              </Link>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{assignment.description}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>{assignment.due_date ? formatDate(assignment.due_date) : 'Không có'}</span>
                              </div>
                            </TableCell>
                            <TableCell>{assignment.max_score || 100} điểm</TableCell>
                            <TableCell>{getStatusBadge(assignment.assignment_status || 'draft')}</TableCell>
                            <TableCell>{formatDate(assignment.created_at)}</TableCell>
                            <TableCell>
                              <AssignmentActionsMenu assignment={assignment} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {searchAssignments ? 'Không tìm thấy bài tập nào' : 'Chưa có bài tập nào'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Quản lý tài liệu ({courseDocuments.length})</CardTitle>
                    <CreateDocumentDialog />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search */}
                  <div className="flex items-center space-x-4">
                    <Input
                      placeholder="Tìm kiếm tài liệu..."
                      value={searchDocuments}
                      onChange={(e) => setSearchDocuments(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>

                  {/* Documents Table */}
                  {filteredDocuments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tên tài liệu</TableHead>
                          <TableHead>Mô tả</TableHead>
                          <TableHead>Loại file</TableHead>
                          <TableHead>Kích thước</TableHead>
                          <TableHead>Người tạo</TableHead>
                          <TableHead>Ngày tạo</TableHead>
                          <TableHead className="w-[100px]">Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDocuments.map((document) => (
                          <TableRow key={document.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getFileIcon(document.file_type || '')}
                                <span className="font-medium">{document.title}</span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{document.description}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{document.file_type || 'unknown'}</Badge>
                            </TableCell>
                            <TableCell>{formatFileSize(document.file_size)}</TableCell>
                            <TableCell>{document.uploader?.full_name || 'Không xác định'}</TableCell>
                            <TableCell>{formatDate(document.created_at)}</TableCell>
                            <TableCell>
                              <DocumentActionsMenu document={document} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {searchDocuments ? 'Không tìm thấy tài liệu nào' : 'Chưa có tài liệu nào'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grades" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bảng điểm sinh viên</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Họ tên</TableHead>
                          {courseAssignments?.map(a => (
                            <TableHead key={a.id}>{a.title}</TableHead>
                          ))}
                          <TableHead>Điểm TB</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {courseStudents?.map(student => {
                          let total = 0;
                          let count = 0;
                          return (
                            <TableRow key={student.id}>
                              <TableCell>{student.full_name}</TableCell>
                              {courseAssignments?.map(a => {
                                // Tìm submissions của assignment này
                                const assignmentSub = assignmentSubmissions.find(as => as.assignment_id === a.id);
                                const submission = assignmentSub?.submissions.find(s => s.student_id === student.id);
                                let cell = null;
                                if (!submission) {
                                  cell = <span className="text-gray-400">Chưa nộp</span>;
                                } else if (submission.grade !== undefined && submission.grade !== null) {
                                  cell = <span className="font-bold text-green-700">{submission.grade}</span>;
                                  total += submission.grade;
                                  count++;
                                } else {
                                  cell = <span className="text-yellow-600">Chờ chấm</span>;
                                }
                                return <TableCell key={a.id + student.id}>{cell}</TableCell>;
                              })}
                              <TableCell>
                                {count > 0 ? (total / count).toFixed(1) : '-'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          // ... keep existing code (student view tabs)
          <Tabs defaultValue="lessons" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="lessons">Bài học</TabsTrigger>
              <TabsTrigger value="assignments">Bài tập</TabsTrigger>
              <TabsTrigger value="documents">Tài liệu</TabsTrigger>
            </TabsList>
            
            <TabsContent value="lessons" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Danh sách bài học</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Nội dung bài học sẽ hiển thị ở đây...</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="assignments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bài tập của khóa học ({courseAssignments?.filter(a => a.assignment_status === 'published').length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search */}
                  <Input
                    placeholder="Tìm kiếm bài tập..."
                    value={searchAssignments}
                    onChange={(e) => setSearchAssignments(e.target.value)}
                    className="max-w-sm"
                  />

                  {/* Assignments Grid for Students */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(filteredAssignments.filter(a => a.assignment_status === 'published')).map((assignment) => (
                      <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg">{assignment.title}</CardTitle>
                            {getStatusBadge(assignment.assignment_status || 'draft')}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-4">{assignment.description}</p>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Hạn nộp:</span>
                              <span className="font-medium">{assignment.due_date ? formatDate(assignment.due_date) : 'Không có'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Điểm tối đa:</span>
                              <span className="font-medium">{assignment.max_score || 100} điểm</span>
                            </div>
                          </div>

                          <div className="flex space-x-2 mt-4">
                            <Button variant="outline" size="sm" className="flex-1" asChild>
                              <Link to={`/dashboard/assignments/${assignment.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                Xem chi tiết
                              </Link>
                            </Button>
                            <Button size="sm" className="flex-1">
                              Nộp bài
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredAssignments.filter(a => a.assignment_status === 'published').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      {searchAssignments ? 'Không tìm thấy bài tập nào' : 'Không có bài tập nào được giao'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tài liệu học tập ({courseDocuments.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search */}
                  <Input
                    placeholder="Tìm kiếm tài liệu..."
                    value={searchDocuments}
                    onChange={(e) => setSearchDocuments(e.target.value)}
                    className="max-w-sm"
                  />

                  {/* Documents Grid for Students */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDocuments.map((document) => (
                      <Card key={document.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              {getFileIcon(document.file_type || '')}
                              <CardTitle className="text-lg">{document.title}</CardTitle>
                            </div>
                            <Badge variant="outline">{document.file_type || 'unknown'}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-4">{document.description}</p>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Kích thước:</span>
                              <span className="font-medium">{formatFileSize(document.file_size)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Người tạo:</span>
                              <span className="font-medium">{document.uploader?.full_name || 'Không xác định'}</span>
                            </div>
                          </div>

                          <div className="flex space-x-2 mt-4">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="h-4 w-4 mr-1" />
                              Xem
                            </Button>
                            <Button size="sm" className="flex-1">
                              <Download className="h-4 w-4 mr-1" />
                              Tải xuống
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredDocuments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      {searchDocuments ? 'Không tìm thấy tài liệu nào' : 'Không có tài liệu nào'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CourseDetail;
