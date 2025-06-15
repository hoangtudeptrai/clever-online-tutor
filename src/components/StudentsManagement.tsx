import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Search, MoreVertical, UserMinus, Mail, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import ManageStudentsDialog from './ManageStudentsDialog';
import StudentDetailDialog from './StudentDetailDialog';
import { useCourseStudents, useUnenrollStudent, type CourseStudent } from '@/hooks/useStudents';
import { useToast } from '@/hooks/use-toast';
import { useCourses } from '@/hooks/useCourses';

const StudentsManagement = () => {
  const { courseId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<CourseStudent | null>(null);
  const [showUnenrollDialog, setShowUnenrollDialog] = useState(false);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const { toast } = useToast();

  const { data: students = [], isLoading, error } = useCourseStudents(courseId || '');
  const { data: courses } = useCourses();
  const unenrollStudent = useUnenrollStudent();

  const currentCourse = courses?.find(course => course.id === courseId);

  const filteredStudents = students.filter(student =>
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUnenrollStudent = async () => {
    if (!selectedStudent || !courseId) return;

    try {
      await unenrollStudent.mutateAsync({
        courseId,
        studentId: selectedStudent
      });
      
      setShowUnenrollDialog(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error('Error unenrolling student:', error);
    }
  };

  const handleViewStudentDetail = (student: CourseStudent) => {
    setSelectedStudentForDetail(student);
    setShowDetailDialog(true);
  };

  const getStatusBadge = (status?: string) => {
    const colors = {
      enrolled: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      dropped: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      enrolled: 'Đang học',
      completed: 'Hoàn thành',
      dropped: 'Đã nghỉ'
    };
    
    const currentStatus = status || 'enrolled';
    
    return (
      <Badge className={colors[currentStatus as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {labels[currentStatus as keyof typeof labels] || currentStatus}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Có lỗi xảy ra khi tải danh sách học sinh. Vui lòng thử lại.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Đang tải danh sách học sinh...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quản lý học sinh ({students.length || 0})</CardTitle>
            <Button onClick={() => setShowManageDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Quản lý học sinh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm học sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Students Table */}
          {filteredStudents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                  <TableHead>Tiến độ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[100px]">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.full_name || 'N/A'}</TableCell>
                    <TableCell>{student.email || 'N/A'}</TableCell>
                    <TableCell>{formatDate(student.enrolled_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${student.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{student.progress || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewStudentDetail(student)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Gửi tin nhắn
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600"
                            onClick={() => {
                              setSelectedStudent(student.id);
                              setShowUnenrollDialog(true);
                            }}
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            Hủy đăng ký
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Không tìm thấy học sinh nào' : 'Chưa có học sinh nào đăng ký khóa học này'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manage Students Dialog */}
      {courseId && (
        <ManageStudentsDialog
          courseId={courseId}
          courseTitle={currentCourse?.title || 'Khóa học'}
          open={showManageDialog}
          onOpenChange={setShowManageDialog}
        />
      )}

      {/* Student Detail Dialog */}
      <StudentDetailDialog
        student={selectedStudentForDetail}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />

      {/* Unenroll Confirmation Dialog */}
      <AlertDialog open={showUnenrollDialog} onOpenChange={setShowUnenrollDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy đăng ký</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy đăng ký học sinh này khỏi khóa học? 
              Học sinh sẽ mất quyền truy cập vào tất cả nội dung của khóa học.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUnenrollStudent}
              className="bg-red-600 hover:bg-red-700"
              disabled={unenrollStudent.isPending}
            >
              {unenrollStudent.isPending ? 'Đang xử lý...' : 'Xác nhận hủy đăng ký'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StudentsManagement;
