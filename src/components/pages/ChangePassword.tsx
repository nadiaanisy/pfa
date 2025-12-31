import React from 'react';
import {
  useSearchParams,
  useNavigate
} from 'react-router-dom';
import {
  ChangePasswordFormData,
  changePasswordSchema
} from '../../validation/auth';
import AuthToast from '../ui/AuthToast';
import { useForm } from 'react-hook-form';
import AuthLayout from '../layouts/AuthLayout';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCustomHook } from '../../misc/customHooks';
import { changePassword, signUp } from '../../services/auth';

const ChangePassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const navigate = useNavigate();
  const {
    loading,
    setLoading,
    apiError,
    setApiError,
    success,
    setSuccess
  } = useCustomHook();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    if (!email) {
      setApiError("Invalid request: email not found");
      return;
    }

    setLoading(true);
    setApiError('');
  
    try {
      await changePassword(email, data.password);
      setSuccess(true);
      reset();

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: any) {
      setApiError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Change Password"
      subtitle={`Set a new password for ${email}`}
    >
      {success ? (
        <div className="text-center py-10">
          <p className="font-semibold text-lg">
            Password changed successfully! Redirecting to Login...
          </p>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              placeholder="Your new password"
              {...register("password")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your new password"
              {...register("confirmPassword")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {apiError && <p className="text-xs text-red-500">{apiError}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-white font-medium hover:bg-indigo-700 transition"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ChangePassword;