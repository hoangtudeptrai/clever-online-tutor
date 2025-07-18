import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, Filter, TrendingUp, Users, Award, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const Reports = () => {
  const [timeRange, setTimeRange] = useState('month');

  // Fetch tổng số học sinh
  const { data: totalStudents } = useQuery({
    queryKey: ['total-students'],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');
      return count || 0;
    },
  });

  // Fetch tổng số giáo viên
  const { data: totalTutors } = useQuery({
    queryKey: ['total-tutors'],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'tutor');
      return count || 0;
    },
  });

  // Fetch tổng số khóa học
  const { data: totalCourses } = useQuery({
    queryKey: ['total-courses'],
    queryFn: async () => {
      const { count } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  // Fetch tổng số bài tập
  const { data: totalAssignments } = useQuery({
    queryKey: ['total-assignments'],
    queryFn: async () => {
      const { count } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  // Fetch hiệu suất khóa học
  const { data: coursePerformance } = useQuery({
    queryKey: ['course-performance'],
    queryFn: async () => {
      // Fetch courses first
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title');

      if (!courses) return [];

      // Fetch data for each course
      const coursesWithStats = await Promise.all(
        courses.map(async (course) => {
          // Get enrollments count
          const { count: studentCount } = await supabase
            .from('course_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id);

          // Get assignments and their submissions
          const { data: assignments } = await supabase
            .from('assignments')
            .select('id')
            .eq('course_id', course.id);

          if (!assignments?.length) {
            return {
              course: course.title,
              students: studentCount || 0,
              avgGrade: 0,
              completed: 0
            };
          }

          const assignmentIds = assignments.map(a => a.id);
          
          // Get submissions for these assignments
          const { data: submissions } = await supabase
            .from('assignment_submissions')
            .select('grade, status')
            .in('assignment_id', assignmentIds);

          const gradedSubmissions = (submissions || []).filter(s => s.status === 'graded');
          const avgGrade = gradedSubmissions.length > 0
            ? gradedSubmissions.reduce((acc, curr) => acc + (curr.grade || 0), 0) / gradedSubmissions.length
            : 0;
          const completionRate = submissions?.length ? (gradedSubmissions.length * 100) / submissions.length : 0;

          return {
            course: course.title,
            students: studentCount || 0,
            avgGrade,
            completed: completionRate
          };
        })
      );

      return coursesWithStats;
    },
  });

  // Fetch phân bố điểm số
  const { data: gradeDistribution } = useQuery({
    queryKey: ['grade-distribution'],
    queryFn: async () => {
      const { data: submissions } = await supabase
        .from('assignment_submissions')
        .select('grade, status')
        .eq('status', 'graded')
        .not('grade', 'is', null);

      const distribution = {
        '9-10': { grade: '9-10', count: 0, color: '#10B981' },
        '8-8.9': { grade: '8-8.9', count: 0, color: '#3B82F6' },
        '7-7.9': { grade: '7-7.9', count: 0, color: '#F59E0B' },
        '6-6.9': { grade: '6-6.9', count: 0, color: '#EF4444' },
        '<6': { grade: '<6', count: 0, color: '#6B7280' }
      };

      submissions?.forEach(submission => {
        const grade = submission.grade;
        if (grade >= 9) distribution['9-10'].count++;
        else if (grade >= 8) distribution['8-8.9'].count++;
        else if (grade >= 7) distribution['7-7.9'].count++;
        else if (grade >= 6) distribution['6-6.9'].count++;
        else distribution['<6'].count++;
      });

      return Object.values(distribution);
    },
  });

  // Fetch tiến độ theo tháng
  const { data: monthlyProgress } = useQuery({
    queryKey: ['monthly-progress', timeRange],
    queryFn: async () => {
      const now = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const { data: submissions } = await supabase
        .from('assignment_submissions')
        .select('submitted_at, grade, status')
        .eq('status', 'graded')
        .gte('submitted_at', startDate.toISOString())
        .lte('submitted_at', now.toISOString())
        .not('submitted_at', 'is', null)
        .order('submitted_at');

      const monthlyData: { [key: string]: { submissions: number; totalGrade: number } } = {};

      submissions?.forEach(submission => {
        const month = new Date(submission.submitted_at).toLocaleDateString('vi-VN', { month: 'short' });
        if (!monthlyData[month]) {
          monthlyData[month] = { submissions: 0, totalGrade: 0 };
        }
        monthlyData[month].submissions++;
        monthlyData[month].totalGrade += submission.grade || 0;
      });

      return Object.entries(monthlyData).map(([month, data]) => ({
        month,
        submissions: data.submissions,
        avgGrade: data.submissions > 0 ? data.totalGrade / data.submissions : 0
      }));
    },
  });

  // Fetch top học sinh
  const { data: topStudents } = useQuery({
    queryKey: ['top-students'],
    queryFn: async () => {
      // Fetch all students first
      const { data: students } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'student');

      if (!students) return [];

      // Fetch submissions for each student
      const studentsWithStats = await Promise.all(
        students.map(async (student) => {
          const { data: submissions } = await supabase
            .from('assignment_submissions')
            .select('grade, status')
            .eq('student_id', student.id);

          const studentSubmissions = submissions || [];
          const gradedSubmissions = studentSubmissions.filter(s => s.status === 'graded');
          const avgGrade = gradedSubmissions.length > 0
            ? gradedSubmissions.reduce((acc, curr) => acc + (curr.grade || 0), 0) / gradedSubmissions.length
            : 0;
          const completionRate = studentSubmissions.length > 0
            ? (gradedSubmissions.length * 100) / studentSubmissions.length
            : 0;

          return {
            name: student.full_name,
            grade: avgGrade,
            assignments: studentSubmissions.length,
            completion: completionRate
          };
        })
      );

      return studentsWithStats
        .sort((a, b) => b.grade - a.grade)
        .slice(0, 5);
    },
  });

  const getGradeColor = (grade: number) => {
    if (grade >= 9) return 'text-green-600';
    if (grade >= 8) return 'text-blue-600';
    if (grade >= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Thống kê & Báo cáo</h1>
            <p className="text-gray-600 mt-2">
              Theo dõi hiệu suất giảng dạy và học tập
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40 border bg-white shadow-sm">
                <SelectValue placeholder="Chọn khoảng thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Tuần này</SelectItem>
                <SelectItem value="month">Tháng này</SelectItem>
                <SelectItem value="quarter">Quý này</SelectItem>
                <SelectItem value="year">Năm này</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="rounded-lg border-gray-300 bg-gray-50 hover:bg-gray-100 shadow">
              <Download className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="rounded-xl shadow-md border-0 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="rounded-full p-2 bg-blue-100">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStudents}</p>
                <p className="text-sm text-gray-600">Tổng học sinh</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-md border-0 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="rounded-full p-2 bg-green-100">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTutors}</p>
                <p className="text-sm text-gray-600">Tổng giáo viên</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-md border-0 bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="rounded-full p-2 bg-orange-100">
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCourses}</p>
                <p className="text-sm text-gray-600">Tổng khóa học</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-md border-0 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="rounded-full p-2 bg-purple-100">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalAssignments}</p>
                <p className="text-sm text-gray-600">Tổng bài tập</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Class Performance */}
          <Card className="rounded-xl shadow-lg border-0">
            <CardHeader className="bg-blue-50 rounded-t-xl flex flex-row items-center space-x-3 pb-4">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-base font-semibold">Hiệu suất theo khóa học</CardTitle>
                <CardDescription className="text-sm">Điểm trung bình và tỷ lệ hoàn thành</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={coursePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="course" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgGrade" fill="#3B82F6" name="Điểm TB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Grade Distribution */}
          <Card className="rounded-xl shadow-lg border-0">
            <CardHeader className="bg-green-50 rounded-t-xl flex flex-row items-center space-x-3 pb-4">
              <Award className="h-6 w-6 text-green-600" />
              <div>
                <CardTitle className="text-base font-semibold">Phân bố điểm số</CardTitle>
                <CardDescription className="text-sm">Tỷ lệ học sinh theo mức điểm</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ grade, count }) => `${grade}: ${count}`}
                  >
                    {gradeDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Progress */}
        <Card className="lg:col-span-2 rounded-xl shadow-lg border-0">
          <CardHeader className="bg-yellow-50 rounded-t-xl flex flex-row items-center space-x-3 pb-4">
            <Calendar className="h-6 w-6 text-yellow-500" />
            <div>
              <CardTitle className="text-base font-semibold">Tiến độ theo tháng</CardTitle>
              <CardDescription className="text-sm">Số lượng bài tập nộp & điểm trung bình theo từng tháng</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="submissions" fill="#10B981" name="Bài nộp" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="avgGrade" stroke="#F59E0B" strokeWidth={3} name="Điểm TB" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Students */}
          <Card className="rounded-xl shadow-lg border-0">
            <CardHeader className="bg-blue-50 rounded-t-xl flex flex-row items-center space-x-3 pb-4">
              <Users className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-base font-semibold">Top học sinh xuất sắc</CardTitle>
                <CardDescription className="text-sm">5 học sinh có kết quả tốt nhất</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topStudents?.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:shadow transition">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-600">
                        {student.assignments} bài tập • {student.completion.toFixed(1)}% hoàn thành
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getGradeColor(student.grade)}`}>
                        {student.grade.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500">điểm TB</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Course Statistics */}
          <Card className="rounded-xl shadow-lg border-0">
            <CardHeader className="bg-purple-50 rounded-t-xl flex flex-row items-center space-x-3 pb-4">
              <FileText className="h-6 w-6 text-purple-600" />
              <div>
                <CardTitle className="text-base font-semibold">Thống kê chi tiết khóa học</CardTitle>
                <CardDescription className="text-sm">Thông tin tổng quan theo từng khóa học</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coursePerformance?.map((course, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-white hover:bg-purple-50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{course.course}</h4>
                      <span className={`text-lg font-bold ${getGradeColor(course.avgGrade)}`}>
                        {course.avgGrade.toFixed(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Học sinh: <span className="font-medium">{course.students}</span></p>
                      </div>
                      <div>
                        <p className="text-gray-600">Hoàn thành: <span className="font-medium">{course.completed.toFixed(1)}%</span></p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${course.completed}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
