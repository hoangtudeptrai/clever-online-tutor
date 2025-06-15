
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SubmissionFile {
  id: string;
  submission_id: string;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  uploaded_at: string;
  file_url?: string;
}

export const useSubmissionFiles = (submissionId?: string) => {
  return useQuery({
    queryKey: ['submission-files', submissionId],
    queryFn: async () => {
      if (!submissionId) return [];

      const { data, error } = await supabase
        .from('assignment_submission_files')
        .select('*')
        .eq('submission_id', submissionId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      // Get public URLs for each file
      const filesWithUrls = (data || []).map((file) => {
        const { data: publicUrlData } = supabase
          .storage
          .from('assignment-files')
          .getPublicUrl(file.file_path);

        return {
          ...file,
          file_url: publicUrlData?.publicUrl
        };
      });

      return filesWithUrls as SubmissionFile[];
    },
    enabled: !!submissionId,
  });
};

export const downloadSubmissionFile = async (file: SubmissionFile) => {
  try {
    if (!file.file_url) {
      throw new Error("Public URL for file not found.");
    }
    window.open(file.file_url, '_blank');
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};
