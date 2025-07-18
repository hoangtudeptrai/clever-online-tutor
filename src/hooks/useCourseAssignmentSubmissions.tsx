import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  grade?: number;
  status: string;
  submitted_at?: string;
  graded_at?: string;
  feedback?: string;
  student?: {
    id: string;
    full_name: string;
  };
}

export interface AssignmentWithSubmissions {
  assignment_id: string;
  submissions: AssignmentSubmission[];
}

export const useCourseAssignmentSubmissions = (courseId: string) => {
  return useQuery({
    queryKey: ['course-assignment-submissions', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      // 1. Lấy tất cả assignments của course
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select('id')
        .eq('course_id', courseId);
      if (assignmentsError) throw assignmentsError;
      if (!assignments || assignments.length === 0) return [];
      const assignmentIds = assignments.map(a => a.id);
      // 2. Lấy tất cả submissions của các assignment này
      const { data: submissions, error: submissionsError } = await supabase
        .from('assignment_submissions')
        .select('id, assignment_id, student_id, grade, status, submitted_at, graded_at, feedback')
        .in('assignment_id', assignmentIds);
      if (submissionsError) throw submissionsError;
      if (!submissions) return [];
      // 3. Lấy thông tin sinh viên
      const studentIds = [...new Set(submissions.map(s => s.student_id))];
      let studentsMap: Record<string, { id: string; full_name: string }> = {};
      if (studentIds.length > 0) {
        const { data: students, error: studentsError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', studentIds);
        if (studentsError) throw studentsError;
        studentsMap = Object.fromEntries((students || []).map(s => [s.id, s]));
      }
      // 4. Gộp submissions theo assignment_id
      const result: AssignmentWithSubmissions[] = assignmentIds.map(aid => ({
        assignment_id: aid,
        submissions: (submissions || [])
          .filter(s => s.assignment_id === aid)
          .map(s => ({ ...s, student: studentsMap[s.student_id] }))
      }));
      return result;
    },
    enabled: !!courseId,
  });
}; 