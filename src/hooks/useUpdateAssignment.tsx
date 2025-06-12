
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      assignmentId,
      assignmentData
    }: {
      assignmentId: string;
      assignmentData: {
        title: string;
        description?: string;
        course_id: string;
        due_date?: string | null;
        max_score?: number;
      };
    }) => {
      const { data, error } = await supabase
        .from('assignments')
        .update({
          title: assignmentData.title,
          description: assignmentData.description,
          course_id: assignmentData.course_id,
          due_date: assignmentData.due_date,
          max_score: assignmentData.max_score,
          updated_at: new Date().toISOString()
        })
        .eq('id', assignmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignment'] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật bài tập thành công",
      });
    },
    onError: (error) => {
      console.error('Error updating assignment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật bài tập",
        variant: "destructive",
      });
    },
  });
};
