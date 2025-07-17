import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useJoinCourse = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!profile) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: courseId,
          student_id: profile.id,
          enrolled_at: new Date().toISOString(),
          status: 'enrolled'
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['enrolled-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      
      toast({
        title: "Thành công",
        description: "Đã tham gia khóa học thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tham gia khóa học",
        variant: "destructive",
      });
    }
  });
};