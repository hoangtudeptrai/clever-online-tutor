
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useStats = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['stats', profile?.id, profile?.role],
    queryFn: async () => {
      if (!profile) return null;

      try {
        if (profile.role === 'tutor') {
          // Lấy thống kê cho giáo viên
          
          // Số khóa học
          const { data: coursesData, error: coursesError } = await supabase
            .from('courses')
            .select('id', { count: 'exact' })
            .eq('instructor_id', profile.id);

          if (coursesError) throw coursesError;

          const courseIds = coursesData?.map(c => c.id) || [];
          
          // Số học sinh (đếm từ course_enrollments)
          let studentsCount = 0;
          if (courseIds.length > 0) {
            const { count, error: studentsError } = await supabase
              .from('course_enrollments')
              .select('*', { count: 'exact', head: true })
              .in('course_id', courseIds);
            
            if (studentsError) throw studentsError;
            studentsCount = count || 0;
          }
          
          // Số tài liệu
          let documentsCount = 0;
          if (courseIds.length > 0) {
            const { count, error: documentsError } = await supabase
              .from('course_documents')
              .select('*', { count: 'exact', head: true })
              .in('course_id', courseIds);
            
            if (documentsError) throw documentsError;
            documentsCount = count || 0;
          }
          
          // Số bài tập
          const { count: assignmentsCount, error: assignmentsError } = await supabase
            .from('assignments')
            .select('*', { count: 'exact', head: true })
            .eq('created_by', profile.id);

          if (assignmentsError) throw assignmentsError;

          return {
            courses: coursesData?.length || 0,
            students: studentsCount,
            documents: documentsCount,
            assignments: assignmentsCount || 0
          };
        } else {
          // Lấy thống kê cho học sinh
          
          // Số khóa học đang theo
          const { data: enrollmentsData, error: enrollmentsError } = await supabase
            .from('course_enrollments')
            .select('id')
            .eq('student_id', profile.id)
            .eq('status', 'enrolled');
          
          if (enrollmentsError) throw enrollmentsError;
          
          // Bài tập đã nộp
          const { data: submissionsData, error: submissionsError } = await supabase
            .from('assignment_submissions')
            .select('id')
            .eq('student_id', profile.id);
          
          if (submissionsError) throw submissionsError;
          
          // Điểm trung bình
          const { data: gradesData, error: gradesError } = await supabase
            .from('grades')
            .select('score, max_score')
            .eq('student_id', profile.id);

          if (gradesError) throw gradesError;

          const totalSubmissions = submissionsData?.length || 0;
          const grades = gradesData || [];
          const averageGrade = grades.length > 0 
            ? grades.reduce((acc, grade) => acc + (grade.score / grade.max_score * 10), 0) / grades.length
            : 0;

          return {
            enrolledCourses: enrollmentsData?.length || 0,
            completedAssignments: totalSubmissions,
            pendingAssignments: 0,
            averageGrade: averageGrade.toFixed(1)
          };
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        throw error;
      }
    },
    enabled: !!profile,
  });
};
