
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, Filter, TrendingUp, Users, Award, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';

const Reports = () => {
  const [timeRange, setTimeRange] = useState('month');

  const classPerformanceData = [
    { course: 'Lập trình Web', students: 30, avgGrade: 8.2, completed: 85 },
    { course: 'React Nâng cao', students: 25, avgGrade: 8.7, completed: 78 },
    { course: 'Node.js Cơ bản', students: 20, avgGrade: 7.9, completed: 90 },
    { course: 'Database Design', students: 18, avgGrade: 8.4, completed: 72 }
  ];

  const monthlyProgressData = [
    { month: 'T1', submissions: 45, avgGrade: 7.8 },
    { month: 'T2', submissions: 52, avgGrade: 8.1 },
    { month: 'T3', submissions: 48, avgGrade: 8.3 },
    { month: 'T4', submissions: 58, avgGrade: 8.5 }
  ];

  const gradeDistributionData = [
    { grade: '9-10', count: 25, color: '#10B981' },
    { grade: '8-8.9', count: 35, color: '#3B82F6' },
    { grade: '7-7.9', count: 20, color: '#F59E0B' },
    { grade: '6-6.9', count: 12, color: '#EF4444' },
    { grade: '<6', count: 8, color: '#6B7280' }
  ];

  const topStudents = [
    { name: 'Vũ Thị Giang', grade: 9.5, assignments: 20, completion: 100 },
    { name: 'Trần Thị Bình', grade: 9.2, assignments: 18, completion: 95 },
    { name: 'Phạm Thị Dung', grade: 8.9, assignments: 12, completion: 92 },
    { name: 'Hoàng Văn Em', grade: 8.5, assignments: 10, completion: 88 },
    { name: 'Nguyễn Văn An', grade: 8.3, assignments: 15, completion: 85 }
  ];

  const getGradeColor = (grade: number) => {
    if (grade >= 9) return 'text-green-600';
    if (grade >= 8) return 'text-blue-600';
    if (grade >= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
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
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Tuần này</SelectItem>
                <SelectItem value="month">Tháng này</SelectItem>
                <SelectItem value="quarter">Quý này</SelectItem>
                <SelectItem value="year">Năm này</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">93</p>
                  <p className="text-sm text-gray-600">Tổng học sinh</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">8.3</p>
                  <p className="text-sm text-gray-600">Điểm TB chung</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">203</p>
                  <p className="text-sm text-gray-600">Bài tập đã nộp</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">87%</p>
                  <p className="text-sm text-gray-600">Tỷ lệ hoàn thành</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Class Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất theo khóa học</CardTitle>
              <CardDescription>Điểm trung bình và tỷ lệ hoàn thành</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={classPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="course" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgGrade" fill="#3B82F6" name="Điểm TB" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Grade Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Phân bố điểm số</CardTitle>
              <CardDescription>Tỷ lệ học sinh theo mức điểm</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gradeDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ grade, count }) => `${grade}: ${count}`}
                  >
                    {gradeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Progress */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tiến độ theo tháng</CardTitle>
              <CardDescription>Số lượng bài tập nộp và điểm trung bình</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="submissions" fill="#10B981" name="Bài nộp" />
                  <Line yAxisId="right" type="monotone" dataKey="avgGrade" stroke="#F59E0B" strokeWidth={3} name="Điểm TB" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Students */}
          <Card>
            <CardHeader>
              <CardTitle>Top học sinh xuất sắc</CardTitle>
              <CardDescription>5 học sinh có kết quả tốt nhất</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topStudents.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-600">
                        {student.assignments} bài tập • {student.completion}% hoàn thành
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getGradeColor(student.grade)}`}>
                        {student.grade}
                      </p>
                      <p className="text-xs text-gray-500">điểm TB</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Course Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Thống kê chi tiết khóa học</CardTitle>
              <CardDescription>Thông tin tổng quan theo từng khóa học</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classPerformanceData.map((course, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{course.course}</h4>
                      <span className={`text-lg font-bold ${getGradeColor(course.avgGrade)}`}>
                        {course.avgGrade}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Học sinh: <span className="font-medium">{course.students}</span></p>
                      </div>
                      <div>
                        <p className="text-gray-600">Hoàn thành: <span className="font-medium">{course.completed}%</span></p>
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
