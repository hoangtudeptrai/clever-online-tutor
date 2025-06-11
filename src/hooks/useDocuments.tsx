import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
    email: string;
  };
}

export const useDocuments = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['documents', profile?.id],
    queryFn: async () => {
      // Lấy tài liệu và join với bảng courses
      const { data: documentsData, error: documentsError } = await supabase
        .from('course_documents')
        .select(`
          *,
          course:courses(title)
        `);

      if (documentsError) {
        console.error('Error fetching documents:', documentsError);
        throw documentsError;
      }

      // Lấy thông tin người tạo từ bảng profiles
      const uploaderIds = [...new Set(documentsData?.map(doc => doc.uploaded_by) || [])];
      const { data: uploadersData, error: uploadersError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', uploaderIds);

      if (uploadersError) {
        console.error('Error fetching uploaders:', uploadersError);
        throw uploadersError;
      }

      // Map uploaders data vào documents
      const uploadersMap = new Map(uploadersData?.map(u => [u.id, u]));
      
      // Transform the data to match our interface
      const transformedData = documentsData?.map(doc => ({
        ...doc,
        course: Array.isArray(doc.course) ? doc.course[0] : doc.course,
        uploader: uploadersMap.get(doc.uploaded_by) || null
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

export const useDownloadDocument = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (document: Document) => {
      try {
        const { data, error } = await supabase.storage
          .from('course-documents')
          .createSignedUrl(document.file_path, 60);

        if (error) {
          throw error;
        }

        if (!data?.signedUrl) {
          throw new Error('Could not generate download URL');
        }

        // Create an anchor element and trigger download
        const link = window.document.createElement('a');
        link.href = data.signedUrl;
        link.download = document.file_name;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);

        toast({
          title: "Tải xuống thành công",
          description: `Tài liệu "${document.title}" đã được tải xuống`,
        });

        return data.signedUrl;
      } catch (error) {
        console.error('Download error:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải xuống tài liệu. Vui lòng thử lại sau.",
          variant: "destructive",
        });
        throw error;
      }
    },
  });
};
