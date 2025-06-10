
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

interface AssignmentActionsMenuProps {
  assignment: {
    id: string;
    title: string;
    description?: string;
    course?: {
      title: string;
    };
    due_date?: string;
  };
}

const AssignmentActionsMenu: React.FC<AssignmentActionsMenuProps> = ({ assignment }) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    console.log('Xóa bài tập:', assignment.id);
    // Logic xóa bài tập
    setShowDeleteDialog(false);
  };

  const handleView = () => {
    console.log('Xem chi tiết bài tập:', assignment.id);
    // Logic xem chi tiết bài tập
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
        assignment={{
          id: parseInt(assignment.id),
          title: assignment.title,
          description: assignment.description || '',
          course: assignment.course?.title || '',
          dueDate: assignment.due_date || ''
        }}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
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
