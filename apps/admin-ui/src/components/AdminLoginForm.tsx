"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { 
  Eye, 
  EyeOff, 
  Shield, 
  Lock,
  Mail,
  Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
//import axiosInstance from '../utils/axiosInstance'
import axios, { AxiosError } from 'axios'

interface AdminLoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

const AdminLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<AdminLoginFormData>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  })

  const loginMutation = useMutation({
    mutationFn: async (data: AdminLoginFormData) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/login-admin`, data, { withCredentials: true })
      return response.data
    },
    onSuccess: (data) => {
      setServerError(null)
      console.log('Admin login successful:', data)
      // Redirect to admin dashboard
      router.push('/dashboard')
    },
    onError: (error: AxiosError) => {
      console.error('Admin login error:', error)
      const errorMessage = (error.response?.data as { message?: string })?.message || "Invalid admin credentials. Please try again."
      setServerError(errorMessage)
    }
  })

  const onSubmit = async (data: AdminLoginFormData) => {
    console.log('Admin login data:', data)
    loginMutation.mutate(data)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-[#ff8800] to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400">Sign in to access the administration panel</p>
        </div>

        {/* Login Form */}
        <div className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  disabled={loginMutation.isPending}
                  className="w-full bg-[#18181b] border border-[#232326] rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff8800] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="admin@company.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  disabled={loginMutation.isPending}
                  className="w-full bg-[#18181b] border border-[#232326] rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff8800] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loginMutation.isPending}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('rememberMe')}
                disabled={loginMutation.isPending}
                className="w-4 h-4 rounded border-[#232326] bg-[#18181b] text-[#ff8800] focus:ring-[#ff8800] focus:ring-2 disabled:opacity-50"
              />
              <label className="ml-2 text-sm text-gray-400">
                Keep me signed in
              </label>
            </div>

            {/* Server Error */}
            {serverError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-400 text-sm text-center">{serverError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isValid || loginMutation.isPending}
              className="w-full bg-[#ff8800] text-[#18181b] rounded-xl py-3 font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-6 text-center">
            <a 
              href="/forgot-password" 
              className="text-sm text-gray-400 hover:text-[#ff8800] transition-colors"
            >
              Forgot your password?
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Secured admin access • Contact IT support for assistance
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginForm
