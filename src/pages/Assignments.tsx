
import React, { useState } from 'react';
import { Plus, Search, Filter, Calendar, User, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';

interface TeacherAssignment {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  submitted: number;
  total: number;
  status: string;
  description: string;
}

interface StudentAssignment {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  submittedDate: string | null;
  status: string;
  grade: number | null;
  description: string;
}

const Assignments = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const teacherAssignments: TeacherAssignment[] = [
    {
      id: 1,
      title: 'Bài tập 1: Cơ bản HTML/CSS',
      course: 'Lập trình Web',
      dueDate: '2025-04-15',
      submitted: 25,
      total: 30,
      status: 'active',
      description: 'Tạo một trang web cơ bản sử dụng HTML và CSS'
    },
    {
      id: 2,
      title: 'Bài tập 2: JavaScript DOM',
      course: 'Lập trình Web',
      dueDate: '2025-04-20',
      submitted: 18,
      total: 30,
      status: 'active',
      description: 'Thao tác DOM với JavaScript'
    },
    {
      id: 3,
      title: 'Bài tập 3: React Components',
      course: 'React Nâng cao',
      dueDate: '2025-04-10',
      submitted: 22,
      total: 25,
      status: 'completed',
      description: 'Tạo components React tái sử dụng'
    },
    {
      id: 4,
      title: 'Bài tập 4: Node.js API',
      course: 'Node.js Cơ bản',
      dueDate: '2025-04-25',
      submitted: 0,
      total: 20,
      status: 'draft',
      description: 'Xây dựng REST API với Node.js'
    }
  ];

  const studentAssignments: StudentAssignment[] = [
    {
      id: 1,
      title: 'Bài tập 1: Cơ bản HTML/CSS',
      course: 'Lập trình Web',
      dueDate: '2025-04-15',
      submittedDate: '2025-04-12',
      status: 'submitted',
      grade: 9.0,
      description: 'Tạo một trang web cơ bản sử dụng HTML và CSS'
    },
    {
      id: 2,
      title: 'Bài tập 2: JavaScript DOM',
      course: 'Lập trình Web',
      dueDate: '2025-04-20',
      submittedDate: null,
      status: 'pending',
      grade: null,
      description: 'Thao tác DOM với JavaScript'
    },
    {
      id: 3,
      title: 'Bài tập 3: React Components',
      course: 'React Nâng cao',
      dueDate: '2025-04-10',
      submittedDate: '2025-04-11',
      status: 'late',
      grade: 7.5,
      description: 'Tạo components React tái sử dụng'
    }
  ];

  const getStatusBadge = (status: string) => {
    if (user?.role === 'teacher') {
      switch (status) {
        case 'active':
          return <Badge className="bg-blue-100 text-blue-800">Đang diễn ra</Badge>;
        case 'completed':
          return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>;
        case 'draft':
          return <Badge className="bg-gray-100 text-gray-800">Nháp</Badge>;
        default:
          return <Badge>{status}</Badge>;
      }
    } else {
      switch (status) {
        case 'submitted':
          return <Badge className="bg-green-100 text-green-800">Đã nộp</Badge>;
        case 'pending':
          return <Badge className="bg-yellow-100 text-yellow-800">Chưa nộp</Badge>;
        case 'late':
          return <Badge className="bg-red-100 text-red-800">Nộp muộn</Badge>;
        default:
          return <Badge>{status}</Badge>;
      }
    }
  };

  const getStatusIcon = (status: string) => {
    if (user?.role === 'teacher') {
      switch (status) {
        case 'completed':
          return <CheckCircle className="h-5 w-5 text-green-600" />;
        case 'active':
          return <Clock className="h-5 w-5 text-blue-600" />;
        case 'draft':
          return <XCircle className="h-5 w-5 text-gray-600" />;
        default:
          return <Clock className="h-5 w-5" />;
      }
    } else {
      switch (status) {
        case 'submitted':
          return <CheckCircle className="h-5 w-5 text-green-600" />;
        case 'pending':
          return <Clock className="h-5 w-5 text-yellow-600" />;
        case 'late':
          return <XCircle className="h-5 w-5 text-red-600" />;
        default:
          return <Clock className="h-5 w-5" />;
      }
    }
  };

  const assignments = user?.role === 'teacher' ? teacherAssignments : studentAssignments;

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === 'teacher' ? 'Quản lý bài tập' : 'Bài tập của tôi'}
            </h1>
            <p className="text-gray-600 mt-2">
              {user?.role === 'teacher' 
                ? 'Tạo và quản lý bài tập cho học sinh'
                : 'Theo dõi và nộp bài tập được giao'
              }
            </p>
          </div>
          {user?.role === 'teacher' && (
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Tạo bài tập mới
            </Button>
          )}
        </div>

        {/* Search and Filter */}
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
            Lọc
          </Button>
        </div>

        {/* Assignments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(assignment.status)}
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                  </div>
                  {getStatusBadge(assignment.status)}
                </div>
                <CardDescription className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{assignment.course}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{assignment.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      Hạn nộp:
                    </span>
                    <span className="font-medium">{assignment.dueDate}</span>
                  </div>

                  {user?.role === 'teacher' ? (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Đã nộp:</span>
                      <span className="font-medium">
                        {(assignment as TeacherAssignment).submitted}/{(assignment as TeacherAssignment).total}
                      </span>
                    </div>
                  ) : (
                    <>
                      {(assignment as StudentAssignment).submittedDate && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Ngày nộp:</span>
                          <span className="font-medium">{(assignment as StudentAssignment).submittedDate}</span>
                        </div>
                      )}
                      {(assignment as StudentAssignment).grade && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Điểm:</span>
                          <span className="font-medium text-blue-600">{(assignment as StudentAssignment).grade}/10</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    {user?.role === 'teacher' ? 'Xem chi tiết' : 
                      assignment.status === 'pending' ? 'Nộp bài' : 'Xem chi tiết'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Assignments;
