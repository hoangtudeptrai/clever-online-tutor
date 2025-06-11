
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Student {
  id: string;
  full_name: string;
  email: string;
  enrolled_at?: string;
  progress?: number;
  status?: string;
}

export const useStudents = () => {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'student');

      if (error) throw error;
      return data as Student[];
    },
  });
};

export const useCourseStudents = (courseId: string) => {
  return useQuery({
    queryKey: ['course-students', courseId],
    queryFn: async () => {
      // First get the enrollments
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('course_enrollments')
        .select('student_id, enrolled_at, progress, status')
        .eq('course_id', courseId);

      if (enrollmentError) throw enrollmentError;

      if (!enrollments || enrollments.length === 0) {
        return [];
      }

      // Then get the student profiles
      const studentIds = enrollments.map(enrollment => enrollment.student_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', studentIds);

      if (profileError) throw profileError;

      // Combine the data
      return enrollments.map(enrollment => {
        const profile = profiles?.find(p => p.id === enrollment.student_id);
        return {
          id: enrollment.student_id,
          full_name: profile?.full_name || '',
          email: profile?.email || '',
          enrolled_at: enrollment.enrolled_at,
          progress: enrollment.progress,
          status: enrollment.status
        };
      }) as Student[];
    },
    enabled: !!courseId,
  });
};

export const useEnrollStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, studentId }: { courseId: string; studentId: string }) => {
      const { data, error } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: courseId,
          student_id: studentId,
          status: 'enrolled',
          progress: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-students', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useUnenrollStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, studentId }: { courseId: string; studentId: string }) => {
      const { error } = await supabase
        .from('course_enrollments')
        .delete()
        .eq('course_id', courseId)
        .eq('student_id', studentId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-students', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};
