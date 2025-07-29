import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type FinancialRecord = Database['public']['Tables']['financial_records']['Row'];
type FinancialRecordInsert = Database['public']['Tables']['financial_records']['Insert'];
type FinancialRecordUpdate = Database['public']['Tables']['financial_records']['Update'];

export function useFinancialRecords() {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRecords = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('financial_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching financial records:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async (record: Omit<FinancialRecordInsert, 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('financial_records')
        .insert({ ...record, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setRecords(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding financial record:', error);
      throw error;
    }
  };

  const updateRecord = async (id: string, updates: FinancialRecordUpdate) => {
    try {
      const { data, error } = await supabase
        .from('financial_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setRecords(prev => prev.map(record => record.id === id ? data : record));
      return data;
    } catch (error) {
      console.error('Error updating financial record:', error);
      throw error;
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('financial_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRecords(prev => prev.filter(record => record.id !== id));
    } catch (error) {
      console.error('Error deleting financial record:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [user]);

  return {
    records,
    loading,
    addRecord,
    updateRecord,
    deleteRecord,
    refetch: fetchRecords
  };
}