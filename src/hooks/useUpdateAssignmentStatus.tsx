
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUpdateAssignmentStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ assignmentId, status }: { assignmentId: string; status: 'draft' | 'published' | 'archived' }) => {
      const { error } = await supabase
        .from('assignments')
        .update({ 
          assignment_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', assignmentId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      const statusText = variables.status === 'published' ? 'đã được kích hoạt' : 
                        variables.status === 'archived' ? 'đã được lưu trữ' : 'đã được lưu nháp';
      toast({
        title: "Thành công",
        description: `Bài tập ${statusText}`,
      });
    },
    onError: (error) => {
      console.error('Error updating assignment status:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái bài tập",
        variant: "destructive",
      });
    },
  });
};
