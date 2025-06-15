
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCourseAssignments = (courseId: string) => {
  return useQuery({
    queryKey: ['course-assignments', courseId],
    queryFn: async () => {
      if (!courseId) return [];

      try {
        // Step 1: Fetch assignments for the course
        const { data: assignments, error: assignmentsError } = await supabase
          .from('assignments')
          .select('*')
          .eq('course_id', courseId)
          .order('created_at', { ascending: false });

        if (assignmentsError) {
          console.error('Error fetching course assignments:', assignmentsError);
          throw assignmentsError;
        }

        if (!assignments || assignments.length === 0) {
          return [];
        }

        // Step 2: Fetch creator profiles for these assignments
        const creatorIds = [...new Set(assignments.map(a => a.created_by).filter(id => !!id))];
        if (creatorIds.length === 0) {
          return assignments.map(assignment => ({...assignment, creator: null}));
        }

        const { data: creators, error: creatorsError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', creatorIds);

        if (creatorsError) {
          console.error('Error fetching creators for assignments:', creatorsError);
          // Return assignments without creator info if creators fetch fails
          return assignments.map(assignment => ({...assignment, creator: null}));
        }
        
        const creatorsMap = new Map((creators || []).map(c => [c.id, c]));
        
        // Step 3: Combine assignments with creator data
        const transformedData = assignments.map(assignment => ({
          ...assignment,
          creator: creatorsMap.get(assignment.created_by) || null
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
