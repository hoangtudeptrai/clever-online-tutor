import React, { useState } from 'react';
import { Plus, Search, Users, BookOpen, Clock, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';

interface TeacherCourse {
  id: number;
  title: string;
  description: string;
  students: number;
  lessons: number;
  progress: number;
  status: string;
  thumbnail: string;
  duration: string;
}

interface StudentCourse {
  id: number;
  title: string;
  description: string;
  instructor: string;
  progress: number;
  lessons: number;
  completedLessons: number;
  status: string;
  thumbnail: string;
  rating: number;
  nextLesson: string | null;
}

const Courses = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const teacherCourses: TeacherCourse[] = [
    {
      id: 1,
      title: 'Lập trình Web cơ bản',
      description: 'Học HTML, CSS, JavaScript từ cơ bản đến nâng cao',
      students: 30,
      lessons: 24,
      progress: 75,
      status: 'active',
      thumbnail: '/placeholder.svg',
      duration: '12 tuần'
    },
    {
      id: 2,
      title: 'React Nâng cao',
      description: 'Xây dựng ứng dụng web với React và các thư viện liên quan',
      students: 25,
      lessons: 18,
      progress: 60,
      status: 'active',
      thumbnail: '/placeholder.svg',
      duration: '10 tuần'
    },
    {
      id: 3,
      title: 'Node.js Backend',
      description: 'Phát triển backend API với Node.js và Express',
      students: 20,
      lessons: 20,
      progress: 90,
      status: 'completed',
      thumbnail: '/placeholder.svg',
      duration: '8 tuần'
    },
    {
      id: 4,
      title: 'Database Design',
      description: 'Thiết kế cơ sở dữ liệu hiệu quả',
      students: 0,
      lessons: 15,
      progress: 0,
      status: 'draft',
      thumbnail: '/placeholder.svg',
      duration: '6 tuần'
    }
  ];

  const studentCourses: StudentCourse[] = [
    {
      id: 1,
      title: 'Lập trình Web cơ bản',
      description: 'Học HTML, CSS, JavaScript từ cơ bản đến nâng cao',
      instructor: 'ThS. Nguyễn Văn A',
      progress: 85,
      lessons: 24,
      completedLessons: 20,
      status: 'enrolled',
      thumbnail: '/placeholder.svg',
      rating: 4.8,
      nextLesson: 'Bài 21: Responsive Design'
    },
    {
      id: 2,
      title: 'React Nâng cao',
      description: 'Xây dựng ứng dụng web với React và các thư viện liên quan',
      instructor: 'TS. Trần Thị B',
      progress: 45,
      lessons: 18,
      completedLessons: 8,
      status: 'enrolled',
      thumbnail: '/placeholder.svg',
      rating: 4.9,
      nextLesson: 'Bài 9: React Router'
    },
    {
      id: 3,
      title: 'Node.js Backend',
      description: 'Phát triển backend API với Node.js và Express',
      instructor: 'ThS. Lê Văn C',
      progress: 100,
      lessons: 20,
      completedLessons: 20,
      status: 'completed',
      thumbnail: '/placeholder.svg',
      rating: 4.7,
      nextLesson: null
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'enrolled':
        return <Badge className="bg-green-100 text-green-800">Đang học</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Hoàn thành</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Nháp</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const courses = user?.role === 'teacher' ? teacherCourses : studentCourses;

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === 'teacher' ? 'Quản lý khóa học' : 'Khóa học của tôi'}
            </h1>
            <p className="text-gray-600 mt-2">
              {user?.role === 'teacher' 
                ? 'Tạo và quản lý các khóa học của bạn'
                : 'Theo dõi tiến độ học tập của bạn'
              }
            </p>
          </div>
          {user?.role === 'teacher' && (
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Tạo khóa học mới
            </Button>
          )}
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

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="aspect-video bg-gray-200 rounded-t-lg">
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  {getStatusBadge(course.status)}
                </div>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user?.role === 'teacher' ? (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-gray-600">
                          <Users className="h-4 w-4 mr-1" />
                          Học sinh:
                        </span>
                        <span className="font-medium">{(course as TeacherCourse).students}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-gray-600">
                          <BookOpen className="h-4 w-4 mr-1" />
                          Bài học:
                        </span>
                        <span className="font-medium">{course.lessons}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          Thời lượng:
                        </span>
                        <span className="font-medium">{(course as TeacherCourse).duration}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Giảng viên:</span>
                        <span className="font-medium">{(course as StudentCourse).instructor}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-gray-600">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          Đánh giá:
                        </span>
                        <span className="font-medium">{(course as StudentCourse).rating}/5</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Tiến độ:</span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {(course as StudentCourse).completedLessons}/{course.lessons} bài học
                        </div>
                      </div>
                      {(course as StudentCourse).nextLesson && (
                        <div className="text-sm">
                          <span className="text-gray-600">Bài tiếp theo: </span>
                          <span className="font-medium text-blue-600">{(course as StudentCourse).nextLesson}</span>
                        </div>
                      )}
                    </>
                  )}

                  <Link 
                    to={`/dashboard/courses/${course.id}`}
                    className="block"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      {user?.role === 'teacher' ? 'Quản lý khóa học' : 'Tiếp tục học'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Courses;
