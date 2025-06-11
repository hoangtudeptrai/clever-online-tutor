import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: string;
  status: string;
  instructor_id: string;
  students_count: number;
  lessons_count: number;
  created_at: string;
  updated_at: string;
  instructor?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export const useCourses = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['courses', profile?.role, profile?.id],
    queryFn: async () => {
      if (!profile) return [];

      if (profile.role === 'tutor') {
        // Lấy khóa học của giáo viên
        const { data: coursesData, error } = await supabase
          .from('courses')
          .select('*')
          .eq('instructor_id', profile.id)
          // Sắp xếp: active trước, sau đó là draft và archived
          // Trong cùng trạng thái thì sắp xếp theo thời gian tạo mới nhất
          .order('status', { ascending: true }) // 'active' sẽ lên đầu vì theo thứ tự alphabet
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching tutor courses:', error);
          throw error;
        }

        // Lấy thông tin instructor cho mỗi khóa học
        const coursesWithInstructor = await Promise.all((coursesData || []).map(async (course) => {
          const { data: instructorData } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('id', course.instructor_id)
            .single();

          return {
            ...course,
            instructor: instructorData
          };
        }));

        return coursesWithInstructor as Course[];
      } else {
        // Lấy khóa học cho học sinh (chỉ những khóa active)
        const { data: coursesData, error } = await supabase
          .from('courses')
          .select('*')
          .eq('status', 'active')
          // Sắp xếp theo thời gian tạo mới nhất
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching student courses:', error);
          throw error;
        }

        // Lấy thông tin instructor cho mỗi khóa học
        const coursesWithInstructor = await Promise.all((coursesData || []).map(async (course) => {
          const { data: instructorData } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('id', course.instructor_id)
            .single();

          return {
            ...course,
            instructor: instructorData
          };
        }));

        return coursesWithInstructor as Course[];
      }
    },
    enabled: !!profile,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (courseData: {
      title: string;
      description?: string;
      thumbnail?: string;
      duration?: string;
    }) => {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          ...courseData,
          instructor_id: profile?.id,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      courseId, 
      updates 
    }: { 
      courseId: string; 
      updates: Partial<Course> 
    }) => {
      // Validate status if it's being updated
      if (updates.status && !['active', 'draft', 'archived'].includes(updates.status)) {
        throw new Error('Invalid status value');
      }

      const { data, error } = await supabase
        .from('courses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', courseId)
        .select()
        .single();

      if (error) {
        console.error('Error updating course:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate both the specific course and the courses list
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      // Xóa tất cả các bản ghi liên quan trước
      await Promise.all([
        // Xóa tài liệu của khóa học
        supabase.from('course_documents').delete().eq('course_id', courseId),
        // Xóa bài tập của khóa học
        supabase.from('assignments').delete().eq('course_id', courseId),
        // Xóa học sinh đăng ký khóa học
        supabase.from('course_enrollments').delete().eq('course_id', courseId),
      ]);

      // Sau đó xóa khóa học
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

export default {
  useCourses,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
};
