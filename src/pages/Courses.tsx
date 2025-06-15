
import React, { useState, useEffect } from 'react';
import { Search, Users, BookOpen, Clock, Star, Loader2, Trash2, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import CreateCourseDialog from '@/components/CreateCourseDialog';
import CourseActionsMenu from '@/components/CourseActionsMenu';
import ManageStudentsDialog from '@/components/ManageStudentsDialog';
import { useCourses } from '@/hooks/useCourses';
import { useDeleteCourse } from '@/hooks/useDeleteCourse';
import { useToast } from '@/hooks/use-toast';
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

// Component riêng để hiển thị từng course card
const CourseCard = ({ course }: { course: any }) => {
  const { profile } = useAuth();
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <Link to={`/dashboard/courses/${course.id}`}>
        <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
          {course.thumbnail ? (
            <img 
              src={course.thumbnail} 
              alt={course.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
      </Link>
      <CardHeader>
        <div className="flex items-start justify-between">
          <Link 
            to={`/dashboard/courses/${course.id}`}
            className="hover:text-blue-600 transition-colors"
          >
            <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
          </Link>
          <div className="flex items-center space-x-2">
            {course.status === 'published' && (
              <Badge className="bg-green-100 text-green-800">Đã xuất bản</Badge>
            )}
            {course.status === 'completed' && (
              <Badge className="bg-blue-100 text-blue-800">Hoàn thành</Badge>
            )}
            {course.status === 'draft' && (
              <Badge className="bg-gray-100 text-gray-800">Nháp</Badge>
            )}
            {!['published', 'completed', 'draft'].includes(course.status) && (
              <Badge>{course.status}</Badge>
            )}
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
                  <FileText className="h-4 w-4 mr-1" />
                  Bài tập:
                </span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  Thời lượng:
                </span>
                <span className="font-medium">{course.duration || 'Chưa xác định'}</span>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => {
                    e.preventDefault();
                    // Handle manage students - will be passed from parent
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Quản lý học sinh
                </Button>
                <Link 
                  to={`/dashboard/courses/${course.id}`}
                  className="flex-1"
                >
                  <Button 
                    variant="default"
                    size="sm"
                    className="w-full"
                  >
                    Xem chi tiết
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-600">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Bài học:
                </span>
                <span className="font-medium">{course.lessons_count || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-600">
                  <FileText className="h-4 w-4 mr-1" />
                  Bài tập:
                </span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  Thời lượng:
                </span>
                <span className="font-medium">{course.duration || 'Chưa xác định'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-600">
                  <Star className="h-4 w-4 mr-1" />
                  Tiến độ:
                </span>
                <span className="font-medium">0%</span>
              </div>

              <Link 
                to={`/dashboard/courses/${course.id}`}
                className="block mt-4"
              >
                <Button 
                  variant="default"
                  size="sm"
                  className="w-full"
                >
                  Vào học
                </Button>
              </Link>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Courses = () => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingCourse, setDeletingCourse] = useState<string | null>(null);
  const [manageStudentsOpen, setManageStudentsOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<{ id: string; title: string } | null>(null);
  const { data: courses = [], isLoading, error, refetch } = useCourses();
  const deleteMutation = useDeleteCourse();
  const { toast } = useToast();

  // Force refetch when component mounts or when mutations succeed
  React.useEffect(() => {
    refetch();
  }, [refetch]);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await deleteMutation.mutateAsync(courseId);
      setDeletingCourse(null);
      toast({
        title: "Thành công",
        description: "Đã xóa khóa học thành công",
      });
      // Force refetch after successful deletion
      refetch();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa khóa học",
        variant: "destructive",
      });
    }
  };

  const handleManageStudents = (course: { id: string; title: string }) => {
    setSelectedCourse(course);
    setManageStudentsOpen(true);
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {searchTerm ? 'Không tìm thấy khóa học nào' : 'Chưa có khóa học nào'}
                </p>
              </div>
            ) : (
              filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            )}
          </div>
        )}
      </div>

      {/* Delete Course Dialog */}
      <AlertDialog open={!!deletingCourse} onOpenChange={() => setDeletingCourse(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa khóa học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khóa học này? 
              Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingCourse && handleDeleteCourse(deletingCourse)}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa khóa học
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Manage Students Dialog */}
      {selectedCourse && (
        <ManageStudentsDialog
          open={manageStudentsOpen}
          onOpenChange={setManageStudentsOpen}
          courseId={selectedCourse.id}
          courseTitle={selectedCourse.title}
        />
      )}
    </DashboardLayout>
  );
};

export default Courses;
