
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface StudentActivity {
  id: string;
  type: 'assignment_created' | 'assignment_graded' | 'document_uploaded' | 'assignment_due_soon';
  title: string;
  description: string;
  created_at: string;
  course_title?: string;
  assignment_title?: string;
  grade?: number;
  due_date?: string;
  status?: string;
}

export const useStudentActivities = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['student-activities', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      // Get recent notifications for the student
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (notificationsError) throw notificationsError;

      // Get recent assignment submissions
      const { data: submissions, error: submissionsError } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          assignments!inner(title, due_date, course_id, courses!inner(title))
        `)
        .eq('student_id', profile.id)
        .order('submitted_at', { ascending: false })
        .limit(5);

      if (submissionsError) throw submissionsError;

      // Get upcoming assignments
      const { data: upcomingAssignments, error: upcomingError } = await supabase
        .from('assignments')
        .select(`
          *,
          courses!inner(title),
          course_enrollments!inner(student_id)
        `)
        .eq('course_enrollments.student_id', profile.id)
        .gte('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })
        .limit(3);

      if (upcomingError) throw upcomingError;

      const activities: StudentActivity[] = [];

      // Add notifications as activities
      notifications?.forEach(notification => {
        activities.push({
          id: notification.id,
          type: notification.type as any,
          title: notification.title,
          description: notification.content,
          created_at: notification.created_at,
        });
      });

      // Add submission activities
      submissions?.forEach(submission => {
        activities.push({
          id: `submission-${submission.id}`,
          type: submission.grade !== null ? 'assignment_graded' : 'assignment_created',
          title: submission.grade !== null ? 'Bài tập đã được chấm điểm' : 'Đã nộp bài tập',
          description: `${submission.assignments.title} - ${submission.assignments.courses.title}`,
          created_at: submission.submitted_at || new Date().toISOString(),
          course_title: submission.assignments.courses.title,
          assignment_title: submission.assignments.title,
          grade: submission.grade,
        });
      });

      // Add upcoming assignments
      upcomingAssignments?.forEach(assignment => {
        const dueDate = new Date(assignment.due_date);
        const now = new Date();
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue <= 7) {
          activities.push({
            id: `upcoming-${assignment.id}`,
            type: 'assignment_due_soon',
            title: 'Bài tập sắp đến hạn',
            description: `${assignment.title} - ${assignment.courses.title}`,
            created_at: assignment.created_at,
            course_title: assignment.courses.title,
            assignment_title: assignment.title,
            due_date: assignment.due_date,
            status: daysUntilDue <= 1 ? 'urgent' : 'warning',
          });
        }
      });

      // Sort all activities by date
      return activities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, 8);
    },
    enabled: !!profile?.id,
  });
};
