import { createContext } from 'react';

export interface SignupPayload {
  full_name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface AuthContextType {
  userEmail: string | null;
  login: (email: string) => void;
  logout: () => void;
}