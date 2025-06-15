import React from 'react';
import { BookOpen, Users, FileText, TrendingUp, Clock, CheckCircle, AlertCircle, Calendar, ArrowRight, Trophy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useStats } from '@/hooks/useStats';
import DashboardLayout from '@/components/DashboardLayout';
import RecentActivities from '@/components/RecentActivities';
import StudentActivities from '@/components/StudentActivities';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useCourses } from '@/hooks/useCourses';
import { useRecentActivities } from '@/hooks/useRecentActivities';
import { useStudentActivities } from '@/hooks/useStudentActivities';
import { useStudentGrades } from '@/hooks/useStudentGrades';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const { profile } = useAuth();
  const { data: stats, isLoading: statsLoading } = useStats();

  // Hooks for new cards
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: recentActivities, isLoading: activitiesLoading } = useRecentActivities();
  const { data: studentActivities, isLoading: studentActivitiesLoading } = useStudentActivities();
  const { data: studentGrades, isLoading: gradesLoading } = useStudentGrades();

  // Helper to filter submissions needing grading for teacher
  const assignmentsToGrade = React.useMemo(() => 
    recentActivities?.filter(
      (activity) => activity.type === 'submission' && (activity.grade === null || activity.grade === undefined)
    ) || [], [recentActivities]);

  // Helper to filter upcoming assignments for student
  const upcomingAssignments = React.useMemo(() => 
    studentActivities?.filter(
      (activity) => activity.type === 'assignment_due_soon'
    ) || [], [studentActivities]);

  // Helper to get recent grades for student
  const recentGrades = React.useMemo(() =>
    studentGrades?.filter(g => g.status === 'graded').slice(0, 3) || [],
    [studentGrades]
  );

  const getTeacherStats = () => {
    if (!stats) return [];
    
    return [
      {
        title: "Tổng khóa học",
        value: stats.courses.toString(),
        icon: BookOpen,
        description: "Khóa học đã tạo",
        color: "text-blue-600",
        bgColor: "bg-blue-100"
      },
      {
        title: "Học sinh",
        value: stats.students.toString(),
        icon: Users,
        description: "Đang theo học",
        color: "text-green-600",
        bgColor: "bg-green-100"
      },
      {
        title: "Tài liệu",
        value: stats.documents.toString(),
        icon: FileText,
        description: "Tài liệu đã tải lên",
        color: "text-orange-600",
        bgColor: "bg-orange-100"
      },
      {
        title: "Bài tập",
        value: stats.assignments.toString(),
        icon: TrendingUp,
        description: "Bài tập đã tạo",
        color: "text-purple-600",
        bgColor: "bg-purple-100"
      }
    ];
  };

  const getStudentStats = () => {
    if (!stats) return [];
    
    return [
      {
        title: "Khóa học đang theo",
        value: stats.enrolledCourses.toString(),
        icon: BookOpen,
        description: "Đang tiến hành",
        color: "text-blue-600",
        bgColor: "bg-blue-100"
      },
      {
        title: "Bài tập hoàn thành",
        value: stats.completedAssignments.toString(),
        icon: CheckCircle,
        description: "Đã nộp",
        color: "text-green-600",
        bgColor: "bg-green-100"
      },
      {
        title: "Bài tập chưa nộp",
        value: stats.pendingAssignments.toString(),
        icon: AlertCircle,
        description: "Cần hoàn thành",
        color: "text-red-600",
        bgColor: "bg-red-100"
      },
      {
        title: "Điểm trung bình",
        value: stats.averageGrade.toString(),
        icon: TrendingUp,
        description: "Tất cả khóa học",
        color: "text-purple-600",
        bgColor: "bg-purple-100"
      }
    ];
  };

  const displayStats = profile?.role === 'tutor' ? getTeacherStats() : getStudentStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Chào mừng trở lại, {profile?.full_name || 'User'}!
            </h1>
            <p className="text-gray-600 mt-2">
              {profile?.role === 'tutor' 
                ? 'Quản lý khóa học và theo dõi tiến độ học sinh của bạn'
                : 'Theo dõi tiến độ học tập và hoàn thành bài tập'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>{new Date().toLocaleDateString('vi-VN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            displayStats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hoạt động gần đây */}
          <Card className="lg:col-span-1 bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Hoạt động gần đây</CardTitle>
                  <CardDescription className="text-sm">Các hoạt động mới nhất trong hệ thống</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {profile?.role === 'tutor' ? (
                <RecentActivities />
              ) : (
                <StudentActivities />
              )}
            </CardContent>
          </Card>

          {/* New content cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile?.role === 'tutor' ? (
              <>
                {/* Teacher Card 1: My Courses */}
                <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Các khóa học của bạn</CardTitle>
                    <CardDescription>Tổng quan nhanh các khóa học</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {coursesLoading ? (
                      <div className="flex justify-center items-center h-24"><Loader2 className="animate-spin" /></div>
                    ) : (
                      <div className="space-y-3">
                        {courses?.slice(0, 3).map(course => (
                          <Link to={`/dashboard/courses/${course.id}`} key={course.id} className="block p-3 rounded-lg hover:bg-gray-50 border transition-colors">
                            <h4 className="font-semibold">{course.title}</h4>
                            <p className="text-sm text-gray-500">{course.students_count || 0} học sinh</p>
                          </Link>
                        ))}
                        {courses && courses.length > 3 && (
                          <Link to="/dashboard/courses" className="block mt-4">
                            <Button variant="outline" className="w-full">Xem tất cả khóa học <ArrowRight className="ml-2 h-4 w-4" /></Button>
                          </Link>
                        )}
                        {courses?.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Bạn chưa tạo khóa học nào.</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Teacher Card 2: Needs Grading */}
                <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Cần chấm điểm</CardTitle>
                    <CardDescription>Bài tập chờ chấm điểm</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activitiesLoading ? (
                       <div className="flex justify-center items-center h-24"><Loader2 className="animate-spin" /></div>
                    ) : (
                      <div className="space-y-3">
                        {assignmentsToGrade.slice(0, 3).map(activity => (
                          <Link 
                            to={`/dashboard/assignments/${activity.assignment_id}`} 
                            key={activity.id}
                            className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                          >
                            <p className="font-semibold text-sm truncate">{activity.assignment_title}</p>
                            <p className="text-xs text-gray-500">
                              {activity.student_name} đã nộp
                            </p>
                          </Link>
                        ))}
                         {assignmentsToGrade.length > 3 && (
                          <Link to="/dashboard/assignments" className="block mt-4">
                            <Button variant="outline" className="w-full">Xem tất cả <ArrowRight className="ml-2 h-4 w-4" /></Button>
                          </Link>
                        )}
                        {assignmentsToGrade.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Không có bài tập nào cần chấm.</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                {/* Student Card 1: Upcoming Assignments */}
                <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                  <CardHeader>
                     <CardTitle>Bài tập sắp tới</CardTitle>
                     <CardDescription>Đừng quên hoàn thành đúng hạn</CardDescription>
                  </CardHeader>
                  <CardContent>
                     {studentActivitiesLoading ? (
                       <div className="flex justify-center items-center h-24"><Loader2 className="animate-spin" /></div>
                     ) : (
                       <div className="space-y-3">
                         {upcomingAssignments.slice(0, 3).map(activity => (
                           <Link to="/dashboard/assignments" key={activity.id} className="block p-3 rounded-lg hover:bg-gray-50 border transition-colors">
                             <div className="flex justify-between items-center">
                               <h4 className="font-semibold truncate">{activity.assignment_title}</h4>
                               {activity.status === 'urgent' 
                                 ? <Badge variant="destructive">Khẩn cấp</Badge>
                                 : <Badge className="bg-orange-100 text-orange-800">Sắp đến hạn</Badge>
                               }
                             </div>
                             <p className="text-sm text-gray-500 truncate">Khóa học: {activity.course_title}</p>
                             {activity.due_date && <p className="text-xs text-gray-500">Hạn nộp: {new Date(activity.due_date).toLocaleDateString('vi-VN')}</p>}
                           </Link>
                         ))}
                         {upcomingAssignments.length > 0 && (
                          <Link to="/dashboard/assignments" className="block mt-4">
                            <Button variant="outline" className="w-full">Xem tất cả bài tập <ArrowRight className="ml-2 h-4 w-4" /></Button>
                          </Link>
                        )}
                        {upcomingAssignments.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Không có bài tập nào sắp tới.</p>}
                       </div>
                     )}
                  </CardContent>
                </Card>

                {/* Student Card 2: Recent Grades */}
                <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Điểm số gần đây</CardTitle>
                    <CardDescription>Kết quả học tập của bạn</CardDescription>
                  </CardHeader>
                  <CardContent>
                     {gradesLoading ? (
                       <div className="flex justify-center items-center h-24"><Loader2 className="animate-spin" /></div>
                     ) : (
                       <div className="space-y-3">
                         {recentGrades.map(grade => (
                           <Link to="/dashboard/grades" key={grade.id} className="block p-3 rounded-lg hover:bg-gray-50 border transition-colors">
                            <div className="flex justify-between items-center">
                               <h4 className="font-semibold truncate">{grade.assignment}</h4>
                               <Badge><Trophy className="h-4 w-4 mr-1" />{grade.grade}/{grade.maxGrade}</Badge>
                            </div>
                            <p className="text-sm text-gray-500 truncate">{grade.course}</p>
                           </Link>
                         ))}
                          {recentGrades.length > 0 && (
                          <Link to="/dashboard/grades" className="block mt-4">
                            <Button variant="outline" className="w-full">Xem tất cả điểm số <ArrowRight className="ml-2 h-4 w-4" /></Button>
                          </Link>
                        )}
                        {recentGrades.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Chưa có điểm số nào.</p>}
                       </div>
                     )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
export default Dashboard;
