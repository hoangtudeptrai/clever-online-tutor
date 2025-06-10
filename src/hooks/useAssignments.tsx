
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  course_id: string;
  created_by: string;
  due_date?: string;
  max_score: number;
  assignment_status: string;
  created_at: string;
  updated_at: string;
  course?: {
    title: string;
  };
  instructor?: {
    full_name: string;
  };
  submission?: {
    id: string;
    status: string;
    grade?: number;
    feedback?: string;
    submitted_at?: string;
  };
}

export const useAssignments = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['assignments', profile?.id, profile?.role],
    queryFn: async () => {
      let query = supabase
        .from('assignments')
        .select(`
          *,
          course:courses(title),
          instructor:profiles!assignments_created_by_fkey(full_name)
        `);

      // If user is a student, also get their submissions
      if (profile?.role === 'student') {
        query = supabase
          .from('assignments')
          .select(`
            *,
            course:courses(title),
            instructor:profiles!assignments_created_by_fkey(full_name),
            submission:assignment_submissions(id, status, grade, feedback, submitted_at)
          `);
      }

      // Filter based on user role
      if (profile?.role === 'tutor') {
        query = query.eq('created_by', profile.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching assignments:', error);
        throw error;
      }

      // Transform the data to match our interface
      const transformedData = data?.map(assignment => ({
        ...assignment,
        instructor: Array.isArray(assignment.instructor) ? assignment.instructor[0] : assignment.instructor,
        course: Array.isArray(assignment.course) ? assignment.course[0] : assignment.course,
        submission: Array.isArray(assignment.submission) ? assignment.submission[0] : assignment.submission
      })) as Assignment[];

      return transformedData;
    },
    enabled: !!profile,
  });
};

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (assignmentData: {
      title: string;
      description?: string;
      course_id: string;
      due_date?: string;
      max_score?: number;
    }) => {
      const { data, error } = await supabase
        .from('assignments')
        .insert({
          ...assignmentData,
          created_by: profile?.id,
          assignment_status: 'published',
          max_score: assignmentData.max_score || 100,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
};

export const useSubmitAssignment = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (submissionData: {
      assignment_id: string;
      content?: string;
    }) => {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .insert({
          ...submissionData,
          student_id: profile?.id,
          status: 'submitted',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
};
