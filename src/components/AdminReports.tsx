
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Download, Users, BookOpen, ClipboardList, BarChart3, Calendar, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminReports = () => {
  const [reportType, setReportType] = useState('overview');
  const [timeRange, setTimeRange] = useState('month');
  const { toast } = useToast();

  // Fetch báo cáo tổng quan
  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['admin-overview-report'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: totalCourses },
        { count: totalAssignments },
        { count: totalSubmissions },
        { count: totalDocuments }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('assignments').select('*', { count: 'exact', head: true }),
        supabase.from('assignment_submissions').select('*', { count: 'exact', head: true }),
        supabase.from('course_documents').select('*', { count: 'exact', head: true })
      ]);

      return {
        totalUsers: totalUsers || 0,
        totalCourses: totalCourses || 0,
        totalAssignments: totalAssignments || 0,
        totalSubmissions: totalSubmissions || 0,
        totalDocuments: totalDocuments || 0
      };
    }
  });

  // Fetch báo cáo hoạt động học tập
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['admin-activity-report', timeRange],
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

      const [
        { data: submissions },
        { data: enrollments },
        { data: courses }
      ] = await Promise.all([
        supabase
          .from('assignment_submissions')
          .select('submitted_at, grade, status')
          .gte('submitted_at', startDate.toISOString())
          .lte('submitted_at', now.toISOString()),
        supabase
          .from('course_enrollments')
          .select('enrolled_at, course_id')
          .gte('enrolled_at', startDate.toISOString())
          .lte('enrolled_at', now.toISOString()),
        supabase
          .from('courses')
          .select('created_at, title, status')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', now.toISOString())
      ]);

      const gradedSubmissions = submissions?.filter(s => s.status === 'graded') || [];
      const avgGrade = gradedSubmissions.length > 0
        ? gradedSubmissions.reduce((acc, curr) => acc + (curr.grade || 0), 0) / gradedSubmissions.length
        : 0;

      const completionRate = submissions?.length ? (gradedSubmissions.length / submissions.length) * 100 : 0;

      return {
        totalSubmissions: submissions?.length || 0,
        gradedSubmissions: gradedSubmissions.length,
        avgGrade,
        completionRate,
        newEnrollments: enrollments?.length || 0,
        newCourses: courses?.length || 0
      };
    }
  });

  // Fetch báo cáo điểm số
  const { data: gradeData, isLoading: gradeLoading } = useQuery({
    queryKey: ['admin-grade-report'],
    queryFn: async () => {
      const { data: submissions } = await supabase
        .from('assignment_submissions')
        .select('grade, status')
        .eq('status', 'graded')
        .not('grade', 'is', null);

      const grades = submissions?.map(s => s.grade || 0) || [];
      const gradeDistribution = {
        excellent: grades.filter(g => g >= 9).length,
        good: grades.filter(g => g >= 8 && g < 9).length,
        average: grades.filter(g => g >= 7 && g < 8).length,
        below: grades.filter(g => g >= 6 && g < 7).length,
        poor: grades.filter(g => g < 6).length
      };

      return {
        totalGraded: grades.length,
        avgGrade: grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0,
        gradeDistribution
      };
    }
  });

  const handleExportReport = async (format: 'excel' | 'pdf') => {
    try {
      toast({
        title: "Đang xuất báo cáo...",
        description: `Báo cáo ${format.toUpperCase()} sẽ được tải xuống trong giây lát.`,
      });

      // Tạo dữ liệu báo cáo
      const reportData = {
        overview: overviewData,
        activity: activityData,
        grades: gradeData,
        generatedAt: new Date().toISOString(),
        reportType,
        timeRange
      };

      // Tạo và tải file
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `bao-cao-admin-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      toast({
        title: "Xuất báo cáo thành công!",
        description: `Báo cáo đã được tải xuống dưới dạng ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Lỗi xuất báo cáo",
        description: "Đã xảy ra lỗi khi xuất báo cáo. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const isLoading = overviewLoading || activityLoading || gradeLoading;

  return (
    <div className="space-y-6">
      {/* Header và controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Báo cáo & Thống kê</h2>
          <p className="text-gray-600 mt-1">Xem và xuất báo cáo tổng quan hệ thống</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Chọn thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="quarter">Quý này</SelectItem>
              <SelectItem value="year">Năm này</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => handleExportReport('excel')}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Xuất Excel</span>
          </Button>
          <Button 
            onClick={() => handleExportReport('pdf')}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Xuất PDF</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
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
      ) : (
        <div className="space-y-6">
          {/* Báo cáo tổng quan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <span>Báo cáo tổng quan</span>
              </CardTitle>
              <CardDescription>
                Thống kê tổng quát về hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div className="text-blue-600 font-medium">Người dùng</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-700 mt-2">
                    {overviewData?.totalUsers.toLocaleString()}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    <div className="text-green-600 font-medium">Khóa học</div>
                  </div>
                  <div className="text-2xl font-bold text-green-700 mt-2">
                    {overviewData?.totalCourses.toLocaleString()}
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <ClipboardList className="h-5 w-5 text-purple-600" />
                    <div className="text-purple-600 font-medium">Bài tập</div>
                  </div>
                  <div className="text-2xl font-bold text-purple-700 mt-2">
                    {overviewData?.totalAssignments.toLocaleString()}
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-yellow-600" />
                    <div className="text-yellow-600 font-medium">Bài nộp</div>
                  </div>
                  <div className="text-2xl font-bold text-yellow-700 mt-2">
                    {overviewData?.totalSubmissions.toLocaleString()}
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-red-600" />
                    <div className="text-red-600 font-medium">Tài liệu</div>
                  </div>
                  <div className="text-2xl font-bold text-red-700 mt-2">
                    {overviewData?.totalDocuments.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Báo cáo hoạt động */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-6 w-6 text-green-600" />
                <span>Hoạt động học tập ({timeRange === 'week' ? 'Tuần' : timeRange === 'month' ? 'Tháng' : timeRange === 'quarter' ? 'Quý' : 'Năm'} này)</span>
              </CardTitle>
              <CardDescription>
                Thống kê hoạt động trong khoảng thời gian đã chọn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                  <div className="font-medium">Bài tập đã nộp</div>
                  <div className="text-2xl font-bold mt-2">
                    {activityData?.totalSubmissions.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
                  <div className="font-medium">Đã chấm điểm</div>
                  <div className="text-2xl font-bold mt-2">
                    {activityData?.gradedSubmissions.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
                  <div className="font-medium">Tỷ lệ hoàn thành</div>
                  <div className="text-2xl font-bold mt-2">
                    {activityData?.completionRate.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
                  <div className="font-medium">Điểm trung bình</div>
                  <div className="text-2xl font-bold mt-2">
                    {activityData?.avgGrade.toFixed(1)}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg">
                  <div className="font-medium">Đăng ký mới</div>
                  <div className="text-2xl font-bold mt-2">
                    {activityData?.newEnrollments.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 rounded-lg">
                  <div className="font-medium">Khóa học mới</div>
                  <div className="text-2xl font-bold mt-2">
                    {activityData?.newCourses.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Báo cáo điểm số */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-purple-600" />
                <span>Phân tích điểm số</span>
              </CardTitle>
              <CardDescription>
                Thống kê và phân bố điểm số của học sinh
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Tổng bài đã chấm:</span>
                    <Badge variant="outline">{gradeData?.totalGraded.toLocaleString()}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Điểm trung bình:</span>
                    <Badge variant="default">{gradeData?.avgGrade.toFixed(2)}</Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Xuất sắc (9-10):</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${gradeData?.totalGraded ? (gradeData.gradeDistribution.excellent / gradeData.totalGraded) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{gradeData?.gradeDistribution.excellent}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Giỏi (8-8.9):</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${gradeData?.totalGraded ? (gradeData.gradeDistribution.good / gradeData.totalGraded) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{gradeData?.gradeDistribution.good}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Khá (7-7.9):</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${gradeData?.totalGraded ? (gradeData.gradeDistribution.average / gradeData.totalGraded) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{gradeData?.gradeDistribution.average}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Trung bình (6-6.9):</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${gradeData?.totalGraded ? (gradeData.gradeDistribution.below / gradeData.totalGraded) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{gradeData?.gradeDistribution.below}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Yếu (&lt;6):</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${gradeData?.totalGraded ? (gradeData.gradeDistribution.poor / gradeData.totalGraded) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{gradeData?.gradeDistribution.poor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
