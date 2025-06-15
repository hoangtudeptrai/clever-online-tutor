
import React from 'react';
import { User, Mail, Phone, Calendar, TrendingUp, BookOpen, Award } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Student, CourseStudent } from '@/hooks/useStudents';
import { useStudentEnrollments } from '@/hooks/useStudents';

interface StudentDetailDialogProps {
  student: Student | CourseStudent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StudentDetailDialog: React.FC<StudentDetailDialogProps> = ({ 
  student, 
  open, 
  onOpenChange 
}) => {
  if (!student) return null;

  const { data: enrollments, isLoading: isLoadingEnrollments } = useStudentEnrollments(student.id);

  const coursesCount = enrollments?.length || 0;

  const averageProgress = enrollments && enrollments.length > 0
    ? Math.round(
        enrollments.reduce((acc, cs) => acc + (cs.progress || 0), 0) /
        enrollments.length
      )
    : student.progress || 0;

  const averageScore = 8.5;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const isCourseStudent = (student: Student | CourseStudent): student is CourseStudent => {
    return 'enrollment_id' in student;
  };

  const courseStudentData = isCourseStudent(student) ? student : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thông tin chi tiết học sinh</DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết và tiến độ học tập của học sinh
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={student.avatar_url || ''} alt={student.full_name} />
                  <AvatarFallback className="text-lg">
                    {student.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-xl">{student.full_name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className="bg-green-100 text-green-800">Đang hoạt động</Badge>
                    {courseStudentData && (
                      <Badge className="bg-blue-100 text-blue-800">
                        {courseStudentData.status === 'enrolled' ? 'Đang học' : 
                         courseStudentData.status === 'completed' ? 'Hoàn thành' : 
                         courseStudentData.status === 'dropped' ? 'Đã nghỉ' : courseStudentData.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{student.email}</span>
                </div>
                {student.phone_number && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{student.phone_number}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    Tham gia: {formatDate(courseStudentData?.enrolled_at || student.created_at)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">ID: {student.id.slice(0, 8)}...</span>
                </div>
                {courseStudentData?.last_active && (
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Hoạt động cuối: {formatDate(courseStudentData.last_active)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {courseStudentData && (
            <Card>
              <CardHeader>
                <CardTitle>Tiến độ khóa học "{enrollments?.find(e => e.course_id === courseStudentData.course_id)?.courses?.title || 'hiện tại'}"</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tiến độ hoàn thành</span>
                    <span className="text-sm text-gray-600">{courseStudentData.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${courseStudentData.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{isLoadingEnrollments ? '...' : coursesCount}</p>
                    <p className="text-sm text-gray-600">Khóa học</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{isLoadingEnrollments ? '...' : averageProgress}%</p>
                    <p className="text-sm text-gray-600">Tiến độ TB</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Award className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{averageScore}</p>
                    <p className="text-sm text-gray-600">Điểm TB</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoadingEnrollments ? (
                  <p className="text-sm text-gray-500">Đang tải hoạt động...</p>
                ) : enrollments && enrollments.length > 0 ? (
                  enrollments.slice(0, 3).map(enrollment => (
                     <div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                       <div>
                         <p className="font-medium">
                           Tham gia khóa học: {enrollment.courses?.title}
                         </p>
                         <p className="text-sm text-gray-600">
                           {formatDate(enrollment.enrolled_at)}
                         </p>
                       </div>
                       <Badge className="bg-blue-100 text-blue-800">
                         {enrollment.status === 'enrolled' ? 'Đang học' : enrollment.status}
                       </Badge>
                     </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Không có hoạt động gần đây.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailDialog;
