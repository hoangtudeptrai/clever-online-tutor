import React, { useState } from 'react';
import { MoreVertical, Edit, Users, Trash2, Play, Archive, Eye, EyeOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import EditCourseDialog from './EditCourseDialog';
import ManageStudentsDialog from './ManageStudentsDialog';
import coursesHooks from '@/hooks/useCourses';
import { useToast } from '@/hooks/use-toast';

interface CourseActionsMenuProps {
  course: {
    id: string;
    title: string;
    description?: string;
    duration?: string;
    thumbnail?: string;
    students_count: number;
    status: string;
  };
}

const CourseActionsMenu: React.FC<CourseActionsMenuProps> = ({ course }) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStudentsDialog, setShowStudentsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const deleteCourse = coursesHooks.useDeleteCourse();
  const updateCourse = coursesHooks.useUpdateCourse();

  const handleDelete = async () => {
    try {
      await deleteCourse.mutateAsync(course.id);
      toast({
        title: "Xóa khóa học thành công",
        description: `Khóa học "${course.title}" đã được xóa`,
      });
      setShowDeleteDialog(false);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa khóa học. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await updateCourse.mutateAsync({
        courseId: course.id,
        updates: { 
          status: newStatus,
          updated_at: new Date().toISOString()
        }
      });

      const statusText = {
        active: 'kích hoạt',
        draft: 'ẩn',
        archived: 'lưu trữ'
      }[newStatus];

      toast({
        title: "Cập nhật trạng thái thành công",
        description: `Khóa học "${course.title}" đã được ${statusText}`,
      });
    } catch (error) {
      console.error('Error updating course status:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái khóa học. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setShowStudentsDialog(true)}>
            <Users className="h-4 w-4 mr-2" />
            Quản lý học sinh
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {course.status === 'active' ? (
            <DropdownMenuItem onClick={() => handleUpdateStatus('draft')}>
              <EyeOff className="h-4 w-4 mr-2" />
              Ẩn khóa học
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handleUpdateStatus('active')}>
              <Eye className="h-4 w-4 mr-2" />
              Hiện khóa học
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa khóa học
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditCourseDialog
        course={course}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <ManageStudentsDialog
        courseId={course.id}
        courseName={course.title}
        open={showStudentsDialog}
        onOpenChange={setShowStudentsDialog}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa khóa học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khóa học này? 
              Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa khóa học
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CourseActionsMenu;
