
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
          .select(`
            *,
            creator:profiles!assignments_created_by_fkey(id, full_name)
          `)
          .eq('course_id', courseId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching course assignments:', error);
          throw error;
        }

        // Transform the data to ensure creator is a single object, not an array
        const transformedData = (data || []).map(assignment => ({
          ...assignment,
          creator: Array.isArray(assignment.creator) 
            ? assignment.creator[0] || null 
            : assignment.creator
        }));

        return transformedData;
      } catch (error) {
        console.error('Error in useCourseAssignments:', error);
        throw error;
      }
    },
    enabled: !!courseId,
  });
};
