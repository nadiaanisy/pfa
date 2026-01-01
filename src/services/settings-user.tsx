import bcrypt from 'bcryptjs';
import { supabase } from '../misc/supabaseClient';

export const getCurrentUser = () => {
  const userData = sessionStorage.getItem("currentUser");
  if (!userData) return null;

  return JSON.parse(userData);
};


export const updateUserDetails = async (updatedInfo: any) => {
  const { error } = await supabase
    .from('users')
    .update({ full_name: updatedInfo.full_name, email: updatedInfo.email, currency: updatedInfo.currency })
    .eq('id', updatedInfo.id);

  if (error) {
    console.log(error.message)
    return false;
  }

  const { data, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', updatedInfo.id)
    .single();
  
  if (fetchError) {
    console.log(fetchError.message);
    return false;
  }

  sessionStorage.setItem("currentUser", JSON.stringify(data));
  localStorage.setItem("currentUser", JSON.stringify(data));

  return true;
};

export const updateUserPassword = async (newPassword: string) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;

  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  const { error } = await supabase
    .from('users')
    .update({ password_hash: hashedPassword })
    .eq('id', currentUser.id);

  if (error) {
    console.log(error.message)
    return false;
  }

  return true;
};

export const updateUserAvatar = async (user: any, base64: any) => {
  const { error } = await supabase
    .from('users')
    .update({ avatar_url: base64 })
    .eq('id', user.id);

  if (error) {
    console.log(error.message);
    return false;
  }
  return true;
};

export const fetchCurrentUser = async () => {
  const sessionUser = sessionStorage.getItem("currentUser");
  if (!sessionUser) return null;

  const userId = JSON.parse(sessionUser).id;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Failed to fetch user:', error);
    return JSON.parse(sessionUser); // fallback to session
  }

  const { data: loginHistory, error: historyError } = await supabase
    .from('login_history')
    .select('*')
    .eq('user_id', data.id)
    .order('login_time', { ascending: false })
    .limit(5);

  if (historyError) console.error('Error fetching login history:', historyError);
  sessionStorage.setItem("currentUser", JSON.stringify(data));
  localStorage.setItem("currentUser", JSON.stringify(data));

  return { ...data, loginHistory: loginHistory || [] };
};