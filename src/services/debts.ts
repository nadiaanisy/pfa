import { supabase } from '../misc/supabaseClient';

export const fetchDebts = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('debts')
      .select(`
        *,
        payments:debt_payments (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data.map(debt => ({
      ...debt,
      payments: debt.payments ?? [],
    }));
  } catch (error) {
    console.error("Error fetching debts:", error);
    throw error;
  }
};

export const addDebt = async (debt: any) => {
  const { error } = await supabase
    .from('debts')
    .insert(debt);

  if (error) {
    console.error("Error adding debt:", error);
    return false;
  }

  return true;
};

export const deleteDebt = async (id: string) => {
  try {
    const { error } = await supabase
      .from('debts')
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

export const addDebtPayment = async (
  paymentData: any,
  newRemaining: number,
  isPaid: boolean
) => {
  try {    
    // Insert the payment
    const { error: paymentError } = await supabase
      .from('debt_payments')
      .insert(paymentData)
      .select();

    if (paymentError) {
      console.error("Error adding debt payment:", paymentError);
      return null;
    }

    // Update the debt's remaining amount and status
    const { error: debtError } = await supabase
      .from('debts')
      .update({
        remaining_amount: newRemaining,
        status: isPaid ? 'paid' : 'active',
      })
      .eq('id', paymentData.debt_id);

      if (debtError) {
        console.error("Error updating debt:", debtError);
        return null;
      }
    return true;
  } catch (error) {
    console.error("Error adding debt payment:", error);
    return null;
  } 
};

export const deleteDebtPayment = async (debtId: string, paymentId: string) => {
   try {
    // 1️⃣ Get the payment to know the amount
    const { data: payment, error: paymentFetchError } = await supabase
      .from('debt_payments')
      .select('amount')
      .eq('id', paymentId)
      .single();

    if (paymentFetchError) throw paymentFetchError;
    if (!payment) throw new Error('Payment not found');

    const paymentAmount = payment.amount;

    // 2️⃣ Delete the payment
    const { error: deleteError } = await supabase
      .from('debt_payments')
      .delete()
      .eq('id', paymentId);

    if (deleteError) throw deleteError;

    // 3️⃣ Update debt remaining_amount
    const { data: debt, error: debtFetchError } = await supabase
      .from('debts')
      .select('*')
      .eq('id', debtId)
      .single();

    if (debtFetchError) throw debtFetchError;

    // Restore remaining amount safely
    const currentRemaining = debt.remaining_amount ?? debt.total_amount;
    const newRemaining = Math.min(currentRemaining + paymentAmount, debt.total_amount);

    const newStatus = newRemaining === debt.total_amount ? 'active' : 'active'; // still active

    const { error: debtUpdateError } = await supabase
      .from('debts')
      .update({
        remaining_amount: newRemaining,
        status: newStatus,
      })
      .eq('id', debtId);

    if (debtUpdateError) throw debtUpdateError;

    return true; //{ newRemaining, status: newStatus };
  } catch (error) {
    console.error('Failed to delete payment:', error);
    throw error;
  }
};

export const updateDebt = async (id: string, updatedDebtData: any) => {
  try {
    const { error } = await supabase
      .from('debts')
      .update(updatedDebtData)
      .eq('id', id);
    
    if (error) {
      console.error("Error updating debt:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error updating debt:", error);
    return false;
  }
};
//   try {
//     const { error } = await supabase
//       .from('expenses')
//       .update(expense)
//       .eq('id', expense.id);

//     if (error) {
//       console.error("Error updating expense:", error);
//       return false;
//     }
//     return true;
//   } catch (error) {
//     console.error("Error updating expense:", error);
//     return false;
//   }
// };