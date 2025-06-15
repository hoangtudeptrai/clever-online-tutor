
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCourseAssignments = (courseId: string) => {
  return useQuery({
    queryKey: ['course-assignments', courseId],
    queryFn: async () => {
      if (!courseId) return [];

      try {
        const { data, error } = await supabase
          .from('assignments')
          .select('*')
          .eq('course_id', courseId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching course assignments:', error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error('Error in useCourseAssignments:', error);
        throw error;
      }
    },
    enabled: !!courseId,
  });
};
