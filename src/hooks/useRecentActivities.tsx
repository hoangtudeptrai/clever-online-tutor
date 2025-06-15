
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface RecentActivity {
  id: string;
  type: 'submission' | 'grade' | 'enrollment';
  student_name: string;
  course_title: string;
  assignment_title?: string;
  created_at: string;
  status?: string;
  grade?: number;
}

export const useRecentActivities = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['recent-activities', profile?.id],
    queryFn: async () => {
      if (!profile?.id || profile.role !== 'tutor') return [];

      try {
        // Get recent submissions for assignments created by this teacher
        const { data: submissions, error: submissionsError } = await supabase
          .from('assignment_submissions')
          .select(`
            id,
            submitted_at,
            status,
            grade,
            student_id,
            assignment:assignments!inner(
              title,
              course_id,
              created_by,
              course:courses!inner(
                title,
                instructor_id
              )
            )
          `)
          .eq('assignment.created_by', profile.id)
          .order('submitted_at', { ascending: false })
          .limit(10);

        if (submissionsError) throw submissionsError;

        if (!submissions || submissions.length === 0) {
          return [];
        }

        // Get student profiles
        const studentIds = [...new Set(submissions.map(s => s.student_id))];
        const { data: students, error: studentsError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', studentIds);

        if (studentsError) throw studentsError;

        // Create student lookup map
        const studentsMap = new Map((students || []).map(s => [s.id, s]));

        // Transform submissions to activities
        const activities: RecentActivity[] = submissions.map(submission => ({
          id: submission.id,
          type: 'submission' as const,
          student_name: studentsMap.get(submission.student_id)?.full_name || 'Unknown Student',
          course_title: submission.assignment?.course?.title || 'Unknown Course',
          assignment_title: submission.assignment?.title || 'Unknown Assignment',
          created_at: submission.submitted_at || new Date().toISOString(),
          status: submission.status,
          grade: submission.grade
        }));

        return activities;
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        return [];
      }
    },
    enabled: !!profile && profile.role === 'tutor',
  });
};
