import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UpcomingAssignment {
  id: string;
  title: string;
  due_date: string;
  course_id: string;
  course_title: string;
  student_id: string;
  urgency_status: string;
}

export const useUpcomingAssignments = () => {
  const { profile } = useAuth();

  return useQuery<UpcomingAssignment[]>({
    queryKey: ['upcoming-assignments', profile?.id],
    queryFn: async () => {
      if (!profile || profile.role !== 'student') return [];

      const { data, error } = await supabase
        .from('upcoming_assignments_view')
        .select('*')
        .eq('student_id', profile.id)
        .order('due_date', { ascending: true })
        .limit(5);
      
      if (error) {
        console.error('Error fetching upcoming assignments:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!profile && profile.role === 'student'
  });
};