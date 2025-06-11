
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      // First delete related documents
      const { error: documentsError } = await supabase
        .from('assignment_documents')
        .delete()
        .eq('assignment_id', assignmentId);

      if (documentsError) {
        console.error('Error deleting assignment documents:', documentsError);
        throw documentsError;
      }

      // Then delete submissions and their files
      const { data: submissions } = await supabase
        .from('assignment_submissions')
        .select('id')
        .eq('assignment_id', assignmentId);

      if (submissions && submissions.length > 0) {
        for (const submission of submissions) {
          // Delete submission files
          await supabase
            .from('assignment_submission_files')
            .delete()
            .eq('submission_id', submission.id);
        }

        // Delete submissions
        await supabase
          .from('assignment_submissions')
          .delete()
          .eq('assignment_id', assignmentId);
      }

      // Finally delete the assignment
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast({
        title: "Thành công",
        description: "Đã xóa bài tập thành công",
      });
    },
    onError: (error) => {
      console.error('Error deleting assignment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa bài tập",
        variant: "destructive",
      });
    },
  });
};
