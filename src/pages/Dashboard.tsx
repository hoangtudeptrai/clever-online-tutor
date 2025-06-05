
import React from 'react';
import { BookOpen, Users, FileText, Award, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';

const Dashboard = () => {
  const { user } = useAuth();

  const teacherStats = [
    { icon: BookOpen, label: 'Khóa học', value: '5', color: 'text-blue-600', bg: 'bg-blue-100' },
    { icon: Users, label: 'Học sinh', value: '89', color: 'text-green-600', bg: 'bg-green-100' },
    { icon: FileText, label: 'Tài liệu', value: '42', color: 'text-purple-600', bg: 'bg-purple-100' },
    { icon: Award, label: 'Bài tập', value: '28', color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  const studentStats = [
    { icon: BookOpen, label: 'Khóa học tham gia', value: '3', color: 'text-blue-600', bg: 'bg-blue-100' },
    { icon: FileText, label: 'Bài tập đã nộp', value: '15', color: 'text-green-600', bg: 'bg-green-100' },
    { icon: Award, label: 'Điểm trung bình', value: '8.5', color: 'text-purple-600', bg: 'bg-purple-100' },
    { icon: Clock, label: 'Bài tập chưa nộp', value: '2', color: 'text-red-600', bg: 'bg-red-100' },
  ];

  const stats = user?.role === 'teacher' ? teacherStats : studentStats;

  const recentActivities = user?.role === 'teacher' 
    ? [
        { title: 'Học sinh Nguyễn Văn A đã nộp bài tập "Bài tập 1"', time: '2 giờ trước' },
        { title: 'Thêm tài liệu mới vào khóa học "Lập trình Web"', time: '5 giờ trước' },
        { title: 'Chấm điểm bài tập cho lớp CNTT01', time: '1 ngày trước' },
        { title: 'Tạo bài tập mới "Bài tập 3"', time: '2 ngày trước' },
      ]
    : [
        { title: 'Nộp bài tập "Bài tập 2" cho môn Lập trình Web', time: '1 giờ trước' },
        { title: 'Xem tài liệu "Chương 3" trong khóa học React', time: '3 giờ trước' },
        { title: 'Nhận điểm bài tập "Bài tập 1": 9.0 điểm', time: '1 ngày trước' },
        { title: 'Tham gia khóa học mới "Node.js Cơ bản"', time: '3 ngày trước' },
      ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Chào mừng, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'teacher' 
              ? 'Quản lý khóa học và theo dõi tiến độ học sinh của bạn.'
              : 'Theo dõi tiến độ học tập và hoàn thành bài tập của bạn.'
            }
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động gần đây</CardTitle>
              <CardDescription>Các hoạt động mới nhất trong hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {user?.role === 'teacher' ? 'Thống kê nhanh' : 'Lịch học sắp tới'}
              </CardTitle>
              <CardDescription>
                {user?.role === 'teacher' 
                  ? 'Tổng quan về hoạt động giảng dạy'
                  : 'Các hoạt động học tập sắp diễn ra'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user?.role === 'teacher' ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bài tập chưa chấm</span>
                    <span className="text-sm font-semibold text-orange-600">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Học sinh hoạt động hôm nay</span>
                    <span className="text-sm font-semibold text-green-600">45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Điểm trung bình lớp</span>
                    <span className="text-sm font-semibold text-blue-600">7.8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tài liệu được xem nhiều nhất</span>
                    <span className="text-sm font-semibold text-purple-600">React Hooks</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Bài tập 3 - Lập trình Web</p>
                      <p className="text-xs text-gray-500">Hạn nộp: 15/04/2025</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Kiểm tra giữa kỳ - React</p>
                      <p className="text-xs text-gray-500">Ngày: 20/04/2025</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Bài thuyết trình nhóm</p>
                      <p className="text-xs text-gray-500">Ngày: 25/04/2025</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
