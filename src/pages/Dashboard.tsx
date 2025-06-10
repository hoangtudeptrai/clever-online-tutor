
import React from 'react';
import { BookOpen, Users, FileText, TrendingUp, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';

const Dashboard = () => {
  const { profile } = useAuth();

  const teacherStats = [
    {
      title: "Tổng khóa học",
      value: "12",
      icon: BookOpen,
      description: "Đang hoạt động",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Học sinh",
      value: "248",
      icon: Users,
      description: "Đang theo học",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Bài tập",
      value: "36",
      icon: FileText,
      description: "Chưa chấm điểm",
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Tỷ lệ hoàn thành",
      value: "87%",
      icon: TrendingUp,
      description: "Trung bình khóa học",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  const studentStats = [
    {
      title: "Khóa học đang theo",
      value: "5",
      icon: BookOpen,
      description: "Đang tiến hành",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Bài tập hoàn thành",
      value: "24/30",
      icon: CheckCircle,
      description: "Tỷ lệ 80%",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Bài tập chưa nộp",
      value: "6",
      icon: AlertCircle,
      description: "Cần hoàn thành",
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      title: "Điểm trung bình",
      value: "8.5",
      icon: TrendingUp,
      description: "Tất cả khóa học",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  const stats = profile?.role === 'tutor' ? teacherStats : studentStats;

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
          {stats.map((stat, index) => (
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
          ))}
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
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {profile?.role === 'tutor' 
                          ? `Học sinh Nguyễn Văn A đã nộp bài tập React ${item}`
                          : `Hoàn thành bài học: React Components ${item}`
                        }
                      </p>
                      <p className="text-xs text-gray-500">{item} giờ trước</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Xem tất cả
              </Button>
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
                    <Button className="w-full justify-start" variant="outline">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Tạo khóa học mới
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Tạo bài tập mới
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Quản lý học sinh
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="w-full justify-start" variant="outline">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Xem khóa học
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Làm bài tập
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Xem điểm số
                    </Button>
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
              <div className="space-y-4">
                {['React Fundamentals', 'JavaScript Advanced', 'Node.js Backend'].map((course, index) => (
                  <div key={course} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{course}</span>
                      <span className="text-sm text-gray-500">{(index + 1) * 25}%</span>
                    </div>
                    <Progress value={(index + 1) * 25} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
