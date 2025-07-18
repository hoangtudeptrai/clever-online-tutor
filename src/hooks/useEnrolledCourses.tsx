
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
            instructor_id
          )
        `)
        .eq('student_id', profile.id);
      
      if (error) {
        console.error('Error fetching enrolled courses:', error);
        throw error;
      }

      // Get instructor details separately
      const courseIds = data.map(item => item.courses.id);
      const { data: instructors } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', data.map(item => item.courses.instructor_id));
      
      return data.map(item => {
        const courseData = item.courses as any;
        const instructor = instructors?.find(i => i.id === courseData.instructor_id);

        return {
          id: courseData.id,
          title: courseData.title,
          description: courseData.description,
          instructor_name: instructor?.full_name || 'N/A'
        };
      });
    },
    enabled: !!profile && profile.role === 'student'
  });
};
