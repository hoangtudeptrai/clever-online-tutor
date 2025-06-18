
import React, { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Mail, Phone, User, UserCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CourseEnrollment } from '@/types/course';
import { deleteApi, getApi, postApi } from '@/utils/api';
import { COURSE_ENROLLMENTS_API, USERS_API } from './api-url';
import { toast } from 'react-hot-toast';
import { User as UserType } from '@/types/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { formatDate } from '@/utils/format';

interface StudentsManagementProps {
  courseId: string;
}

const StudentsManagement = ({ courseId }: StudentsManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [courseEnrollments, setCourseEnrollments] = useState<CourseEnrollment[]>([]);
  const [students, setStudents] = useState<UserType[]>([]);
  const [formData, setFormData] = useState({
    course_id: courseId,
    student_id: '',
    status: 'active'
  });

  useEffect(() => {
    fetchCourseEnrollments();
  }, []);

  const fetchCourseEnrollments = async () => {
    try {
      const res = await getApi(`${COURSE_ENROLLMENTS_API.GET_BY_COURSE_ID(courseId)}`);

      if (res.data.length > 0) {
        const students = await Promise.all(res.data.map(async (enrollment: CourseEnrollment) => {
          const student = await fetchStudentById(enrollment.student_id);
          return {
            ...enrollment,
            full_name: student.full_name,
            email: student.email,
            avatar: student.avatar,
            phone: student.phone,
          };
        }));
        console.log('students', students);
        setCourseEnrollments(students);
      } else {
        setCourseEnrollments([]);
      }
    } catch (error) {
      console.log('error', error);
      toast.error('Lỗi khi lấy danh sách học sinh');
    }
  }

  const fetchStudentById = async (studentId: string) => {
    try {
      const res = await getApi(`${USERS_API.GET_BY_ID(studentId)}`);
      return res.data;
    } catch (error) {
      console.log('error', error);
      toast.error('Lỗi khi lấy thông tin học sinh');
    }
  }

  const fetchStudents = async () => {
    try {
      const res = await getApi(`${USERS_API.GET_ALL}?role=student`);
      if (res.data.length > 0) {
        setStudents(res.data);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.log('error', error);
    }
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    await postApi(`${COURSE_ENROLLMENTS_API.CREATE}`, {
      course_id: courseId,
      student_id: formData.student_id,
      status: 'enrolled'
    }).then((res) => {
      toast.success('Thêm học sinh thành công');
      fetchCourseEnrollments();
      setShowAddDialog(false);
      setFormData({ course_id: courseId, student_id: '', status: 'enrolled' });
    }).catch((err) => {
      console.log('err', err);
      toast.error('Thêm học sinh thất bại');
    });
  };

  const handleDeleteStudent = async () => {
    await deleteApi(`${COURSE_ENROLLMENTS_API.DELETE(selectedStudent.id)}`).then((res) => {
      toast.success('Xóa học sinh thành công');
      fetchCourseEnrollments();
      setShowDeleteDialog(false);
      setSelectedStudent(null);
    }).catch((err) => {
      console.log('err', err);
      toast.error('Xóa học sinh thất bại');
    });
  };

  const filteredStudents = courseEnrollments.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý học sinh</h2>
          <p className="text-gray-600">Danh sách học sinh trong khóa học</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Thêm học sinh
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm học sinh mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin học sinh để thêm vào khóa học
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <Label>Học sinh</Label>
                <Select
                  value={formData.student_id}
                  onValueChange={(value) => setFormData({ ...formData, student_id: value })}
                  onOpenChange={() => {
                    fetchStudents();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn học sinh" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name} - {student.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Thêm học sinh
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Tìm kiếm học sinh..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tổng học sinh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <User className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold">{courseEnrollments.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Đang hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <UserCheck className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold">{courseEnrollments.filter(s => s.status === 'enrolled').length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Mới tham gia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Plus className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold">2</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách học sinh</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Học sinh</TableHead>
                {/* <TableHead>Mã SV</TableHead> */}
                <TableHead>Liên hệ</TableHead>
                <TableHead>Ngày tham gia</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={student.avatar} alt={student.full_name} />
                        <AvatarFallback>{student.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{student.full_name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* <TableCell className="font-mono">{student.student_code}</TableCell> */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-sm">
                        <Mail className="h-3 w-3" />
                        <span>{student.email}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <Phone className="h-3 w-3" />
                        <span>{student.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(student.enrolled_at)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Đang học
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        {filteredStudents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy học sinh nào
          </div>
        )}
      </Card>



      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa học sinh</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa học sinh "{selectedStudent?.name}" khỏi khóa học?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStudent} className="bg-red-600 hover:bg-red-700">
              Xóa học sinh
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentsManagement;
