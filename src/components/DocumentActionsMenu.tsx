import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, Eye, Download } from 'lucide-react';
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
import EditDocumentDialog from './EditDocumentDialog';
import { deleteApi } from '@/utils/api';
import { COURSE_DOCUMENT_API } from './api-url';
import { toast } from 'react-hot-toast';
import { Document } from '@/types/document';

interface DocumentActionsMenuProps {
  document: Document;
  onSuccess: () => void;
}

const DocumentActionsMenu: React.FC<DocumentActionsMenuProps> = ({ document, onSuccess }) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteApi(COURSE_DOCUMENT_API.DELETE(document.id));
      toast.success('Xóa tài liệu thành công');
      setShowDeleteDialog(false);
      onSuccess(); // This will trigger the parent component to refresh the list
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Xóa tài liệu thất bại');
    }
  };

  const handleView = () => {
    console.log('Xem tài liệu:', document.id);
    // Logic xem tài liệu
  };

  const handleDownload = () => {
    console.log('Tải xuống tài liệu:', document.id);
    // Logic tải xuống tài liệu
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
            Xem
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Tải xuống
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
            Xóa tài liệu
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditDocumentDialog
        document={document}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        courseId={document.course_id}
        onSuccess={onSuccess}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tài liệu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài liệu "{document.title}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Xóa tài liệu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DocumentActionsMenu;
