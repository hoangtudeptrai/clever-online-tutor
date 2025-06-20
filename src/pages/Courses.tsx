import React, { useEffect, useState } from 'react';
import { Search, Users, BookOpen, Clock, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import CreateCourseDialog from '@/components/CreateCourseDialog';
import CourseActionsMenu from '@/components/CourseActionsMenu';
import { getApi } from '@/utils/api';
import { COURSES_API, FILES_API } from '@/components/api-url';
import { Course, StudentCourse, TeacherCourse } from '@/types/course';

const Courses = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [row, setRow] = useState<Course[]>([]);

  const teacherCourses: TeacherCourse[] = row.map(course => ({
    ...course,
    id: course.id,
    students_count: course.students_count || 0,
    lessons_count: course.lessons_count || 0,
    progress: 0,
    status: 'draft',
    thumbnail: course.thumbnail || '/placeholder.svg',
    duration: course.duration || ''
  }));
  const studentCourses: StudentCourse[] = row.map(course => ({
    ...course,
    id: course.id,
    instructor: course.instructor_id || '',
    progress: 0,
    lessons: 0,
    completedLessons: 0,
    status: 'enrolled',
    thumbnail: course.thumbnail || '/placeholder.svg',
    rating: 0,
    nextLesson: null
  }));

  useEffect(() => {
    getCourses();
  }, []);

  const getCourses = async () => {
    try {
      const res = await getApi(`${COURSES_API.GET_ALL}`);

      if (!res?.data) return;

      const coursesWithThumbnails = await Promise.all(
        res.data.map(async (course) => {
          const thumbnail = await getCourseThumbnail(course.thumbnail || '');
          return { ...course, thumbnail };
        })
      );

      setRow(coursesWithThumbnails);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setRow([]);
    }
  };

  const getCourseThumbnail = async (thumbnail: string) => {
    if (!thumbnail) return '/placeholder.svg';
    try {
      const res = await getApi(`${FILES_API.GET_FILE(thumbnail)}`);
      return res?.data?.url || '/placeholder.svg';
    } catch (error) {
      console.error('Error fetching thumbnail:', error);
      return '/placeholder.svg';
    }
  }

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
              {user?.role === 'teacher' ? 'Quản lý khoá học' : 'Khoá học của tôi'}
            </h1>
            <p className="text-gray-600 mt-2">
              {user?.role === 'teacher'
                ? 'Tạo và quản lý các khóa học của bạn'
                : 'Theo dõi tiến độ học tập của bạn'
              }
            </p>
          </div>
          {user?.role === 'teacher' && <CreateCourseDialog onSuccess={getCourses} />}
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
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(course.status)}
                    {user?.role === 'teacher' && (
                      <CourseActionsMenu course={course as TeacherCourse} onSuccess={getCourses} />
                    )}
                  </div>
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
                        <span className="font-medium">{(course as TeacherCourse).students_count}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-gray-600">
                          <BookOpen className="h-4 w-4 mr-1" />
                          Bài học:
                        </span>
                        <span className="font-medium">{(course as TeacherCourse).lessons_count}</span>
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
                          {(course as StudentCourse).completedLessons}/{(course as TeacherCourse).lessons_count} bài học
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
