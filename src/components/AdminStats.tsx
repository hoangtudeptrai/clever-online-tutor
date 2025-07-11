import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, BookOpen, ClipboardList, Trophy, TrendingUp, Calendar } from 'lucide-react';

const AdminStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: totalCourses },
        { count: totalAssignments },
        { count: totalSubmissions },
        { count: totalStudents },
        { count: totalTutors }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('assignments').select('*', { count: 'exact', head: true }),
        supabase.from('assignment_submissions').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'tutor')
      ]);

      return {
        totalUsers: totalUsers || 0,
        totalCourses: totalCourses || 0,
        totalAssignments: totalAssignments || 0,
        totalSubmissions: totalSubmissions || 0,
        totalStudents: totalStudents || 0,
        totalTutors: totalTutors || 0
      };
    }
  });

  const { data: recentActivities } = useQuery({
    queryKey: ['admin-recent-activities'],
    queryFn: async () => {
      const { data: courses } = await supabase
        .from('courses')
        .select('title, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: assignments } = await supabase
        .from('assignments')
        .select('title, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      return { courses: courses || [], assignments: assignments || [] };
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Tổng người dùng',
      value: stats?.totalUsers,
      icon: Users,
      description: 'Tất cả tài khoản trong hệ thống',
      color: 'text-blue-600'
    },
    {
      title: 'Học sinh',
      value: stats?.totalStudents,
      icon: Users,
      description: 'Tài khoản học sinh',
      color: 'text-green-600'
    },
    {
      title: 'Giáo viên',
      value: stats?.totalTutors,
      icon: Users,
      description: 'Tài khoản giáo viên',
      color: 'text-purple-600'
    },
    {
      title: 'Khóa học',
      value: stats?.totalCourses,
      icon: BookOpen,
      description: 'Tổng số khóa học',
      color: 'text-orange-600'
    },
    {
      title: 'Bài tập',
      value: stats?.totalAssignments,
      icon: ClipboardList,
      description: 'Tổng số bài tập',
      color: 'text-red-600'
    },
    {
      title: 'Bài nộp',
      value: stats?.totalSubmissions,
      icon: Trophy,
      description: 'Tổng số bài đã nộp',
      color: 'text-yellow-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value?.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span>Khóa học mới nhất</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities?.courses?.map((course, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{course.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(course.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ClipboardList className="h-5 w-5 text-green-600" />
              <span>Bài tập mới nhất</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities?.assignments?.map((assignment, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{assignment.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(assignment.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminStats;