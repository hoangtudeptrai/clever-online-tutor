
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Users, BookOpen, Clock, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import StudentsManagement from '@/components/StudentsManagement';
import { Link } from 'react-router-dom';

const CourseDetail = () => {
  const { courseId } = useParams();
  const { user } = useAuth();

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
                  <CardTitle>Bài tập của khóa học</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Danh sách bài tập trong khóa học này...</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tài liệu khóa học</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Tài liệu liên quan đến khóa học...</p>
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
                  <CardTitle>Bài tập</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Bài tập được giao trong khóa học...</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tài liệu học tập</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Tài liệu tham khảo cho khóa học...</p>
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
