import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Habit = Database['public']['Tables']['habits']['Row'];
type HabitInsert = Database['public']['Tables']['habits']['Insert'];
type HabitUpdate = Database['public']['Tables']['habits']['Update'];

const normalizeCompletions = (val: any): any[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const normalizeHabit = (h: any) => ({
  ...h,
  completions: normalizeCompletions((h as any).completions),
});

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchHabits = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHabits((data || []).map((h: any) => normalizeHabit(h)));
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async (habit: Omit<HabitInsert, 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({ ...habit, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setHabits(prev => [normalizeHabit(data as any), ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding habit:', error);
      throw error;
    }
  };

  const updateHabit = async (id: string, updates: HabitUpdate) => {
    try {
      const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setHabits(prev => prev.map(habit => habit.id === id ? normalizeHabit(data as any) : habit));
      return data;
    } catch (error) {
      console.error('Error updating habit:', error);
      throw error;
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setHabits(prev => prev.filter(habit => habit.id !== id));
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  };

  const toggleHabitCompletion = async (habitId: string, date: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const completions = normalizeCompletions((habit as any).completions);
    const existingCompletion = completions.find((c: any) => c.date === date);
    
    let newCompletions;
    if (existingCompletion) {
      newCompletions = completions.map((c: any) => 
        c.date === date ? { ...c, completed: !c.completed } : c
      );
    } else {
      newCompletions = [...completions, { date, completed: true }];
    }

    await updateHabit(habitId, { completions: newCompletions });
  };

  useEffect(() => {
    fetchHabits();
  }, [user]);

  return {
    habits,
    loading,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    refetch: fetchHabits
  };
}