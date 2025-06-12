
import React from 'react';
import { User, Mail, Phone, Calendar, TrendingUp, BookOpen, Award } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Student } from '@/hooks/useStudents';

interface StudentDetailDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StudentDetailDialog: React.FC<StudentDetailDialogProps> = ({ 
  student, 
  open, 
  onOpenChange 
}) => {
  if (!student) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thông tin chi tiết học sinh</DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết và tiến độ học tập của học sinh
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Profile */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={student.avatar_url || ''} alt={student.full_name} />
                  <AvatarFallback className="text-lg">
                    {student.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-xl">{student.full_name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className="bg-green-100 text-green-800">Đang hoạt động</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{student.email}</span>
                </div>
                {student.phone_number && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{student.phone_number}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Tham gia: {formatDate(student.created_at)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">ID: {student.id.slice(0, 8)}...</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-sm text-gray-600">Khóa học</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">85%</p>
                    <p className="text-sm text-gray-600">Tiến độ TB</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Award className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">8.5</p>
                    <p className="text-sm text-gray-600">Điểm TB</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Nộp bài tập: Lập trình Web</p>
                    <p className="text-sm text-gray-600">2 ngày trước</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Tham gia khóa học: React Nâng cao</p>
                    <p className="text-sm text-gray-600">1 tuần trước</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Mới</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailDialog;
