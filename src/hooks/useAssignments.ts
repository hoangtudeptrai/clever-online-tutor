
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  created_by: string;
  status: 'draft' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
  course?: {
    title: string;
  };
  submission?: {
    id: string;
    submitted_at: string;
    grade: number | null;
    status: 'pending' | 'submitted' | 'graded' | 'late';
  };
  submissions_count?: number;
  total_students?: number;
}

export const useAssignments = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['assignments', user?.role, user?.id],
    queryFn: async () => {
      if (user?.role === 'teacher') {
        // Teachers see assignments from their courses with submission counts
        const { data, error } = await supabase
          .from('assignments')
          .select(`
            *,
            course:courses!inner(title),
            submissions:assignment_submissions(count)
          `)
          .eq('course.instructor_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform data to add submission counts
        return data?.map(assignment => ({
          ...assignment,
          submissions_count: assignment.submissions?.length || 0,
          total_students: 0 // This would need a separate query to get actual student count
        })) || [];
      } else {
        // Students see assignments from courses they're enrolled in with their submission status
        const { data, error } = await supabase
          .from('assignments')
          .select(`
            *,
            course:courses!inner(title),
            submissions:assignment_submissions(id, submitted_at, grade, status)
          `)
          .eq('course.course_enrollments.student_id', user.id)
          .eq('submissions.student_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform data to use single submission object for students
        return data?.map(assignment => ({
          ...assignment,
          submission: assignment.submissions?.[0] || null,
          submissions: undefined // Remove the array version
        })) || [];
      }
    },
    enabled: !!user
  });
};

export const useCourseAssignments = (courseId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['course-assignments', courseId, user?.id],
    queryFn: async () => {
      if (user?.role === 'student') {
        // Include student's submission if they are a student
        const { data, error } = await supabase
          .from('assignments')
          .select(`
            *,
            assignment_documents(*),
            submissions:assignment_submissions(id, submitted_at, grade, status)
          `)
          .eq('course_id', courseId)
          .eq('submissions.student_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform data to use single submission object
        return data?.map(assignment => ({
          ...assignment,
          submission: assignment.submissions?.[0] || null,
          submissions: undefined
        })) || [];
      } else {
        // Teacher view without submission data
        const { data, error } = await supabase
          .from('assignments')
          .select(`
            *,
            assignment_documents(*)
          `)
          .eq('course_id', courseId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      }
    },
    enabled: !!courseId && !!user
  });
};

export const useAssignment = (assignmentId: string) => {
  return useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          course:courses(title, instructor_id),
          assignment_documents(*),
          submissions:assignment_submissions(
            id,
            student_id,
            submitted_at,
            grade,
            feedback,
            status
          )
        `)
        .eq('id', assignmentId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!assignmentId
  });
};
