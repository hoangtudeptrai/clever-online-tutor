
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      // Xóa tất cả các bản ghi liên quan trước
      await Promise.all([
        // Xóa tài liệu của khóa học
        supabase.from('course_documents').delete().eq('course_id', courseId),
        // Xóa bài tập của khóa học
        supabase.from('assignments').delete().eq('course_id', courseId),
        // Xóa học sinh đăng ký khóa học
        supabase.from('course_enrollments').delete().eq('course_id', courseId),
      ]);

      // Sau đó xóa khóa học
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate all course-related queries
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      // Force refetch
      queryClient.refetchQueries({ queryKey: ['courses'] });
    },
  });
};
