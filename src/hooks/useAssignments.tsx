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
      if (!profile) return [];

      try {
        // Fetch assignments first
        let query = supabase
          .from('assignments')
          .select('*');

        if (profile.role === 'student') {
          query = query.eq('assignment_status', 'published');
        }

        const { data: assignments, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching assignments:', error);
          throw error;
        }

        if (!assignments || assignments.length === 0) {
          return [];
        }

        // Fetch related data in parallel
        const courseIds = [...new Set(assignments.map(a => a.course_id))];
        const creatorIds = [...new Set(assignments.map(a => a.created_by))];

        const [coursesResult, creatorsResult] = await Promise.allSettled([
          supabase
            .from('courses')
            .select('id, title, instructor_id')
            .in('id', courseIds),
          supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', creatorIds)
        ]);

        // Handle results safely
        const coursesData = coursesResult.status === 'fulfilled' ? coursesResult.value.data || [] : [];
        const creatorsData = creatorsResult.status === 'fulfilled' ? creatorsResult.value.data || [] : [];

        // Create lookup maps
        const coursesMap = new Map(coursesData.map(c => [c.id, c]));
        const creatorsMap = new Map(creatorsData.map(c => [c.id, c]));
        
        // Transform the data to match our Assignment interface
        return assignments.map((item: any) => ({
          ...item,
          course: coursesMap.get(item.course_id) || null,
          creator: creatorsMap.get(item.created_by) || null
        })) as Assignment[];
      } catch (error) {
        console.error('Error in useAssignments:', error);
        throw error;
      }
    },
    enabled: !!profile,
  });
};

export const useAssignmentWithSubmissions = (assignmentId: string) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: async () => {
      if (!assignmentId) return null;

      try {
        // Fetch assignment first
        const { data: assignment, error } = await supabase
          .from('assignments')
          .select('*')
          .eq('id', assignmentId)
          .single();

        if (error) {
          console.error('Error fetching assignment:', error);
          throw error;
        }

        if (!assignment) return null;

        // Fetch related data in parallel
        const [courseResult, creatorResult, submissionsResult] = await Promise.allSettled([
          supabase
            .from('courses')
            .select('id, title, instructor_id')
            .eq('id', assignment.course_id)
            .single(),
          supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', assignment.created_by)
            .single(),
          supabase
            .from('assignment_submissions')
            .select('id, status, submitted_at, grade, feedback, content, student_id')
            .eq('assignment_id', assignmentId)
        ]);

        // Handle results safely
        const courseData = courseResult.status === 'fulfilled' ? courseResult.value.data : null;
        const creatorData = creatorResult.status === 'fulfilled' ? creatorResult.value.data : null;
        const submissionsData = submissionsResult.status === 'fulfilled' ? submissionsResult.value.data || [] : [];

        // If we have submissions, fetch student profiles
        let studentsData: any[] = [];
        if (submissionsData.length > 0) {
          const studentIds = [...new Set(submissionsData.map(s => s.student_id))];
          const studentsResult = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', studentIds);
          
          studentsData = studentsResult.data || [];
        }

        // Create a map of student profiles
        const studentsMap = new Map(studentsData.map(s => [s.id, s]));

        // Transform submissions data
        const transformedSubmissions = submissionsData.map(submission => ({
          ...submission,
          student: studentsMap.get(submission.student_id) || { full_name: 'Unknown' }
        }));
        
        // Return transformed data
        return {
          ...assignment,
          course: courseData,
          creator: creatorData,
          submissions: transformedSubmissions
        } as Assignment;
      } catch (error) {
        console.error('Error in useAssignmentWithSubmissions:', error);
        throw error;
      }
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
      if (!profile?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('assignments')
        .insert({
          ...assignmentData,
          created_by: profile.id,
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
