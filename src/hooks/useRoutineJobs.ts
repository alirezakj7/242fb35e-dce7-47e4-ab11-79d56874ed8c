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

  const logRoutineJobCompletion = async (jobId: string) => {
    if (!user) return;

    try {
      const job = routineJobs.find(j => j.id === jobId);
      if (!job) throw new Error('Routine job not found');

      // Get current completions
      const completions = (job.completions as string[]) || [];
      const today = new Date().toISOString().split('T')[0];
      
      // Add today's completion
      const updatedCompletions = [...completions, today];

      // Calculate required completions for a month based on frequency
      let requiredCompletions = 0;
      if (job.frequency === 'daily') {
        requiredCompletions = 30;
      } else if (job.frequency === 'weekly') {
        requiredCompletions = 4;
      } else if (job.frequency === 'monthly') {
        requiredCompletions = 1;
      } else if (job.frequency === 'custom' && job.days_of_week) {
        // Calculate based on days per week * 4 weeks
        requiredCompletions = job.days_of_week.length * 4;
      }

      // Check if we've reached the monthly threshold
      if (updatedCompletions.length >= requiredCompletions) {
        // Create financial record
        const { error: finError } = await supabase
          .from('financial_records')
          .insert({
            user_id: user.id,
            type: 'income',
            amount: job.earnings,
            description: `دستمزد ماهانه: ${job.name}`,
            category: job.category,
            date: today,
            routine_job_id: jobId,
          });

        if (finError) throw finError;

        // Reset completions and update last payout date
        const { error: updateError } = await supabase
          .from('routine_jobs')
          .update({
            completions: [],
            last_payout_date: today,
          })
          .eq('id', jobId);

        if (updateError) throw updateError;

        // Update local state
        setRoutineJobs(prev => prev.map(j => 
          j.id === jobId 
            ? { ...j, completions: [], last_payout_date: today }
            : j
        ));

        return { completed: true, message: `ماه کامل شد! ${job.earnings} تومان به حساب شما اضافه شد` };
      } else {
        // Just update completions
        const { error: updateError } = await supabase
          .from('routine_jobs')
          .update({ completions: updatedCompletions })
          .eq('id', jobId);

        if (updateError) throw updateError;

        // Update local state
        setRoutineJobs(prev => prev.map(j => 
          j.id === jobId 
            ? { ...j, completions: updatedCompletions }
            : j
        ));

        const remaining = requiredCompletions - updatedCompletions.length;
        return { 
          completed: false, 
          message: `ثبت شد! ${remaining} بار دیگر تا دریافت دستمزد ماهانه` 
        };
      }
    } catch (error) {
      console.error('Error logging routine job completion:', error);
      throw error;
    }
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
    logRoutineJobCompletion,
    refetch: fetchRoutineJobs
  };
}