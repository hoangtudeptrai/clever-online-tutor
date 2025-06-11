import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Document {
  id: string;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  course_id: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  course?: {
    title: string;
  };
  uploader?: {
    full_name: string;
  };
}

export const useDocuments = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['documents', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_documents')
        .select(`
          *,
          course:courses(title)
        `);

      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }

      // Transform the data to match our interface
      const transformedData = data?.map(doc => ({
        ...doc,
        course: Array.isArray(doc.course) ? doc.course[0] : doc.course,
        uploader: { full_name: 'Unknown' } // Default value for uploader
      })) as Document[];

      return transformedData;
    },
    enabled: !!profile,
  });
};

export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (documentData: {
      title: string;
      description?: string;
      file_name: string;
      file_path: string;
      file_size?: number;
      file_type?: string;
      course_id: string;
    }) => {
      const { data, error } = await supabase
        .from('course_documents')
        .insert({
          ...documentData,
          uploaded_by: profile?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('course_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};
