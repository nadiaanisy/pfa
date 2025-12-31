import { useState } from 'react';
import { UserProfile } from './interfaces';

export const useCustomHook = () => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [darkMode, setDarkMode] = useState<boolean>(
    JSON.parse(localStorage.getItem('darkMode') || 'false')
  );
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  return {
    loading,
    setLoading,
    apiError,
    setApiError,
    successMsg,
    setSuccessMsg,
    toastMessage,
    setToastMessage,
    toastType,
    setToastType,
    success,
    setSuccess,
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    user,
    setUser,
    newPassword,
    setNewPassword,
    darkMode,
    setDarkMode,
    avatarUrl,
    setAvatarUrl
  };
}