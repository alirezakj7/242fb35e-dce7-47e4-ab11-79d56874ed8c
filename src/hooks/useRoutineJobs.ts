import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type RoutineJob = Database['public']['Tables']['routine_jobs']['Row'];
type RoutineJobInsert = Database['public']['Tables']['routine_jobs']['Insert'];
type RoutineJobUpdate = Database['public']['Tables']['routine_jobs']['Update'];

export function useRoutineJobs() {
  const [routineJobs, setRoutineJobs] = useState<RoutineJob[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRoutineJobs = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('routine_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoutineJobs(data || []);
    } catch (error) {
      console.error('Error fetching routine jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRoutineJob = async (routineJob: Omit<RoutineJobInsert, 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('routine_jobs')
        .insert({ ...routineJob, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setRoutineJobs(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding routine job:', error);
      throw error;
    }
  };

  const updateRoutineJob = async (id: string, updates: RoutineJobUpdate) => {
    try {
      const { data, error } = await supabase
        .from('routine_jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setRoutineJobs(prev => prev.map(job => job.id === id ? data : job));
      return data;
    } catch (error) {
      console.error('Error updating routine job:', error);
      throw error;
    }
  };

  const deleteRoutineJob = async (id: string) => {
    try {
      const { error } = await supabase
        .from('routine_jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRoutineJobs(prev => prev.filter(job => job.id !== id));
    } catch (error) {
      console.error('Error deleting routine job:', error);
      throw error;
    }
  };

  const toggleRoutineJobStatus = async (id: string) => {
    const job = routineJobs.find(j => j.id === id);
    if (!job) return;

    await updateRoutineJob(id, { active: !job.active });
  };

  useEffect(() => {
    fetchRoutineJobs();
  }, [user]);

  return {
    routineJobs,
    loading,
    addRoutineJob,
    updateRoutineJob,
    deleteRoutineJob,
    toggleRoutineJobStatus,
    refetch: fetchRoutineJobs
  };
}