
import React from 'react';
import { User, Mail, Phone, Calendar, TrendingUp, BookOpen, Award, Home, FileText, CheckCircle, Activity, Info } from 'lucide-react';
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
import { useStudentEnrollments, useStudentProfile } from '@/hooks/useStudents';
import { useStudentActivities, type StudentActivity } from '@/hooks/useStudentActivities';
import { useStudentGrades } from '@/hooks/useStudentGrades';

interface StudentDetailDialogProps {
  student: Student | CourseStudent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ActivityItem: React.FC<{ activity: StudentActivity }> = ({ activity }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
  
  const ICONS = {
    assignment_created: <FileText className="h-5 w-5 text-blue-500" />,
    assignment_graded: <CheckCircle className="h-5 w-5 text-green-500" />,
    assignment_due_soon: <TrendingUp className="h-5 w-5 text-orange-500" />,
    default: <Activity className="h-5 w-5 text-gray-500" />,
  };
  
  const getIcon = (type: string) => {
    const iconKey = type as keyof typeof ICONS;
    return ICONS[iconKey] || ICONS.default;
  }

  return (
    <div className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0 mt-1">{getIcon(activity.type)}</div>
      <div className="flex-1">
        <p className="font-medium text-sm">{activity.title}</p>
        <p className="text-sm text-gray-600">{activity.description}</p>
        <p className="text-xs text-gray-400 mt-1">{formatDate(activity.created_at)}</p>
      </div>
    </div>
  );
};

const StudentDetailDialog: React.FC<StudentDetailDialogProps> = ({ 
  student, 
  open, 
  onOpenChange 
}) => {
  if (!student) return null;

  const { data: enrollments, isLoading: isLoadingEnrollments } = useStudentEnrollments(student.id);
  const { data: studentProfile } = useStudentProfile(student.id);
  const { data: activities, isLoading: isLoadingActivities } = useStudentActivities(student.id);
  const { data: grades, isLoading: isLoadingGrades } = useStudentGrades(student.id);

  const coursesCount = enrollments?.length || 0;

  const averageProgress = enrollments && enrollments.length > 0
    ? Math.round(
        enrollments.reduce((acc, cs) => acc + (cs.progress || 0), 0) /
        enrollments.length
      )
    : 'progress' in student ? student.progress || 0 : 0;
    
  const averageScore = React.useMemo(() => {
    if (!grades || grades.length === 0) return "N/A";
    const gradedAssignments = grades.filter(g => g.status === 'graded' && typeof g.grade === 'number');
    if (gradedAssignments.length === 0) return "N/A";
    const totalScore = gradedAssignments.reduce((acc, curr) => acc + (curr.grade! / curr.maxGrade * 10), 0);
    const avg = totalScore / gradedAssignments.length;
    return avg.toFixed(1);
  }, [grades]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const isCourseStudent = (student: Student | CourseStudent): student is CourseStudent => {
    return 'enrollment_id' in student;
  };

  const courseStudentData = isCourseStudent(student) ? student : null;
  const displayedStudent = studentProfile || student;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                  <AvatarImage src={displayedStudent.avatar_url || ''} alt={displayedStudent.full_name} />
                  <AvatarFallback className="text-lg">
                    {displayedStudent.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-xl">{displayedStudent.full_name}</CardTitle>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{displayedStudent.email}</span>
                </div>
                {displayedStudent.phone_number && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{displayedStudent.phone_number}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    Tham gia: {formatDate(courseStudentData?.enrolled_at || displayedStudent.created_at)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">ID: {displayedStudent.id.slice(0, 8)}...</span>
                </div>
                {courseStudentData?.last_active && (
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Hoạt động cuối: {formatDate(courseStudentData.last_active)}</span>
                  </div>
                )}
                {displayedStudent.address && (
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{displayedStudent.address}</span>
                  </div>
                )}
                 {displayedStudent.education && (
                  <div className="flex items-center space-x-2 md:col-span-2">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{displayedStudent.education}</span>
                  </div>
                )}
                {displayedStudent.bio && (
                  <div className="flex items-start space-x-2 md:col-span-2">
                    <Info className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{displayedStudent.bio}</p>
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
                    <p className="text-2xl font-bold">{isLoadingGrades ? '...' : averageScore}</p>
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
                {isLoadingActivities ? (
                  <p className="text-sm text-gray-500">Đang tải hoạt động...</p>
                ) : activities && activities.length > 0 ? (
                  activities.map(activity => (
                     <ActivityItem key={activity.id} activity={activity} />
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
