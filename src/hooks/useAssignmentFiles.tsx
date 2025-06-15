
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

export interface AssignmentFile {
  id: string;
  assignment_id: string;
  title: string;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  description?: string;
  created_at: string;
  uploaded_by: string;
}

export const useAssignmentFiles = (assignmentId?: string) => {
  return useQuery({
    queryKey: ['assignment-files', assignmentId],
    queryFn: async () => {
      if (!assignmentId) return [];

      const { data, error } = await supabase
        .from('assignment_documents')
        .select('*')
        .eq('assignment_id', assignmentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AssignmentFile[];
    },
    enabled: !!assignmentId,
  });
};

export const useUploadAssignmentFile = () => {
  const queryClient = useQueryClient();
  const { uploadFile } = useFileUpload();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      assignmentId,
      file,
      uploadedBy,
      title
    }: {
      assignmentId: string;
      file: File;
      uploadedBy: string;
      title?: string;
    }) => {
      // Upload file to storage
      const uploadResult = await uploadFile(file, 'assignment-files', `assignments/${assignmentId}/${Date.now()}_${file.name}`);
      
      if (!uploadResult) {
        throw new Error('Failed to upload file');
      }

      // Save file info to database
      const { data, error } = await supabase
        .from('assignment_documents')
        .insert({
          assignment_id: assignmentId,
          title: title || file.name,
          file_name: file.name,
          file_path: uploadResult.path,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: uploadedBy,
          description: null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assignment-files', variables.assignmentId] });
      toast({
        title: "Thành công",
        description: "Đã tải file lên thành công",
      });
    },
    onError: (error) => {
      console.error('Error uploading assignment file:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải file lên",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteAssignmentFile = () => {
  const queryClient = useQueryClient();
  const { deleteFile } = useFileUpload();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ fileId, filePath }: { fileId: string; filePath: string }) => {
      // Delete from storage
      await deleteFile('assignment-files', filePath);

      // Delete from database
      const { error } = await supabase
        .from('assignment_documents')
        .delete()
        .eq('id', fileId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-files'] });
      toast({
        title: "Thành công",
        description: "Đã xóa file thành công",
      });
    },
    onError: (error) => {
      console.error('Error deleting assignment file:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa file",
        variant: "destructive",
      });
    },
  });
};
