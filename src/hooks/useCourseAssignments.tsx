import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCourseAssignments = (courseId: string) => {
  return useQuery({
    queryKey: ['course-assignments', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select('*', { count: 'exact' })
        .eq('course_id', courseId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!courseId,
  });
}; 