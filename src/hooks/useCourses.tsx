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

      try {
        if (profile.role === 'tutor') {
          // Lấy khóa học của giáo viên
          const { data: coursesData, error } = await supabase
            .from('courses')
            .select('*')
            .eq('instructor_id', profile.id)
            .order('status', { ascending: true })
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching tutor courses:', error);
            throw error;
          }

          if (!coursesData || coursesData.length === 0) {
            return [];
          }

          // Lấy thông tin instructor cho mỗi khóa học
          const instructorIds = [...new Set(coursesData.map(course => course.instructor_id))];
          const { data: instructorsData } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', instructorIds);

          const instructorsMap = new Map((instructorsData || []).map(i => [i.id, i]));

          const coursesWithInstructor = coursesData.map(course => ({
            ...course,
            instructor: instructorsMap.get(course.instructor_id) || null
          }));

          return coursesWithInstructor as Course[];
        } else {
          // Lấy khóa học cho học sinh (chỉ những khóa active)
          const { data: coursesData, error } = await supabase
            .from('courses')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching student courses:', error);
            throw error;
          }

          if (!coursesData || coursesData.length === 0) {
            return [];
          }

          // Lấy thông tin instructor cho mỗi khóa học
          const instructorIds = [...new Set(coursesData.map(course => course.instructor_id))];
          const { data: instructorsData } =  await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', instructorIds);

          const instructorsMap = new Map((instructorsData || []).map(i => [i.id, i]));

          const coursesWithInstructor = coursesData.map(course => ({
            ...course,
            instructor: instructorsMap.get(course.instructor_id) || null
          }));

          return coursesWithInstructor as Course[];
        }
      } catch (error) {
        console.error('Error in useCourses:', error);
        throw error;
      }
    },
    enabled: !!profile,
    staleTime: 0, // Consider data stale immediately
    gcTime: 0, // Don't cache data
    refetchOnMount: true, // Always refetch on mount
    refetchOnWindowFocus: true, // Refetch when window gains focus
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
      if (!profile?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('courses')
        .insert({
          ...courseData,
          instructor_id: profile.id,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (newCourse) => {
      try {
        // Invalidate and refetch courses query
        await queryClient.invalidateQueries({ queryKey: ['courses'] });
        await queryClient.refetchQueries({ queryKey: ['courses'] });
        
        // Invalidate and refetch stats query
        await queryClient.invalidateQueries({ queryKey: ['stats'] });
        await queryClient.refetchQueries({ queryKey: ['stats'] });
      } catch (error) {
        console.error('Error updating cache after course creation:', error);
      }
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
      // Invalidate all course-related queries
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      // Force refetch
      queryClient.refetchQueries({ queryKey: ['courses'] });
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
      // Invalidate all course-related queries
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      // Force refetch
      queryClient.refetchQueries({ queryKey: ['courses'] });
    },
  });
};

export default {
  useCourses,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
};
