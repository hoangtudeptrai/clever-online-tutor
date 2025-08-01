import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  content?: string;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  submitted_at?: string;
  grade?: number;
  feedback?: string;
  graded_at?: string;
}

export const useCreateSubmission = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      assignmentId,
      content,
      files = []
    }: {
      assignmentId: string;
      content: string;
      files?: File[];
    }) => {
      if (!profile?.id) {
        throw new Error('User not authenticated');
      }

      // Create submission
      const { data: submission, error } = await supabase
        .from('assignment_submissions')
        .insert({
          assignment_id: assignmentId,
          student_id: profile.id,
          content,
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Handle file uploads if any
      if (files.length > 0) {
        const filePromises = files.map(async (file) => {
          const filePath = `submissions/${submission.id}/${file.name}`;
          
          // Upload file to storage
          const { error: uploadError } = await supabase.storage
            .from('assignment-files')
            .upload(filePath, file);

          if (uploadError) throw uploadError;
          
          // Create file record
          return supabase.from('assignment_submission_files').insert({
            submission_id: submission.id,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
            uploaded_at: new Date().toISOString()
          });
        });

        await Promise.all(filePromises);
      }

      return submission;
    },
    onSuccess: (submission) => {
      queryClient.invalidateQueries({ queryKey: ['assignment'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activities'] });
      toast({
        title: "Thành công",
        description: "Đã nộp bài tập thành công",
      });
    },
    onError: (error) => {
      console.error('Error submitting assignment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể nộp bài tập",
        variant: "destructive",
      });
    },
  });
};

export const useGradeSubmission = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      submissionId,
      grade,
      feedback
    }: {
      submissionId: string;
      grade: number;
      feedback?: string;
    }) => {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .update({
          grade,
          feedback,
          status: 'graded',
          graded_at: new Date().toISOString(),
        })
        .eq('id', submissionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (submission) => {
      queryClient.invalidateQueries({ queryKey: ['assignment'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activities'] });
      queryClient.invalidateQueries({ queryKey: ['student-activities'] });
      toast({
        title: "Thành công",
        description: "Đã chấm điểm thành công",
      });
    },
    onError: (error) => {
      console.error('Error grading submission:', error);
      toast({
        title: "Lỗi",
        description: "Không thể chấm điểm",
        variant: "destructive",
      });
    },
  });
};
