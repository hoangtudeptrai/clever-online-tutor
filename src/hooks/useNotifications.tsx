
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Notification {
  id: string;
  user_id: string;
  type: 'assignment_submitted' | 'assignment_graded' | 'assignment_created' | 'course_enrolled' | 'document_uploaded' | 'system';
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
  related_id?: string;
  metadata?: {
    student_name?: string;
    course_title?: string;
    assignment_title?: string;
    document_title?: string;
    grade?: number;
    submission_id?: string;
    assignment_id?: string;
    document_id?: string;
    course_id?: string;
  };
}

export const useNotifications = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['notifications', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      try {
        if (profile.role === 'tutor') {
          // Get notifications for tutors (assignment submissions)
          const { data: submissions, error } = await supabase
            .from('assignment_submissions')
            .select(`
              id,
              submitted_at,
              status,
              grade,
              student_id,
              assignment:assignments!inner(
                id,
                title,
                created_by,
                course:courses!inner(
                  title,
                  instructor_id
                )
              )
            `)
            .eq('assignment.created_by', profile.id)
            .order('submitted_at', { ascending: false })
            .limit(20);

          if (error) throw error;

          if (!submissions || submissions.length === 0) return [];

          // Get student profiles
          const studentIds = [...new Set(submissions.map(s => s.student_id))];
          const { data: students, error: studentsError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', studentIds);

          if (studentsError) throw studentsError;

          const studentsMap = new Map((students || []).map(s => [s.id, s]));

          // Transform to notifications
          const notifications: Notification[] = submissions.map(submission => ({
            id: `submission_${submission.id}`,
            user_id: profile.id,
            type: submission.grade !== null ? 'assignment_graded' : 'assignment_submitted',
            title: submission.grade !== null 
              ? 'Bài tập đã được chấm điểm' 
              : 'Có bài tập mới được nộp',
            content: submission.grade !== null
              ? `Bài tập "${submission.assignment.title}" đã được chấm điểm: ${submission.grade}/100`
              : `${studentsMap.get(submission.student_id)?.full_name || 'Học sinh'} đã nộp bài tập "${submission.assignment.title}"`,
            is_read: false,
            created_at: submission.submitted_at || new Date().toISOString(),
            related_id: submission.assignment.id,
            metadata: {
              student_name: studentsMap.get(submission.student_id)?.full_name,
              course_title: submission.assignment.course.title,
              assignment_title: submission.assignment.title,
              grade: submission.grade,
              submission_id: submission.id,
              assignment_id: submission.assignment.id
            }
          }));

          return notifications;
        } else {
          // Get notifications for students
          const allNotifications: Notification[] = [];

          // Get enrolled courses for student
          const { data: enrollments, error: enrollmentsError } = await supabase
            .from('course_enrollments')
            .select('course_id')
            .eq('student_id', profile.id);

          if (enrollmentsError) throw enrollmentsError;

          const courseIds = enrollments?.map(e => e.course_id) || [];

          if (courseIds.length > 0) {
            // 1. Get assignment notifications (submissions and grades)
            const { data: submissions, error: submissionsError } = await supabase
              .from('assignment_submissions')
              .select(`
                id,
                submitted_at,
                status,
                grade,
                feedback,
                assignment:assignments(
                  id,
                  title,
                  due_date,
                  course:courses(
                    title
                  )
                )
              `)
              .eq('student_id', profile.id)
              .order('submitted_at', { ascending: false })
              .limit(10);

            if (!submissionsError && submissions) {
              const submissionNotifications = submissions.map(submission => {
                if (submission.grade !== null) {
                  return {
                    id: `graded_${submission.id}`,
                    user_id: profile.id,
                    type: 'assignment_graded' as const,
                    title: 'Bài tập đã được chấm điểm',
                    content: `Bài tập "${submission.assignment?.title}" đã được chấm điểm: ${submission.grade}/100`,
                    is_read: false,
                    created_at: submission.submitted_at || new Date().toISOString(),
                    related_id: submission.assignment?.id,
                    metadata: {
                      course_title: submission.assignment?.course?.title,
                      assignment_title: submission.assignment?.title,
                      grade: submission.grade,
                      submission_id: submission.id,
                      assignment_id: submission.assignment?.id,
                      feedback: submission.feedback
                    }
                  };
                } else {
                  return {
                    id: `submitted_${submission.id}`,
                    user_id: profile.id,
                    type: 'assignment_submitted' as const,
                    title: 'Bài tập đã được nộp',
                    content: `Bạn đã nộp bài tập "${submission.assignment?.title}" thành công`,
                    is_read: false,
                    created_at: submission.submitted_at || new Date().toISOString(),
                    related_id: submission.assignment?.id,
                    metadata: {
                      course_title: submission.assignment?.course?.title,
                      assignment_title: submission.assignment?.title,
                      submission_id: submission.id,
                      assignment_id: submission.assignment?.id
                    }
                  };
                }
              });
              allNotifications.push(...submissionNotifications);
            }

            // 2. Get new assignment notifications
            const { data: newAssignments, error: assignmentsError } = await supabase
              .from('assignments')
              .select(`
                id,
                title,
                description,
                created_at,
                due_date,
                course:courses!inner(
                  id,
                  title
                )
              `)
              .in('course_id', courseIds)
              .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
              .order('created_at', { ascending: false })
              .limit(10);

            if (!assignmentsError && newAssignments) {
              const assignmentNotifications = newAssignments.map(assignment => ({
                id: `assignment_created_${assignment.id}`,
                user_id: profile.id,
                type: 'assignment_created' as const,
                title: 'Bài tập mới được giao',
                content: `Giáo viên đã giao bài tập mới: "${assignment.title}" trong khóa học "${assignment.course.title}"`,
                is_read: false,
                created_at: assignment.created_at,
                related_id: assignment.id,
                metadata: {
                  assignment_title: assignment.title,
                  course_title: assignment.course.title,
                  assignment_id: assignment.id,
                  course_id: assignment.course.id
                }
              }));
              allNotifications.push(...assignmentNotifications);
            }

            // 3. Get new document notifications
            const { data: newDocuments, error: documentsError } = await supabase
              .from('course_documents')
              .select(`
                id,
                title,
                description,
                created_at,
                course:courses!inner(
                  id,
                  title
                )
              `)
              .in('course_id', courseIds)
              .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
              .order('created_at', { ascending: false })
              .limit(10);

            if (!documentsError && newDocuments) {
              const documentNotifications = newDocuments.map(document => ({
                id: `document_uploaded_${document.id}`,
                user_id: profile.id,
                type: 'document_uploaded' as const,
                title: 'Tài liệu mới được tải lên',
                content: `Giáo viên đã tải lên tài liệu mới: "${document.title}" trong khóa học "${document.course.title}"`,
                is_read: false,
                created_at: document.created_at,
                related_id: document.id,
                metadata: {
                  document_title: document.title,
                  course_title: document.course.title,
                  document_id: document.id,
                  course_id: document.course.id
                }
              }));
              allNotifications.push(...documentNotifications);
            }
          }

          // Sort all notifications by created_at
          allNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

          return allNotifications.slice(0, 20); // Limit to 20 most recent
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
    },
    enabled: !!profile,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      // For now, we'll just invalidate the query since we're using computed notifications
      // In a real implementation, you might want to store read status in a separate table
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
