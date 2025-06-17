import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import EditAssignmentDialog from './EditAssignmentDialog';
import { deleteApi } from '@/utils/api';
import { ASSIGNMENTS_API } from './api-url';
import { Assignment } from '@/types/assignment';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface AssignmentActionsMenuProps {
  assignment: Assignment;
  onSuccess: () => void;
  courseId: string;
}

const AssignmentActionsMenu: React.FC<AssignmentActionsMenuProps> = ({ assignment, onSuccess, courseId }) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    await deleteApi(`${ASSIGNMENTS_API.DELETE(assignment.id)}`).then(() => {
      onSuccess();
      setShowDeleteDialog(false);
      toast.success('Xóa bài tập thành công');
    }).catch((error) => {
      console.log('error', error);
      toast.error('Xóa bài tập thất bại');
    });
  };

  const handleView = () => {
    navigate(`/dashboard/assignments/${assignment.id}`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="h-4 w-4 mr-2" />
            Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa bài tập
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditAssignmentDialog
        assignment={assignment}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        courseId={courseId}
        onSuccess={onSuccess}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bài tập</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài tập "{assignment.title}"?
              Hành động này không thể hoàn tác và sẽ xóa tất cả bài nộp của học sinh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Xóa bài tập
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AssignmentActionsMenu;
