import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (task: Omit<TaskInsert, 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...task, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setTasks(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, updates: TaskUpdate) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setTasks(prev => prev.map(task => task.id === id ? data : task));
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const completeTask = async (taskId: string) => {
    if (!user) return;

    try {
      // Get the task first to check for financial data
      const task = tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');

      // Update task status
      const { data: updatedTask, error: taskError } = await supabase
        .from('tasks')
        .update({ 
          status: 'done',
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();

      if (taskError) throw taskError;

      // Create financial record if task has financial type
      if (task.financial_type) {
        let recordType: 'income' | 'expense' = 'income';
        let amount = 0;

        if (task.financial_type === 'spend') {
          recordType = 'expense';
        }

        // For routine tasks, get amount from routine job
        if (task.routine_job_id && task.financial_type !== 'spend') {
          const { data: routineJob } = await supabase
            .from('routine_jobs')
            .select('earnings')
            .eq('id', task.routine_job_id)
            .single();
          
          amount = routineJob?.earnings || 0;
        }

        if (amount > 0) {
          await supabase
            .from('financial_records')
            .insert({
              user_id: user.id,
              type: recordType,
              amount: amount,
              description: `تکمیل وظیفه: ${task.title}`,
              category: task.category,
              date: new Date().toISOString().split('T')[0],
              task_id: taskId,
              routine_job_id: task.routine_job_id
            });
        }
      }

      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      return updatedTask;
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    refetch: fetchTasks
  };
}