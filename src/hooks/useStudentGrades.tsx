
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StudentGrade {
  id: string;
  student_id: string;
  course_id: string;
  assignment_id: string;
  score: number;
  max_score: number;
  percentage: number;
  graded_by: string;
  graded_at: string;
  comments?: string;
  status: 'pending' | 'graded' | 'late';
  grade: number;
  maxGrade: number;
  assignment?: {
    title: string;
    due_date?: string;
  };
  course?: {
    title: string;
  };
}

export const useStudentGrades = (studentId: string) => {
  return useQuery({
    queryKey: ['student-grades', studentId],
    queryFn: async () => {
      if (!studentId) return [];

      try {
        // First get assignment submissions for this student
        const { data: submissions, error: submissionsError } = await supabase
          .from('assignment_submissions')
          .select(`
            id,
            assignment_id,
            student_id,
            grade,
            status,
            submitted_at,
            graded_at,
            feedback,
            assignments!inner (
              id,
              title,
              due_date,
              max_score,
              course_id,
              courses!inner (
                id,
                title
              )
            )
          `)
          .eq('student_id', studentId);

        if (submissionsError) {
          console.error('Error fetching student submissions:', submissionsError);
          throw submissionsError;
        }

        // Transform to match our interface
        return (submissions || []).map(submission => ({
          id: submission.id,
          student_id: submission.student_id,
          course_id: submission.assignments?.course_id || '',
          assignment_id: submission.assignment_id,
          score: submission.grade || 0,
          max_score: submission.assignments?.max_score || 100,
          percentage: submission.grade ? (submission.grade / (submission.assignments?.max_score || 100)) * 100 : 0,
          graded_by: '',
          graded_at: submission.graded_at || '',
          comments: submission.feedback,
          status: submission.status || 'pending',
          grade: submission.grade || 0,
          maxGrade: submission.assignments?.max_score || 100,
          assignment: {
            title: submission.assignments?.title || '',
            due_date: submission.assignments?.due_date
          },
          course: {
            title: submission.assignments?.courses?.title || ''
          }
        })) as StudentGrade[];
      } catch (error) {
        console.error('Error in useStudentGrades:', error);
        throw error;
      }
    },
    enabled: !!studentId,
  });
};
