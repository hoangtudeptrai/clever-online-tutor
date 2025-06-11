
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  course_id: string;
  due_date?: string;
  max_score?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  course?: {
    title: string;
  };
  creator?: {
    full_name: string;
  };
}

export const useAssignments = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['assignments', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          course:courses(title),
          creator:profiles!assignments_created_by_fkey(full_name)
        `);

      if (error) {
        console.error('Error fetching assignments:', error);
        throw error;
      }

      return data as Assignment[];
    },
    enabled: !!profile,
  });
};

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (assignmentData: {
      title: string;
      description?: string;
      course_id: string;
      due_date?: string | null;
      max_score?: number;
      instructions: string;
      attachments?: any[];
    }) => {
      const { data, error } = await supabase
        .from('assignments')
        .insert({
          title: assignmentData.title,
          description: assignmentData.description,
          course_id: assignmentData.course_id,
          due_date: assignmentData.due_date,
          max_score: assignmentData.max_score,
          created_by: profile?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Tạo assignment documents nếu có file đính kèm
      if (assignmentData.attachments && assignmentData.attachments.length > 0) {
        const documentPromises = assignmentData.attachments.map(attachment => 
          supabase.from('assignment_documents').insert({
            assignment_id: data.id,
            title: attachment.file_name,
            file_name: attachment.file_name,
            file_path: attachment.file_path,
            file_size: attachment.file_size,
            file_type: attachment.file_type,
            uploaded_by: profile?.id
          })
        );

        await Promise.all(documentPromises);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};
