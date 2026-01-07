import React from 'react';
import {
  SignupFormData,
  signUpSchema
} from '../../validation/auth';
import { useForm } from 'react-hook-form';
import { signUp } from '../../services/auth';
import AuthLayout from '../layouts/AuthLayout';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCustomHook } from '../../misc/customHooks';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const {
    loading,
    setLoading,
    apiError,
    setApiError,
    success,
    setSuccess
  } = useCustomHook();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    setApiError('');
    try {
      await signUp(data);
      setSuccess(true);
      reset();

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      setApiError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Start managing your finances today"
      footer={
        <>
          Already have an account?{" "}
          <a href="/" className="text-indigo-600 font-medium hover:underline">
            Sign in
          </a>
        </>
      }
    >
      {success ? (
        <div className="text-center py-10">
          <p className="font-semibold text-lg">
            🎉 Account created successfully! Redirecting to Login...
          </p>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              placeholder='Your Full Name'
              {...register("full_name")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.full_name && (
              <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              placeholder='Your Username'
              {...register("username")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.username && (
              <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>
            )}
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              placeholder="Your password"
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
              placeholder="Confirm your password"
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
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default SignUp;