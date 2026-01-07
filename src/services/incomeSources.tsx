import { supabase } from '../misc/supabaseClient';

export const getIncomeSources = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('income_sources')
      .select('*')
      .order('created_at', { ascending: false })
      .eq('user_id', userId);

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
    const { error } = await supabase
      .from('income_sources')
      .delete()
      .eq('id', id);

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
  user_id: string;
  name: string;
  type: 'salary' | 'rental' | 'loan' | 'dividend' | 'other';
  amount: number;
  balance: number;
  color: string;
  purposeMonth: string;
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
  user_id: string;
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
        user_id: data.user_id,
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
    return updatedRows[0];
  } catch (error) {
    console.error('Update error:', error);
    return null;
  }
};

export const updateIncomeSourceBalance = async (
  incomeSourceId: string,
  amount: number
) => {
  try {
    // Fetch current income source
    const { data: sourceData, error: fetchError } = await supabase
      .from('income_sources')
      .select('*')
      .eq('id', incomeSourceId)
      .single();

    if (fetchError || !sourceData) {
      console.error('Failed to fetch income source:', fetchError);
      return null;
    }

    // Calculate new balance, ensuring it doesn't go negative
    const newBalance = Math.max(0, sourceData.balance - amount);

    // Update the balance
    const { data: updatedData, error: updateError } = await supabase
      .from('income_sources')
      .update({ balance: newBalance })
      .eq('id', incomeSourceId)
      .select()
      .single();

    if (updateError || !updatedData) {
      console.error('Failed to update income source:', updateError);
      return null;
    }

    return updatedData;
  } catch (error) {
    console.error('Unexpected error updating income source balance:', error);
    return null;
  }
};