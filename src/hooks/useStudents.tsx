
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Student {
  id: string;
  full_name: string;
  email: string;
  enrolled_at?: string;
  progress?: number;
  status?: string;
  phone_number?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface CourseStudent extends Student {
  enrollment_id?: string;
  course_id?: string;
  last_active?: string;
}

export const useStudents = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone_number, avatar_url, created_at')
          .eq('role', 'student')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching students:', error);
          throw error;
        }
        return (data || []) as Student[];
      } catch (error) {
        console.error('Error in useStudents:', error);
        throw error;
      }
    },
    enabled: !!profile && profile.role === 'tutor',
  });
};

export const useCourseStudents = (courseId: string) => {
  return useQuery({
    queryKey: ['course-students', courseId],
    queryFn: async () => {
      if (!courseId) return [];

      try {
        // First get the enrollments
        const { data: enrollments, error } = await supabase
          .from('course_enrollments')
          .select('id, student_id, enrolled_at, progress, status, last_active')
          .eq('course_id', courseId)
          .order('enrolled_at', { ascending: false });

        if (error) {
          console.error('Error fetching course enrollments:', error);
          throw error;
        }

        if (!enrollments || enrollments.length === 0) {
          return [];
        }

        // Get student details
        const studentIds = enrollments.map(e => e.student_id);
        const { data: students, error: studentsError } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone_number, avatar_url')
          .in('id', studentIds);

        if (studentsError) {
          console.error('Error fetching students:', studentsError);
          throw studentsError;
        }

        // Create a map of students
        const studentsMap = new Map((students || []).map(s => [s.id, s]));

        // Transform the data to match our interface
        return enrollments.map(enrollment => {
          const student = studentsMap.get(enrollment.student_id);
          return {
            id: enrollment.student_id,
            enrollment_id: enrollment.id,
            course_id: courseId,
            full_name: student?.full_name || '',
            email: student?.email || '',
            phone_number: student?.phone_number || '',
            avatar_url: student?.avatar_url || '',
            enrolled_at: enrollment.enrolled_at,
            progress: enrollment.progress,
            status: enrollment.status,
            last_active: enrollment.last_active
          };
        }) as CourseStudent[];
      } catch (error) {
        console.error('Error in useCourseStudents:', error);
        throw error;
      }
    },
    enabled: !!courseId,
  });
};

export const useEnrollStudent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ courseId, studentId }: { courseId: string; studentId: string }) => {
      // Check if student is already enrolled
      const { data: existing } = await supabase
        .from('course_enrollments')
        .select('id')
        .eq('course_id', courseId)
        .eq('student_id', studentId)
        .single();

      if (existing) {
        throw new Error('Học sinh đã được đăng ký khóa học này');
      }

      const { data, error } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: courseId,
          student_id: studentId,
          status: 'enrolled',
          progress: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-students', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Thành công",
        description: "Đã thêm học sinh vào khóa học",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm học sinh vào khóa học",
        variant: "destructive",
      });
    },
  });
};

export const useUnenrollStudent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ courseId, studentId }: { courseId: string; studentId: string }) => {
      const { error } = await supabase
        .from('course_enrollments')
        .delete()
        .eq('course_id', courseId)
        .eq('student_id', studentId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-students', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Thành công",
        description: "Đã hủy đăng ký học sinh khỏi khóa học",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: "Không thể hủy đăng ký học sinh",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateStudentProgress = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      courseId, 
      studentId, 
      progress 
    }: { 
      courseId: string; 
      studentId: string; 
      progress: number;
    }) => {
      const { data, error } = await supabase
        .from('course_enrollments')
        .update({ 
          progress: Math.max(0, Math.min(100, progress)),
          last_active: new Date().toISOString()
        })
        .eq('course_id', courseId)
        .eq('student_id', studentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-students', variables.courseId] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật tiến độ học tập",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật tiến độ học tập",
        variant: "destructive",
      });
    },
  });
};
