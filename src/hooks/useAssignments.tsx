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
  assignment_status?: 'draft' | 'published' | 'archived';
  course?: {
    title: string;
  };
  creator?: {
    full_name: string;
  };
  submissions?: {
    id: string;
    status: string;
    submitted_at: string;
    grade?: number;
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
          course:courses(title)
        `);

      // If user is a tutor, only get their assignments
      if (profile?.role === 'tutor') {
        query = query.eq('created_by', profile.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching assignments:', error);
        throw error;
      }

      return (data || []).map(assignment => ({
        ...assignment,
        creator: { full_name: 'Unknown' } // Default value for creator
      })) as Assignment[];
    },
    enabled: !!profile,
  });
};

export const useAssignmentWithSubmissions = (assignmentId: string) => {
  return useQuery({
    queryKey: ['assignment', assignmentId, 'submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          course:courses(title),
          creator:profiles!assignments_created_by_fkey(full_name),
          submissions:assignment_submissions(
            id,
            status,
            submitted_at,
            grade,
            student:profiles!assignment_submissions_student_id_fkey(full_name)
          )
        `)
        .eq('id', assignmentId)
        .single();

      if (error) {
        console.error('Error fetching assignment with submissions:', error);
        throw error;
      }

      // Handle potential data structure issues
      const processedData = {
        ...data,
        creator: Array.isArray(data.creator) ? data.creator[0] : data.creator,
        submissions: (data.submissions || []).map((submission: any) => ({
          ...submission,
          student: Array.isArray(submission.student) ? submission.student[0] : submission.student
        }))
      };

      return processedData as Assignment;
    },
    enabled: !!assignmentId,
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
          assignment_status: 'draft', // Always start as draft
        })
        .select()
        .single();

      if (error) throw error;

      // Create assignment documents if there are attachments
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
