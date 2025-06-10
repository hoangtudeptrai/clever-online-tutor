
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
    queryKey: ['courses', profile?.role],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:profiles!courses_instructor_id_fkey(id, full_name, email)
        `)
        .eq(profile?.role === 'tutor' ? 'instructor_id' : 'status', 
            profile?.role === 'tutor' ? profile.id : 'published');

      if (error) {
        console.error('Error fetching courses:', error);
        throw error;
      }

      return data as Course[];
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
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
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
      const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', courseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};
