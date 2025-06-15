import React from 'react';
import { Download, Trash2, FileText, Image, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAssignmentFiles, useDeleteAssignmentFile } from '@/hooks/useAssignmentFiles';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AssignmentFilesListProps {
  assignmentId: string;
  canDelete?: boolean;
}

const AssignmentFilesList: React.FC<AssignmentFilesListProps> = ({ 
  assignmentId, 
  canDelete = false 
}) => {
  const { profile } = useAuth();
  const { data: files = [], isLoading } = useAssignmentFiles(assignmentId);
  const deleteFileMutation = useDeleteAssignmentFile();

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <FileText className="h-4 w-4" />;
    
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = (file: any) => {
    // Create download URL using storage path
    const { data } = supabase.storage
      .from('assignment-files')
      .getPublicUrl(file.file_path);
    
    if (data?.publicUrl) {
      window.open(data.publicUrl, '_blank');
    }
  };

  const handleDelete = async (fileId: string, filePath: string) => {
    await deleteFileMutation.mutateAsync({ fileId, filePath });
  };

  if (isLoading) {
    return <div>Đang tải danh sách file...</div>;
  }

  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          Chưa có file đính kèm nào
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">File đính kèm ({files.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-gray-500">
                  {getFileIcon(file.file_type)}
                </div>
                <div>
                  <p className="font-medium text-sm">{file.title || file.file_name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(file)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Tải xuống
                </Button>
                {canDelete && profile?.role === 'tutor' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa file</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc chắn muốn xóa file "{file.title || file.file_name}"? 
                          Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(file.id, file.file_path)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Xóa file
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentFilesList;
