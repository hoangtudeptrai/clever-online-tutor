
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StudentActivity {
  id: string;
  student_id: string;
  type: string;
  title: string;
  description: string;
  created_at: string;
  related_id?: string;
}

export const useStudentActivities = (studentId: string) => {
  return useQuery({
    queryKey: ['student-activities', studentId],
    queryFn: async () => {
      if (!studentId) return [];

      try {
        const activities: StudentActivity[] = [];

        // Get recent assignment submissions
        const { data: submissions, error: submissionsError } = await supabase
          .from('assignment_submissions')
          .select(`
            id,
            submitted_at,
            status,
            assignments!inner (
              title,
              due_date
            )
          `)
          .eq('student_id', studentId)
          .order('submitted_at', { ascending: false })
          .limit(10);

        if (!submissionsError && submissions) {
          submissions.forEach(submission => {
            activities.push({
              id: submission.id,
              student_id: studentId,
              type: 'assignment_submitted',
              title: `Đã nộp bài tập: ${submission.assignments?.title}`,
              description: `Trạng thái: ${submission.status === 'pending' ? 'Chờ chấm điểm' : submission.status === 'graded' ? 'Đã chấm điểm' : submission.status}`,
              created_at: submission.submitted_at || '',
              related_id: submission.id
            });
          });
        }

        // Get course enrollments
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('course_enrollments')
          .select(`
            id,
            enrolled_at,
            courses!inner (
              title
            )
          `)
          .eq('student_id', studentId)
          .order('enrolled_at', { ascending: false })
          .limit(5);

        if (!enrollmentsError && enrollments) {
          enrollments.forEach(enrollment => {
            activities.push({
              id: enrollment.id,
              student_id: studentId,
              type: 'course_enrolled',
              title: `Đăng ký khóa học: ${enrollment.courses?.title}`,
              description: 'Đã tham gia khóa học mới',
              created_at: enrollment.enrolled_at,
              related_id: enrollment.id
            });
          });
        }

        // Sort all activities by date
        return activities.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 10);
      } catch (error) {
        console.error('Error in useStudentActivities:', error);
        throw error;
      }
    },
    enabled: !!studentId,
  });
};
