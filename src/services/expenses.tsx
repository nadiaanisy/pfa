import { supabase } from '../misc/supabaseClient';

export const fetchExpenses = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Error fetching expenses:", error);
    throw error;
  }
};

export const addExpense = async (expense: any) => {
  const { error } = await supabase
    .from('expenses')
    .insert(expense);

  if (error) {
    console.error("Error adding expense:", error);
    return false;
  }

  return true;
};

export const deleteExpense = async (expenseDetails: any) => {
  try {
    const { id, amount, income_source_id } = expenseDetails;
    if (!id || !income_source_id || amount == null) {
      console.error("Invalid expense details");
      return false;
    }

    // Restore balance in income source
    const { data: incomeSourceData, error: fetchError } = await supabase
      .from('income_sources')
      .select('*')
      .eq('id', income_source_id)
      .single();

    if (fetchError || !incomeSourceData) {
      console.error("Failed to fetch income source:", fetchError);
      return false;
    }

    const newBalance = incomeSourceData.balance + parseFloat(amount);

    const { error: updateError } = await supabase
      .from('income_sources')
      .update({ balance: newBalance })
      .eq('id', income_source_id);

    if (updateError) {
      console.error("Failed to update income source balance:", updateError);
      return false;
    }

    // Delete the expense
    const { error: deleteError } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error("Error deleting expense:", deleteError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error deleting expense:", error);
    return false;
  }
};

export const updateExpense = async (expense: any) => {
  try {
    const { error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', expense.id);

    if (error) {
      console.error("Error updating expense:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error updating expense:", error);
    return false;
  }
};