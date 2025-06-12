import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, Eye, Play, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Badge } from '@/components/ui/badge';
import EditAssignmentDialog from './EditAssignmentDialog';
import { useDeleteAssignment } from '@/hooks/useDeleteAssignment';
import { useUpdateAssignmentStatus } from '@/hooks/useUpdateAssignmentStatus';
import { Assignment } from '@/hooks/useAssignments';

interface AssignmentActionsMenuProps {
  assignment: Assignment;
}

const AssignmentActionsMenu: React.FC<AssignmentActionsMenuProps> = ({ assignment }) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const deleteAssignmentMutation = useDeleteAssignment();
  const updateAssignmentStatusMutation = useUpdateAssignmentStatus();

  const handleDelete = () => {
    deleteAssignmentMutation.mutate(assignment.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
      }
    });
  };

  const handleStatusChange = (status: 'draft' | 'published' | 'archived') => {
    updateAssignmentStatusMutation.mutate({
      assignmentId: assignment.id,
      status
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'published':
        return 'Đang hoạt động';
      case 'archived':
        return 'Đã lưu trữ';
      case 'draft':
      default:
        return 'Nháp';
    }
  };

  // Helper function to safely convert max_score to number
  const getMaxScore = (maxScore?: number | string): number => {
    if (typeof maxScore === 'number') {
      return maxScore;
    }
    if (typeof maxScore === 'string') {
      const parsed = parseInt(maxScore, 10);
      return isNaN(parsed) ? 100 : parsed;
    }
    return 100; // default value
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Mở menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate(`/dashboard/assignments/${assignment.id}`)}>
            <Eye className="mr-2 h-4 w-4" />
            Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {assignment.assignment_status === 'draft' && (
            <DropdownMenuItem onClick={() => handleStatusChange('published')}>
              <Play className="mr-2 h-4 w-4" />
              Xuất bản
            </DropdownMenuItem>
          )}
          {assignment.assignment_status === 'published' && (
            <DropdownMenuItem onClick={() => handleStatusChange('archived')}>
              <Archive className="mr-2 h-4 w-4" />
              Lưu trữ
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditAssignmentDialog
        assignment={assignment}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bài tập này sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AssignmentActionsMenu;
