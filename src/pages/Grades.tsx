
import React, { useState } from 'react';
import { Search, Filter, TrendingUp, Award, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/DashboardLayout';
import { useStudentGrades } from '@/hooks/useStudentGrades';
import { useAuth } from '@/hooks/useAuth';

const Grades = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { profile } = useAuth();
  const { data: grades = [], isLoading, error } = useStudentGrades(profile?.id);

  const getGradeColor = (grade: number | null) => {
    if (!grade) return 'text-gray-400';
    if (grade >= 9) return 'text-green-600';
    if (grade >= 8) return 'text-blue-600';
    if (grade >= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'graded':
        return <Badge className="bg-green-100 text-green-800">Đã chấm</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ chấm</Badge>;
      case 'late':
        return <Badge className="bg-red-100 text-red-800">Nộp muộn</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const filteredGrades = grades.filter(grade =>
    grade.assignment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grade.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const gradedAssignments = grades.filter(g => g.grade !== null);
  const averageGrade = gradedAssignments.length > 0 
    ? gradedAssignments.reduce((sum, g) => sum + (g.grade || 0), 0) / gradedAssignments.length 
    : 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Có lỗi xảy ra khi tải dữ liệu</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Điểm số</h1>
            <p className="text-gray-600 mt-2">
              Theo dõi kết quả học tập và nhận xét từ giảng viên
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div>
                  <p className={`text-2xl font-bold ${getGradeColor(averageGrade)}`}>
                    {averageGrade > 0 ? averageGrade.toFixed(1) : '0.0'}
                  </p>
                  <p className="text-sm text-gray-600">Điểm TB</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {gradedAssignments.length}
                  </p>
                  <p className="text-sm text-gray-600">Đã chấm điểm</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {grades.filter(g => g.status === 'pending').length}
                  </p>
                  <p className="text-sm text-gray-600">Chờ chấm</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {gradedAssignments.filter(g => (g.grade || 0) >= 9).length}
                  </p>
                  <p className="text-sm text-gray-600">Điểm A</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm bài tập..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Lọc theo môn
          </Button>
        </div>

        {/* Grades List */}
        <div className="space-y-4">
          {filteredGrades.length > 0 ? (
            filteredGrades.map((gradeItem) => (
              <Card key={gradeItem.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{gradeItem.assignment}</CardTitle>
                      <CardDescription className="flex items-center space-x-2">
                        <span>{gradeItem.course}</span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(gradeItem.status)}
                      {gradeItem.grade !== null && (
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${getGradeColor(gradeItem.grade)}`}>
                            {gradeItem.grade}/{gradeItem.maxGrade}
                          </p>
                          <p className="text-xs text-gray-500">điểm</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      {gradeItem.submittedDate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Ngày nộp:</span>
                          <span className="font-medium">{formatDate(gradeItem.submittedDate)}</span>
                        </div>
                      )}
                      {gradeItem.gradedDate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Ngày chấm:</span>
                          <span className="font-medium">{formatDate(gradeItem.gradedDate)}</span>
                        </div>
                      )}
                      {gradeItem.status === 'pending' && (
                        <div className="text-sm text-yellow-600">
                          Đang chờ giảng viên chấm điểm
                        </div>
                      )}
                    </div>
                    
                    {gradeItem.feedback && (
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">Nhận xét:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {gradeItem.feedback}
                        </p>
                      </div>
                    )}
                  </div>

                  {gradeItem.status === 'pending' && (
                    <div className="mt-4 pt-4 border-t">
                      <Button size="sm" className="w-full md:w-auto">
                        Chờ chấm điểm
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Không tìm thấy bài tập nào' : 'Chưa có bài tập nào'}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Grades;
