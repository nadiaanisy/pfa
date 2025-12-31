import React from 'react';
import {
  forgotPasswordSchema,
  ForgotPasswordFormData
} from '../../validation/auth';
import { useForm } from 'react-hook-form';
import AuthLayout from '../layouts/AuthLayout';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../../services/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCustomHook } from '../../misc/customHooks';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const {
    loading,
    setLoading,
    apiError,
    setApiError,
    success,
    setSuccess
  } = useCustomHook();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setApiError('');
    try {
      const result = await forgotPassword(data);

      setSuccess(true);
      reset();

      setTimeout(() => {
        navigate(`/change-password?email=${encodeURIComponent(result.email)}`);
      }, 1500);
      
    } catch (error: any) {
      setApiError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email and we’ll send you a reset link."
      footer={
        <>
          Remember your password?{" "}
          <a href="/" className="text-indigo-600 font-medium hover:underline">
            Back to Sign In
          </a>
        </>
      }
    >
      {success ? (
        <div className="text-center py-10">
          <p className="font-semibold text-lg">
            Account Exists! Redirecting to Change Password...
          </p>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="email@example.com"
              {...register("email")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          {apiError && <p className="text-xs text-red-500">{apiError}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-white font-medium hover:bg-indigo-700 transition"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;