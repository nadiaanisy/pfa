import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthContextType } from '../../misc/interfaces';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userEmail, setUserEmail] = useState<string | null>(
    localStorage.getItem("userEmail") || null
  );

  const login = (email: string) => {
    setUserEmail(email);
    localStorage.setItem("userEmail", email);
  };

  const logout = () => {
    setUserEmail(null);
    localStorage.removeItem("userEmail");
  };

  return (
    <AuthContext.Provider value={{ userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};