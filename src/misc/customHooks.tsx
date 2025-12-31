import { useState } from 'react';

export const useCustomHook = () => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [success, setSuccess] = useState(false);

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
    setSuccess
  };
}