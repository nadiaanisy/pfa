import React from 'react';
import { useForm } from 'react-hook-form';
import { login } from '../../services/auth';
import AuthLayout from '../layouts/AuthLayout';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCustomHook } from '../../misc/customHooks';
import { useAuth } from '../../services/context/AuthContext';
import { LoginFormData, loginSchema } from '../../validation/auth';

const Login: React.FC = () => {
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();
  const {
    loading,
    setLoading,
    apiError,
    setApiError,
    success,
    setSuccess
  } = useCustomHook();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setApiError("");

    try {
      await login(data.email, data.password);
      setAuth(data.email);
      setSuccess(true);

      setTimeout(() => {
        navigate("/dashboard");
        setLoading(false);
      }, 1500);

    } catch (error: any) {
      setApiError(error.message || "Something went wrong");
    }
  };

  return (
    <AuthLayout
      title="Personal Finance"
      subtitle="Manage your money wisely"
      footer={
        <>
          Don't have an account?{" "}
          <a href="/signup" className="text-indigo-600 font-medium hover:underline">
            Sign up
          </a>
        </>
      }
    >
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

          {apiError && <p className="text-xs text-red-500">{apiError}</p>}

          <div className="text-right">
            <a
              href="/forgot-password"
              className="text-sm text-indigo-600 hover:underline"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-white font-medium hover:bg-indigo-700 transition"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
    </AuthLayout>
  );
};

export default Login;
