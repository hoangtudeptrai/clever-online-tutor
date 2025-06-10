
import React, { useState } from 'react';
import { Search, Users, BookOpen, Clock, Star, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import CreateCourseDialog from '@/components/CreateCourseDialog';
import CourseActionsMenu from '@/components/CourseActionsMenu';
import { useCourses } from '@/hooks/useCourses';

const Courses = () => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: courses = [], isLoading, error } = useCourses();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Đang học</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Hoàn thành</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Nháp</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
              {profile?.role === 'tutor' ? 'Quản lý khóa học' : 'Khóa học của tôi'}
            </h1>
            <p className="text-gray-600 mt-2">
              {profile?.role === 'tutor' 
                ? 'Tạo và quản lý các khóa học của bạn'
                : 'Theo dõi tiến độ học tập của bạn'
              }
            </p>
          </div>
          {profile?.role === 'tutor' && <CreateCourseDialog />}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm khóa học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Đang tải dữ liệu...</span>
          </div>
        )}

        {/* Courses Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {searchTerm ? 'Không tìm thấy khóa học nào' : 'Chưa có khóa học nào'}
                </p>
              </div>
            ) : (
              filteredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-video bg-gray-200 rounded-t-lg">
                    <img 
                      src={course.thumbnail || '/placeholder.svg'} 
                      alt={course.title}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(course.status)}
                        {profile?.role === 'tutor' && (
                          <CourseActionsMenu course={course} />
                        )}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {course.description || 'Không có mô tả'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {profile?.role === 'tutor' ? (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center text-gray-600">
                              <Users className="h-4 w-4 mr-1" />
                              Học sinh:
                            </span>
                            <span className="font-medium">{course.students_count || 0}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center text-gray-600">
                              <BookOpen className="h-4 w-4 mr-1" />
                              Bài học:
                            </span>
                            <span className="font-medium">{course.lessons_count || 0}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center text-gray-600">
                              <Clock className="h-4 w-4 mr-1" />
                              Thời lượng:
                            </span>
                            <span className="font-medium">{course.duration || 'Chưa xác định'}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Giảng viên:</span>
                            <span className="font-medium">
                              {course.instructor?.full_name || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center text-gray-600">
                              <Star className="h-4 w-4 mr-1 text-yellow-500" />
                              Đánh giá:
                            </span>
                            <span className="font-medium">N/A</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Tiến độ:</span>
                              <span className="font-medium">0%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `0%` }}
                              ></div>
                            </div>
                            <div className="text-sm text-gray-600">
                              0/{course.lessons_count || 0} bài học
                            </div>
                          </div>
                        </>
                      )}

                      <Link 
                        to={`/dashboard/courses/${course.id}`}
                        className="block"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          {profile?.role === 'tutor' ? 'Quản lý khóa học' : 'Tiếp tục học'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Courses;
