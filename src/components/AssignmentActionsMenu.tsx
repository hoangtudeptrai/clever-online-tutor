
import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, Eye, Play, Archive, Copy } from 'lucide-react';
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

interface AssignmentActionsMenuProps {
  assignment: {
    id: string;
    title: string;
    description?: string;
    course?: {
      title: string;
    };
    due_date?: string;
    max_score?: number;
    assignment_status?: 'draft' | 'published' | 'archived';
  };
}

const AssignmentActionsMenu: React.FC<AssignmentActionsMenuProps> = ({ assignment }) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();
  
  const deleteAssignmentMutation = useDeleteAssignment();
  const updateStatusMutation = useUpdateAssignmentStatus();

  const handleDelete = () => {
    deleteAssignmentMutation.mutate(assignment.id);
    setShowDeleteDialog(false);
  };

  const handleView = () => {
    navigate(`/dashboard/assignments/${assignment.id}`);
  };

  const handlePublish = () => {
    updateStatusMutation.mutate({ 
      assignmentId: assignment.id, 
      status: 'published' 
    });
  };

  const handleArchive = () => {
    updateStatusMutation.mutate({ 
      assignmentId: assignment.id, 
      status: 'archived' 
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

  return (
    <>
      <div className="flex items-center space-x-2">
        <Badge className={getStatusColor(assignment.assignment_status)}>
          {getStatusText(assignment.assignment_status)}
        </Badge>
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
            
            <DropdownMenuSeparator />
            
            {assignment.assignment_status === 'draft' && (
              <DropdownMenuItem onClick={handlePublish}>
                <Play className="h-4 w-4 mr-2" />
                Kích hoạt bài tập
              </DropdownMenuItem>
            )}
            
            {assignment.assignment_status === 'published' && (
              <DropdownMenuItem onClick={handleArchive}>
                <Archive className="h-4 w-4 mr-2" />
                Lưu trữ
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa bài tập
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditAssignmentDialog
        assignment={{
          id: assignment.id,
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
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteAssignmentMutation.isPending}
            >
              {deleteAssignmentMutation.isPending ? 'Đang xóa...' : 'Xóa bài tập'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AssignmentActionsMenu;
