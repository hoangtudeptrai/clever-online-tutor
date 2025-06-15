
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface StudentGrade {
  id: string;
  assignment: string;
  course: string;
  grade: number | null;
  maxGrade: number;
  submittedDate: string | null;
  gradedDate: string | null;
  feedback: string | null;
  status: 'graded' | 'pending' | 'not_submitted';
}

export const useStudentGrades = (studentId?: string) => {
  const { profile } = useAuth();
  const targetStudentId = studentId || profile?.id;

  return useQuery({
    queryKey: ['student-grades', targetStudentId],
    queryFn: async () => {
      if (!targetStudentId) return [];

      try {
        // Fetch assignments with submissions for the current student
        const { data: assignments, error: assignmentsError } = await supabase
          .from('assignments')
          .select(`
            id,
            title,
            max_score,
            course_id,
            courses (
              id,
              title
            )
          `);

        if (assignmentsError) throw assignmentsError;

        if (!assignments) return [];

        // Fetch submissions for these assignments by the current student
        const assignmentIds = assignments.map(a => a.id);
        const { data: submissions, error: submissionsError } = await supabase
          .from('assignment_submissions')
          .select('*')
          .in('assignment_id', assignmentIds)
          .eq('student_id', targetStudentId);

        if (submissionsError) throw submissionsError;

        // Create a map of assignment_id to submission
        const submissionMap = new Map();
        submissions?.forEach(submission => {
          submissionMap.set(submission.assignment_id, submission);
        });

        // Combine assignments with their submissions
        const grades: StudentGrade[] = assignments.map(assignment => {
          const submission = submissionMap.get(assignment.id);
          
          let status: 'graded' | 'pending' | 'not_submitted' = 'not_submitted';
          if (submission) {
            if (submission.grade !== null && submission.grade !== undefined) {
              status = 'graded';
            } else if (submission.status === 'submitted') {
              status = 'pending';
            }
          }

          return {
            id: submission?.id || assignment.id,
            assignment: assignment.title,
            course: assignment.courses?.title || 'Unknown Course',
            grade: submission?.grade || null,
            maxGrade: assignment.max_score || 10,
            submittedDate: submission?.submitted_at || null,
            gradedDate: submission?.graded_at || null,
            feedback: submission?.feedback || null,
            status
          };
        });

        return grades;
      } catch (error) {
        console.error('Error fetching student grades:', error);
        throw error;
      }
    },
    enabled: !!targetStudentId,
  });
};
