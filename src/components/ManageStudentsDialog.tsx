
import React, { useState } from 'react';
import { Plus, Trash2, Search, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useStudents, useCourseStudents, useEnrollStudent, useUnenrollStudent } from '@/hooks/useStudents';
import { useToast } from '@/hooks/use-toast';

interface ManageStudentsDialogProps {
  courseId: string;
  courseName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ManageStudentsDialog: React.FC<ManageStudentsDialogProps> = ({ 
  courseId, 
  courseName, 
  open, 
  onOpenChange 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const { toast } = useToast();

  const { data: allStudents = [], isLoading: loadingAllStudents } = useStudents();
  const { data: courseStudents = [], isLoading: loadingCourseStudents } = useCourseStudents(courseId);
  const enrollMutation = useEnrollStudent();
  const unenrollMutation = useUnenrollStudent();

  const availableStudents = allStudents.filter(
    student => !courseStudents.find(enrolled => enrolled.id === student.id)
  );

  const filteredStudents = courseStudents.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEnrollStudent = async () => {
    if (!selectedStudent) return;

    try {
      await enrollMutation.mutateAsync({ courseId, studentId: selectedStudent });
      setSelectedStudent('');
      toast({
        title: "Thành công",
        description: "Đã thêm học sinh vào khóa học",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm học sinh vào khóa học",
        variant: "destructive",
      });
    }
  };

  const handleUnenrollStudent = async (studentId: string) => {
    try {
      await unenrollMutation.mutateAsync({ courseId, studentId });
      toast({
        title: "Thành công",
        description: "Đã xóa học sinh khỏi khóa học",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa học sinh khỏi khóa học",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quản lý học sinh - {courseName}</DialogTitle>
          <DialogDescription>
            Thêm hoặc xóa học sinh khỏi khóa học
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thêm học sinh mới */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">Thêm học sinh mới</h3>
            <div className="flex space-x-3">
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Chọn học sinh..." />
                </SelectTrigger>
                <SelectContent>
                  {availableStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name} ({student.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleEnrollStudent}
                disabled={!selectedStudent || enrollMutation.isPending}
              >
                {enrollMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Thêm
              </Button>
            </div>
          </div>

          {/* Danh sách học sinh hiện tại */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Học sinh trong khóa học ({courseStudents.length})</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm học sinh..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>

            {loadingCourseStudents ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Đang tải dữ liệu...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên học sinh</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Ngày đăng ký</TableHead>
                    <TableHead>Tiến độ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {searchTerm ? 'Không tìm thấy học sinh nào' : 'Chưa có học sinh nào trong khóa học'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.full_name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          {student.enrolled_at ? new Date(student.enrolled_at).toLocaleDateString('vi-VN') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${student.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{student.progress || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.status === 'enrolled' ? 'default' : 'secondary'}>
                            {student.status === 'enrolled' ? 'Đang học' : student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnenrollStudent(student.id)}
                            disabled={unenrollMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageStudentsDialog;
