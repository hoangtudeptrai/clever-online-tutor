import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, ClipboardList, BookOpen, Plus, Search, Calendar, User, CheckCircle, Clock, XCircle, Upload, FileText, Download, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  submittedDate?: string | null;
  status: string;
  submitted?: number;
  total?: number;
  grade?: number | null;
}

interface Student {
  id: number;
  name: string;
  email: string;
  avatar: string;
  enrolledDate: string;
  progress: number;
  lastActive: string;
  status: string;
}

interface Document {
  id: number;
  title: string;
  description: string;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  fileType: string;
}

const CourseDetail = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Mock course data
  const course = {
    id: courseId,
    title: 'Lập trình Web cơ bản',
    description: 'Học HTML, CSS, JavaScript từ cơ bản đến nâng cao',
    instructor: 'ThS. Nguyễn Văn A',
    students: 30,
    lessons: 24,
    progress: 75,
    duration: '12 tuần',
    thumbnail: '/placeholder.svg'
  };

  // Mock assignments data for this course
  const courseAssignments: Assignment[] = [
    {
      id: 1,
      title: 'Bài tập 1: Cơ bản HTML/CSS',
      description: 'Tạo một trang web cơ bản sử dụng HTML và CSS',
      dueDate: '2025-04-15',
      submitted: user?.role === 'teacher' ? 25 : undefined,
      total: user?.role === 'teacher' ? 30 : undefined,
      status: user?.role === 'teacher' ? 'active' : 'submitted',
      submittedDate: user?.role === 'student' ? '2025-04-12' : undefined,
      grade: user?.role === 'student' ? 9.0 : undefined
    },
    {
      id: 2,
      title: 'Bài tập 2: JavaScript DOM',
      description: 'Thao tác DOM với JavaScript',
      dueDate: '2025-04-20',
      submitted: user?.role === 'teacher' ? 18 : undefined,
      total: user?.role === 'teacher' ? 30 : undefined,
      status: user?.role === 'teacher' ? 'active' : 'pending',
      submittedDate: user?.role === 'student' ? null : undefined,
      grade: user?.role === 'student' ? null : undefined
    }
  ];

  // Mock students data for this course
  const courseStudents: Student[] = [
    {
      id: 1,
      name: 'Trần Thị Bình',
      email: 'binh.tran@student.edu.vn',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b589?w=150&h=150&fit=crop&crop=face',
      enrolledDate: '2025-01-15',
      progress: 85,
      lastActive: '2025-01-10',
      status: 'active'
    },
    {
      id: 2,
      name: 'Lê Văn Cường',
      email: 'cuong.le@student.edu.vn',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      enrolledDate: '2025-01-15',
      progress: 60,
      lastActive: '2025-01-08',
      status: 'active'
    }
  ];

  // Mock documents data for this course
  const courseDocuments: Document[] = [
    {
      id: 1,
      title: 'Giáo trình HTML CSS cơ bản',
      description: 'Tài liệu hướng dẫn chi tiết về HTML và CSS',
      fileName: 'html-css-co-ban.pdf',
      fileSize: '2.5 MB',
      uploadedBy: 'ThS. Nguyễn Văn A',
      uploadedAt: '2025-01-05',
      fileType: 'pdf'
    },
    {
      id: 2,
      title: 'Bài tập thực hành JavaScript',
      description: 'Tổng hợp các bài tập JavaScript từ cơ bản đến nâng cao',
      fileName: 'javascript-exercises.docx',
      fileSize: '1.8 MB',
      uploadedBy: 'ThS. Nguyễn Văn A',
      uploadedAt: '2025-01-08',
      fileType: 'docx'
    },
    {
      id: 3,
      title: 'Code mẫu dự án cuối khóa',
      description: 'Source code tham khảo cho dự án cuối khóa',
      fileName: 'project-template.zip',
      fileSize: '5.2 MB',
      uploadedBy: 'ThS. Nguyễn Văn A',
      uploadedAt: '2025-01-12',
      fileType: 'zip'
    }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = () => {
    if (selectedFile) {
      // Thực hiện upload file logic ở đây
      console.log('Uploading file:', selectedFile.name);
      // Reset file selection
      setSelectedFile(null);
      // Reset input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'docx':
      case 'doc':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'zip':
      case 'rar':
        return <FileText className="h-5 w-5 text-yellow-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getAssignmentStatusBadge = (status: string) => {
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

  const getAssignmentStatusIcon = (status: string) => {
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

  const getStudentStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Đang học</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Không hoạt động</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Hoàn thành</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center space-x-4">
          <Link 
            to={user?.role === 'teacher' ? '/dashboard/courses' : '/dashboard/my-courses'}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Quay lại
          </Link>
        </div>

        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="aspect-video w-32 bg-gray-200 rounded-lg">
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-gray-600 mt-2">{course.description}</p>
                <div className="flex items-center space-x-6 mt-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{course.students} học sinh</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span>{course.lessons} bài học</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{course.duration}</span>
                  </div>
                </div>
              </div>
            </div>
            {user?.role === 'teacher' && (
              <Button className="bg-blue-600 hover:bg-blue-700">
                Chỉnh sửa khóa học
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${user?.role === 'teacher' ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="documents">Tài liệu</TabsTrigger>
            <TabsTrigger value="assignments">Bài tập</TabsTrigger>
            {user?.role === 'teacher' && (
              <TabsTrigger value="students">Học sinh</TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tiến độ khóa học</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{course.progress}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tài liệu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{courseDocuments.length}</div>
                  <p className="text-sm text-gray-600">Tổng số tài liệu</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bài tập</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{courseAssignments.length}</div>
                  <p className="text-sm text-gray-600">Tổng số bài tập</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Tài liệu khóa học</h2>
              {user?.role === 'teacher' && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Input
                      id="file-upload"
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" className="cursor-pointer" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Chọn file
                        </span>
                      </Button>
                    </label>
                    {selectedFile && (
                      <Button onClick={handleFileUpload} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Tải lên
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedFile && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">File đã chọn: {selectedFile.name}</p>
                      <p className="text-sm text-gray-600">Kích thước: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedFile(null)}
                      size="sm"
                    >
                      Hủy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm tài liệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courseDocuments.map((document) => (
                <Card key={document.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getFileIcon(document.fileType)}
                        <CardTitle className="text-lg">{document.title}</CardTitle>
                      </div>
                      {user?.role === 'teacher' && (
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <CardDescription>{document.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Tên file:</span>
                        <span className="font-medium">{document.fileName}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Kích thước:</span>
                        <span className="font-medium">{document.fileSize}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Tải lên bởi:</span>
                        <span className="font-medium">{document.uploadedBy}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          Ngày tải:
                        </span>
                        <span className="font-medium">{document.uploadedAt}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Tải xuống
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Bài tập của khóa học</h2>
              {user?.role === 'teacher' && (
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo bài tập mới
                </Button>
              )}
            </div>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm bài tập..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courseAssignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getAssignmentStatusIcon(assignment.status)}
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      </div>
                      {getAssignmentStatusBadge(assignment.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{assignment.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          Hạn nộp:
                        </span>
                        <span className="font-medium">{assignment.dueDate}</span>
                      </div>

                      {user?.role === 'teacher' ? (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Đã nộp:</span>
                          <span className="font-medium">
                            {assignment.submitted}/{assignment.total}
                          </span>
                        </div>
                      ) : (
                        <>
                          {assignment.submittedDate && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Ngày nộp:</span>
                              <span className="font-medium">{assignment.submittedDate}</span>
                            </div>
                          )}
                          {assignment.grade && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Điểm:</span>
                              <span className="font-medium text-blue-600">{assignment.grade}/10</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" className="w-full">
                        {user?.role === 'teacher' ? 'Xem chi tiết' : 
                          assignment.status === 'pending' ? 'Nộp bài' : 'Xem chi tiết'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Students Tab (Teacher only) */}
          {user?.role === 'teacher' && (
            <TabsContent value="students" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Danh sách học sinh</h2>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm học sinh
                </Button>
              </div>

              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm học sinh..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courseStudents.map((student) => (
                  <Card key={student.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <img 
                          src={student.avatar} 
                          alt={student.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <CardTitle className="text-lg">{student.name}</CardTitle>
                          <CardDescription>{student.email}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Trạng thái:</span>
                          {getStudentStatusBadge(student.status)}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Tiến độ:</span>
                            <span className="font-medium">{student.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${student.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Ngày đăng ký:</span>
                          <span className="font-medium">{student.enrolledDate}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Hoạt động cuối:</span>
                          <span className="font-medium">{student.lastActive}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <Button variant="outline" size="sm" className="w-full">
                          Xem hồ sơ
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CourseDetail;
