import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Goal = Database['public']['Tables']['goals']['Row'];
type GoalInsert = Database['public']['Tables']['goals']['Insert'];
type GoalUpdate = Database['public']['Tables']['goals']['Update'];

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchGoals = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (goal: Omit<GoalInsert, 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({ ...goal, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setGoals(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  };

  const updateGoal = async (id: string, updates: GoalUpdate) => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setGoals(prev => prev.map(goal => goal.id === id ? data : goal));
      return data;
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  };

  const completeGoal = async (goalId: string) => {
    if (!user) return;

    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) throw new Error('Goal not found');

      // Update goal as completed
      const { data: updatedGoal, error: goalError } = await supabase
        .from('goals')
        .update({ completed: true })
        .eq('id', goalId)
        .select()
        .single();

      if (goalError) throw goalError;

      // Create financial record for reward if goal has reward amount
      const rewardAmount = (goal as any).reward_amount;
      if (rewardAmount && rewardAmount > 0) {
        await supabase
          .from('financial_records')
          .insert({
            user_id: user.id,
            type: 'income',
            amount: rewardAmount,
            description: `پاداش تکمیل هدف: ${goal.title}`,
            category: goal.category,
            date: new Date().toISOString().split('T')[0]
          });
      }

      setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
      return updatedGoal;
    } catch (error) {
      console.error('Error completing goal:', error);
      throw error;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setGoals(prev => prev.filter(goal => goal.id !== id));
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    refetch: fetchGoals
  };
}