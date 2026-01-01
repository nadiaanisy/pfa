import { supabase } from '../misc/supabaseClient';

export const getIncomeSources = async () => {
  try {
    const { data, error } = await supabase
      .from('income_sources')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching income sources:", error);
      return [];
    }
    return data;
  } catch (error) {
    console.error("Error fetching income sources:", error);
    return [];
  }
};

export const deleteIncomeSources = async (id: string) => {
  try {
    const { error } = await supabase.from('income_sources').delete().eq('id', id);
    if (error) {
      console.error('Delete error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};

export const addIncomeSource = async (incomeSource: {
  name: string;
  type: 'salary' | 'rental' | 'loan' | 'dividend' | 'other';
  amount: number;
  balance: number;
  color: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('income_sources')
      .insert([incomeSource])
      .select();

    if (error) {
      console.error('Insert error:', error);
      return null;
    }
    return data ? data[0] : null;
  } catch (error) {
    console.error('Insert error:', error);
    return null;
  }
};

export const updateIncomeSource = async (data: {
  id: string;
  name: string;
  type: 'salary' | 'rental' | 'loan' | 'dividend' | 'other';
  amount: number;
  balance: number;
  color: string;
}) => {
  try {
    const { data: updatedRows, error } = await supabase
      .from('income_sources')
      .update({
        name: data.name,
        type: data.type,
        amount: data.amount,
        balance: data.balance,
        color: data.color,
      })
      .eq('id', data.id)
      .select();

    if (error) {
      console.error('Update error:', error);
      return null;
    }
    return updatedRows[0]; // return the updated source object
  } catch (error) {
    console.error('Update error:', error);
    return null;
  }
};