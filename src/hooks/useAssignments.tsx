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
      // Fetch assignments first
      let query = supabase
        .from('assignments')
        .select('*');

      if (profile?.role === 'student') {
        query = query.eq('assignment_status', 'published');
      }

      const { data: assignments, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch related data in parallel
      const [coursesData, creatorsData] = await Promise.all([
        // Get courses
        supabase
          .from('courses')
          .select('id, title, instructor_id')
          .in('id', assignments.map(a => a.course_id)),
        // Get creators
        supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', assignments.map(a => a.created_by))
      ]);

      // Create lookup maps
      const coursesMap = new Map(coursesData.data?.map(c => [c.id, c]));
      const creatorsMap = new Map(creatorsData.data?.map(c => [c.id, c]));
      
      // Transform the data to match our Assignment interface
      return assignments.map((item: any) => ({
        ...item,
        course: coursesMap.get(item.course_id),
        creator: creatorsMap.get(item.created_by)
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
      // Fetch assignment first
      const { data: assignment, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', assignmentId)
        .single();

      if (error) throw error;

      // Fetch related data in parallel
      const [courseData, creatorData, submissionsData] = await Promise.all([
        // Get course
        supabase
          .from('courses')
          .select('id, title, instructor_id')
          .eq('id', assignment.course_id)
          .single(),
        // Get creator
        supabase
          .from('profiles')
          .select('id, full_name')
          .eq('id', assignment.created_by)
          .single(),
        // Get submissions with students
        supabase
          .from('assignment_submissions')
          .select('id, status, submitted_at, grade, feedback, student_id')
          .eq('assignment_id', assignmentId)
      ]);

      // If we have submissions, fetch student profiles
      let studentsData = { data: [] };
      if (submissionsData.data?.length > 0) {
        studentsData = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', submissionsData.data.map(s => s.student_id));
      }

      // Create a map of student profiles
      const studentsMap = new Map(studentsData.data?.map(s => [s.id, s]));

      // Transform submissions data
      const transformedSubmissions = submissionsData.data?.map(submission => ({
        ...submission,
        student: studentsMap.get(submission.student_id)
      }));
      
      // Return transformed data
      return {
        ...assignment,
        course: courseData.data,
        creator: creatorData.data,
        submissions: transformedSubmissions
      } as Assignment;
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

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      title: string;
      description?: string;
      course_id: string;
      due_date?: string;
      max_score?: number;
      assignment_status?: 'draft' | 'published' | 'archived';
    }) => {
      const { id, ...updateData } = data;
      const { data: result, error } = await supabase
        .from('assignments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật bài tập thành công",
      });
    },
    onError: (error) => {
      console.error('Error updating assignment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật bài tập",
        variant: "destructive",
      });
    },
  });
};
