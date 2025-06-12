
import React, { useState } from 'react';
import { Search, Filter, Mail, Phone, MoreVertical, UserPlus, Eye, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DashboardLayout from '@/components/DashboardLayout';
import { useStudents } from '@/hooks/useStudents';
import { useAuth } from '@/hooks/useAuth';

const Students = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { profile } = useAuth();
  const { data: students = [], isLoading } = useStudents();

  const getStatusBadge = (status: string = 'active') => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Không hoạt động</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!profile || profile.role !== 'tutor') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Bạn không có quyền truy cập trang này</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Đang tải danh sách học sinh...</p>
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
                  {students.length}
                </p>
                <p className="text-sm text-gray-600">Đang hoạt động</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">8.5</p>
                <p className="text-sm text-gray-600">Điểm TB chung</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">85%</p>
                <p className="text-sm text-gray-600">Tỷ lệ hoàn thành BT</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        {filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src="" alt={student.full_name} />
                        <AvatarFallback>{student.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{student.full_name}</CardTitle>
                        <CardDescription>{student.email}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge('active')}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Gửi tin nhắn
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Gửi email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{student.email}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Thông tin:</p>
                      <div className="text-sm text-gray-600">
                        <p>ID: {student.id.slice(0, 8)}...</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Điểm TB:</p>
                        <p className="font-bold text-blue-600">8.5/10</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Khóa học:</p>
                        <p className="font-bold">3</p>
                      </div>
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
        ) : (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'Không tìm thấy học sinh nào' : 'Chưa có học sinh nào trong hệ thống'}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Students;
