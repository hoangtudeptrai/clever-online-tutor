
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useStats = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['stats', profile?.id, profile?.role],
    queryFn: async () => {
      if (!profile) return null;

      if (profile.role === 'tutor') {
        // Lấy thống kê cho giáo viên
        
        // Số khóa học
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id')
          .eq('instructor_id', profile.id);

        const courseIds = coursesData?.map(c => c.id) || [];
        
        // Số học sinh (đếm từ course_enrollments)
        const { count: studentsCount } = await supabase
          .from('course_enrollments')
          .select('*', { count: 'exact', head: true })
          .in('course_id', courseIds.length > 0 ? courseIds : ['00000000-0000-0000-0000-000000000000']);
        
        // Số tài liệu
        const { count: documentsCount } = await supabase
          .from('course_documents')
          .select('*', { count: 'exact', head: true })
          .in('course_id', courseIds.length > 0 ? courseIds : ['00000000-0000-0000-0000-000000000000']);
        
        // Số bài tập
        const { count: assignmentsCount } = await supabase
          .from('assignments')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', profile.id);

        return {
          courses: coursesData?.length || 0,
          students: studentsCount || 0,
          documents: documentsCount || 0,
          assignments: assignmentsCount || 0
        };
      } else {
        // Lấy thống kê cho học sinh
        
        // Số khóa học đang theo
        const { data: enrollmentsData } = await supabase
          .from('course_enrollments')
          .select('id')
          .eq('student_id', profile.id)
          .eq('status', 'enrolled');
        
        // Bài tập đã nộp
        const { data: submissionsData } = await supabase
          .from('assignment_submissions')
          .select('id')
          .eq('student_id', profile.id);
        
        // Điểm trung bình
        const { data: gradesData } = await supabase
          .from('grades')
          .select('score, max_score')
          .eq('student_id', profile.id);

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
    },
    enabled: !!profile,
  });
};
