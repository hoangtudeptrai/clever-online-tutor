
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface EnrolledCourse {
  id: string;
  title: string;
  description: string | null;
  instructor_name: string | null;
}

export const useEnrolledCourses = () => {
  const { profile } = useAuth();

  return useQuery<EnrolledCourse[]>({
    queryKey: ['enrolled-courses', profile?.id],
    queryFn: async () => {
      if (!profile || profile.role !== 'student') return [];

      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          courses!inner (
            id,
            title,
            description,
            instructor:profiles!instructor_id (full_name)
          )
        `)
        .eq('student_id', profile.id);
      
      if (error) {
        console.error('Error fetching enrolled courses:', error);
        throw error;
      }

      return data.map(item => {
        const courseData = item.courses as any;
        const instructor = courseData?.instructor;
        // The type from Supabase can sometimes be an array for a many-to-one relationship.
        // This handles both cases to be safe.
        const instructorName = Array.isArray(instructor)
          ? instructor[0]?.full_name
          : (instructor as any)?.full_name;

        return {
          id: courseData.id,
          title: courseData.title,
          description: courseData.description,
          instructor_name: instructorName || 'N/A'
        };
      });
    },
    enabled: !!profile && profile.role === 'student'
  });
};
