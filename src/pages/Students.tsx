
import React, { useEffect, useState } from 'react';
import { Search, Filter, Mail, Phone, MoreVertical, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DashboardLayout from '@/components/DashboardLayout';
import { getApi } from '@/utils/api';
import { USERS_API } from '@/components/api-url';
import { Student } from '@/types/auth';
import { Link } from 'react-router-dom';

const Students = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await getApi(`${USERS_API.GET_ALL}?role=student`);
      if (res.data.length > 0) {
        setStudents(res.data);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Không hoạt động</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 9) return 'text-green-600';
    if (grade >= 8) return 'text-blue-600';
    if (grade >= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý học sinh</h1>
            <p className="text-gray-600 mt-2">
              Theo dõi thông tin và tiến độ học tập của học sinh
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Thêm học sinh
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm học sinh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Lọc
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{students.length}</p>
                <p className="text-sm text-gray-600">Tổng học sinh</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {students.filter(s => s.status === 'active').length}
                </p>
                <p className="text-sm text-gray-600">Đang hoạt động</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {(students.reduce((sum, s) => sum + s.averageGrade, 0) / students.length).toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Điểm TB chung</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round((students.reduce((sum, s) => sum + (s.completedAssignments / s.totalAssignments), 0) / students.length) * 100)}%
                </p>
                <p className="text-sm text-gray-600">Tỷ lệ hoàn thành BT</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={student.avatar} alt={student.full_name} />
                      <AvatarFallback>{student.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{student.full_name}</CardTitle>
                      <CardDescription>{student.id}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(student.status)}
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{student.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{student.phone_number}</span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Khóa học đang tham gia:</p>
                    <div className="flex flex-wrap gap-1">
                      {/* {student.courses.map((course, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {course}
                        </Badge>
                      ))} */}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Điểm TB:</p>
                      <p className={`font-bold ${getGradeColor(student.averageGrade)}`}>
                        {student.averageGrade}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Bài tập:</p>
                      <p className="font-bold">
                        {student.completedAssignments}/{student.totalAssignments}
                      </p>
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="text-gray-600">Hoạt động cuối:</p>
                    <p className="font-medium">{student.lastActivity}</p>
                  </div>

                  <div className="pt-2">
                    <Link
                      to={`/dashboard/students/${student.id}`}
                      className="block"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        Xem chi tiết
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Students;
