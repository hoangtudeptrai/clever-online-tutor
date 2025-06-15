
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUsers = (role?: 'student' | 'tutor') => {
  return useQuery({
    queryKey: ['users', role],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url, email')
        .order('full_name');

      if (role) {
        query = query.eq('role', role);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};
