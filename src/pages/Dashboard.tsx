
import React from 'react';
import { BookOpen, Users, FileText, TrendingUp, Clock, CheckCircle, AlertCircle, Calendar, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useStats } from '@/hooks/useStats';
import DashboardLayout from '@/components/DashboardLayout';
import CreateCourseDialog from '@/components/CreateCourseDialog';
import CreateAssignmentDialog from '@/components/CreateAssignmentDialog';
import CreateDocumentDialog from '@/components/CreateDocumentDialog';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { profile } = useAuth();
  const { data: stats, isLoading: statsLoading } = useStats();

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

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Hoạt động gần đây</span>
              </CardTitle>
              <CardDescription>
                {profile?.role === 'tutor' 
                  ? 'Theo dõi hoạt động mới nhất của học sinh'
                  : 'Các bài học và bài tập gần đây'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Chưa có hoạt động nào gần đây</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
              <CardDescription>
                {profile?.role === 'tutor' 
                  ? 'Các tác vụ thường dùng cho giảng viên'
                  : 'Các tác vụ thường dùng cho học sinh'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile?.role === 'tutor' ? (
                  <>
                    <CreateCourseDialog />
                    <CreateAssignmentDialog />
                    <CreateDocumentDialog />
                    <Link to="/dashboard/courses" className="block">
                      <Button className="w-full justify-start" variant="outline">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Quản lý khóa học
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/dashboard/courses" className="block">
                      <Button className="w-full justify-start" variant="outline">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Xem khóa học
                      </Button>
                    </Link>
                    <Link to="/dashboard/assignments" className="block">
                      <Button className="w-full justify-start" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Làm bài tập
                      </Button>
                    </Link>
                    <Link to="/dashboard/documents" className="block">
                      <Button className="w-full justify-start" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Tài liệu học tập
                      </Button>
                    </Link>
                    <Link to="/dashboard/grades" className="block">
                      <Button className="w-full justify-start" variant="outline">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Xem điểm số
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Section for Students */}
        {profile?.role === 'student' && (
          <Card>
            <CardHeader>
              <CardTitle>Tiến độ học tập</CardTitle>
              <CardDescription>Theo dõi tiến độ hoàn thành các khóa học</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Chưa có dữ liệu tiến độ học tập</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
