
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  course_id: string;
  due_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  max_score?: number;
  assignment_status?: 'draft' | 'published' | 'archived';
  course?: {
    id: string;
    title: string;
    instructor_id: string;
  };
  creator?: {
    id: string;
    full_name: string;
  };
  submissions?: {
    id: string;
    status: string;
    submitted_at: string;
    grade?: number;
    feedback?: string;
    student: {
      full_name: string;
    };
  }[];
}

export const useAssignments = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['assignments', profile?.id],
    queryFn: async () => {
      let query = supabase
        .from('assignments')
        .select(`
          *,
          course:courses(id, title, instructor_id),
          creator:profiles!assignments_created_by_fkey(id, full_name)
        `);

      if (profile?.role === 'student') {
        query = query.eq('assignment_status', 'published');
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our Assignment interface
      return data?.map((item: any) => ({
        ...item,
        creator: Array.isArray(item.creator) ? item.creator[0] : item.creator
      })) as Assignment[];
    },
    enabled: !!profile,
  });
};

export const useAssignmentWithSubmissions = (assignmentId: string) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          course:courses(id, title, instructor_id),
          creator:profiles!assignments_created_by_fkey(id, full_name),
          submissions:assignment_submissions(
            id,
            status,
            submitted_at,
            grade,
            feedback,
            student:profiles!assignment_submissions_student_id_fkey(full_name)
          )
        `)
        .eq('id', assignmentId)
        .single();

      if (error) throw error;
      
      // Transform the data to match our Assignment interface
      const transformedData = {
        ...data,
        creator: Array.isArray(data.creator) ? data.creator[0] : data.creator,
        submissions: data.submissions?.map((submission: any) => ({
          ...submission,
          student: Array.isArray(submission.student) ? submission.student[0] : submission.student
        }))
      };
      
      return transformedData as Assignment;
    },
    enabled: !!assignmentId && !!profile,
  });
};

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (assignmentData: {
      title: string;
      description?: string;
      course_id: string;
      due_date?: string;
      max_score?: number;
    }) => {
      const { data, error } = await supabase
        .from('assignments')
        .insert({
          ...assignmentData,
          created_by: profile?.id,
          assignment_status: 'published'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast({
        title: "Thành công",
        description: "Đã tạo bài tập mới thành công",
      });
    },
    onError: (error) => {
      console.error('Error creating assignment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo bài tập mới",
        variant: "destructive",
      });
    },
  });
};
