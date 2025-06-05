
import React, { useState } from 'react';
import { Search, Filter, Mail, Phone, MoreVertical, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DashboardLayout from '@/components/DashboardLayout';

const Students = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const students = [
    {
      id: 1,
      name: 'Nguyễn Văn An',
      email: 'an.nguyen@email.com',
      phone: '0901234567',
      studentId: 'SV001',
      courses: ['Lập trình Web', 'React Nâng cao'],
      avatar: '/placeholder.svg',
      status: 'active',
      totalAssignments: 15,
      completedAssignments: 12,
      averageGrade: 8.5,
      lastActivity: '2025-04-10'
    },
    {
      id: 2,
      name: 'Trần Thị Bình',
      email: 'binh.tran@email.com',
      phone: '0902345678',
      studentId: 'SV002',
      courses: ['Lập trình Web', 'Node.js Cơ bản'],
      avatar: '/placeholder.svg',
      status: 'active',
      totalAssignments: 18,
      completedAssignments: 16,
      averageGrade: 9.2,
      lastActivity: '2025-04-12'
    },
    {
      id: 3,
      name: 'Lê Văn Cường',
      email: 'cuong.le@email.com',
      phone: '0903456789',
      studentId: 'SV003',
      courses: ['React Nâng cao'],
      avatar: '/placeholder.svg',
      status: 'inactive',
      totalAssignments: 8,
      completedAssignments: 5,
      averageGrade: 7.8,
      lastActivity: '2025-03-28'
    },
    {
      id: 4,
      name: 'Phạm Thị Dung',
      email: 'dung.pham@email.com',
      phone: '0904567890',
      studentId: 'SV004',
      courses: ['Lập trình Web', 'Database Design'],
      avatar: '/placeholder.svg',
      status: 'active',
      totalAssignments: 12,
      completedAssignments: 11,
      averageGrade: 8.9,
      lastActivity: '2025-04-11'
    },
    {
      id: 5,
      name: 'Hoàng Văn Em',
      email: 'em.hoang@email.com',
      phone: '0905678901',
      studentId: 'SV005',
      courses: ['Node.js Cơ bản'],
      avatar: '/placeholder.svg',
      status: 'active',
      totalAssignments: 10,
      completedAssignments: 8,
      averageGrade: 8.1,
      lastActivity: '2025-04-09'
    },
    {
      id: 6,
      name: 'Vũ Thị Giang',
      email: 'giang.vu@email.com',
      phone: '0906789012',
      studentId: 'SV006',
      courses: ['Lập trình Web', 'React Nâng cao', 'Database Design'],
      avatar: '/placeholder.svg',
      status: 'active',
      totalAssignments: 20,
      completedAssignments: 18,
      averageGrade: 9.5,
      lastActivity: '2025-04-12'
    }
  ];

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
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
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
                      <AvatarImage src={student.avatar} alt={student.name} />
                      <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{student.name}</CardTitle>
                      <CardDescription>{student.studentId}</CardDescription>
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
                    <span className="text-gray-600">{student.phone}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Khóa học đang tham gia:</p>
                    <div className="flex flex-wrap gap-1">
                      {student.courses.map((course, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {course}
                        </Badge>
                      ))}
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
                    <Button variant="outline" size="sm" className="w-full">
                      Xem chi tiết
                    </Button>
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
