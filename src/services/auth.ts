import {
  ForgotPasswordPayload,
  SignupPayload
} from '../misc/interfaces';
import bcrypt from 'bcryptjs';
import { supabase } from '../misc/supabaseClient';

export const signUp = async (payload: SignupPayload) => {
  try {
    const hashedPassword = bcrypt.hashSync(payload.password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert({
        full_name: payload.full_name,
        email: payload.email,
        password_hash: hashedPassword,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const forgotPassword = async (payload: ForgotPasswordPayload) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", payload.email)
    .single();
  
  if (error || !data) {
    throw new Error("No account found with this email");
  }

  return { email: data.email };
};

export const changePassword = async (email: string, newPassword: string) => {
  try {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    const { error } = await supabase
      .from("users")
      .update({ password_hash: hashedPassword })
      .eq("email", email);

    if (error) throw error;

    return;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const login = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      throw new Error("No account found with this email");
    }

    const isValid = bcrypt.compareSync(password, data.password_hash);

    if (!isValid) {
      throw new Error("Incorrect password");
    }

    localStorage.setItem("currentUser", JSON.stringify(data));
    sessionStorage.setItem("currentUser", JSON.stringify(data));
    updateLastLogin(data.id);

    await supabase.from('login_history').insert({
      user_id: data.id,
      login_time: new Date().toISOString()
    });

    return data;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const updateLastLogin = async (userId: string) => {
  const { error } = await supabase
    .from('users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', userId);

  if (error) console.error('Failed to update last login:', error);
};
