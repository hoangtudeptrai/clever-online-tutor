
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Users, BookOpen, Clock, Edit, Trash2, Plus, FileText, Calendar, Eye, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const CourseDetail = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [searchAssignments, setSearchAssignments] = useState('');
  const [searchDocuments, setSearchDocuments] = useState('');

  // Mock data cho khóa học
  const course = {
    id: parseInt(courseId || '1'),
    title: 'Lập trình Web cơ bản',
    description: 'Học HTML, CSS, JavaScript từ cơ bản đến nâng cao',
    instructor: 'ThS. Nguyễn Văn A',
    students: 30,
    lessons: 24,
    progress: 75,
    status: 'active',
    thumbnail: '/placeholder.svg',
    duration: '12 tuần',
    startDate: '2025-01-15',
    endDate: '2025-04-15'
  };

  // Mock data cho bài tập của khóa học - updated to match interface
  const courseAssignments = [
    {
      id: '1',
      title: 'Bài tập HTML cơ bản',
      description: 'Tạo trang web đơn giản với HTML',
      course: {
        title: course.title
      },
      due_date: '2025-04-15',
      maxGrade: 10,
      submissions: 25,
      status: 'active'
    },
    {
      id: '2',
      title: 'Thực hành CSS Flexbox',
      description: 'Xây dựng layout responsive với Flexbox',
      course: {
        title: course.title
      },
      due_date: '2025-04-20',
      maxGrade: 10,
      submissions: 18,
      status: 'active'
    },
    {
      id: '3',
      title: 'Dự án JavaScript',
      description: 'Tạo ứng dụng web tương tác với JavaScript',
      course: {
        title: course.title
      },
      due_date: '2025-04-25',
      maxGrade: 15,
      submissions: 0,
      status: 'draft'
    }
  ];

  // Mock data cho tài liệu của khóa học - updated to match interface
  const courseDocuments = [
    {
      id: '1',
      title: 'Giáo trình HTML cơ bản',
      description: 'Tài liệu hướng dẫn HTML từ cơ bản đến nâng cao',
      file_type: 'pdf',
      course: {
        title: course.title
      },
      size: '2.5 MB',
      downloads: 245,
      uploadDate: '2025-03-15'
    },
    {
      id: '2',
      title: 'Video bài giảng CSS',
      description: 'Video hướng dẫn CSS cho người mới bắt đầu',
      file_type: 'video',
      course: {
        title: course.title
      },
      size: '125 MB',
      downloads: 189,
      uploadDate: '2025-03-20'
    },
    {
      id: '3',
      title: 'Slide JavaScript ES6',
      description: 'Slide trình bày về JavaScript ES6+',
      file_type: 'pptx',
      course: {
        title: course.title
      },
      size: '8.2 MB',
      downloads: 167,
      uploadDate: '2025-03-25'
    }
  ];

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    
    const labels = {
      active: 'Đang mở',
      draft: 'Nháp',
      completed: 'Hoàn thành'
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

  const filteredAssignments = courseAssignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchAssignments.toLowerCase()) ||
    assignment.description.toLowerCase().includes(searchAssignments.toLowerCase())
  );

  const filteredDocuments = courseDocuments.filter(doc =>
    doc.title.toLowerCase().includes(searchDocuments.toLowerCase()) ||
    doc.file_type.toLowerCase().includes(searchDocuments.toLowerCase())
  );

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
          </div>
          {user?.role === 'teacher' && (
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
                  <p className="text-2xl font-bold">{course.students}</p>
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
                  <p className="text-2xl font-bold">{course.lessons}</p>
                  <p className="text-sm text-gray-600">Bài học</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{course.duration}</p>
                  <p className="text-sm text-gray-600">Thời lượng</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold">{course.progress}%</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">Tiến độ</p>
                  <p className="text-sm text-gray-600">Hoàn thành</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Management Tabs */}
        {user?.role === 'teacher' ? (
          <Tabs defaultValue="students" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="students">Học sinh</TabsTrigger>
              <TabsTrigger value="lessons">Bài học</TabsTrigger>
              <TabsTrigger value="assignments">Bài tập</TabsTrigger>
              <TabsTrigger value="documents">Tài liệu</TabsTrigger>
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
                    <CardTitle>Quản lý bài tập</CardTitle>
                    <CreateAssignmentDialog />
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
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tên bài tập</TableHead>
                          <TableHead>Mô tả</TableHead>
                          <TableHead>Hạn nộp</TableHead>
                          <TableHead>Điểm tối đa</TableHead>
                          <TableHead>Bài nộp</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead className="w-[100px]">Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAssignments.map((assignment) => (
                          <TableRow key={assignment.id}>
                            <TableCell className="font-medium">{assignment.title}</TableCell>
                            <TableCell className="max-w-xs truncate">{assignment.description}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>{assignment.due_date}</span>
                              </div>
                            </TableCell>
                            <TableCell>{assignment.maxGrade} điểm</TableCell>
                            <TableCell>{assignment.submissions}/{course.students}</TableCell>
                            <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                            <TableCell>
                              <AssignmentActionsMenu assignment={assignment} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {filteredAssignments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Không tìm thấy bài tập nào
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Quản lý tài liệu</CardTitle>
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
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tên tài liệu</TableHead>
                          <TableHead>Mô tả</TableHead>
                          <TableHead>Danh mục</TableHead>
                          <TableHead>Kích thước</TableHead>
                          <TableHead>Lượt tải</TableHead>
                          <TableHead>Ngày tải lên</TableHead>
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
                              <Badge variant="outline">{document.file_type}</Badge>
                            </TableCell>
                            <TableCell>{document.size}</TableCell>
                            <TableCell>{document.downloads}</TableCell>
                            <TableCell>{document.uploadDate}</TableCell>
                            <TableCell>
                              <DocumentActionsMenu document={document} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {filteredDocuments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Không tìm thấy tài liệu nào
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
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
                  <CardTitle>Bài tập của khóa học</CardTitle>
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
                    {filteredAssignments.filter(a => a.status === 'active').map((assignment) => (
                      <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg">{assignment.title}</CardTitle>
                            {getStatusBadge(assignment.status)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-4">{assignment.description}</p>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Hạn nộp:</span>
                              <span className="font-medium">{assignment.due_date}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Điểm tối đa:</span>
                              <span className="font-medium">{assignment.maxGrade} điểm</span>
                            </div>
                          </div>

                          <div className="flex space-x-2 mt-4">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="h-4 w-4 mr-1" />
                              Xem chi tiết
                            </Button>
                            <Button size="sm" className="flex-1">
                              Nộp bài
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredAssignments.filter(a => a.status === 'active').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Không có bài tập nào được giao
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tài liệu học tập</CardTitle>
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
                            <Badge variant="outline">{document.file_type}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-4">{document.description}</p>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Kích thước:</span>
                              <span className="font-medium">{document.size}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Lượt tải:</span>
                              <span className="font-medium">{document.downloads}</span>
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
                      Không có tài liệu nào
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
