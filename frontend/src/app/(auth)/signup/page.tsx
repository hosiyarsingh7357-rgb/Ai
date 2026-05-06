'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TrendingUp, Eye, EyeOff, User, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/lib/apiClient'
import { useAuthStore } from '@/store/auth.store'

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignupForm = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) })

  const onSubmit = async (data: SignupForm) => {
    setApiError('')
    try {
      // 1. Register
      const res = await apiClient.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      })
      
      const { user } = res.data.data
      setAuth(user)
      
      // 2. Redirect to onboarding
      router.push('/onboarding')
    } catch (err: any) {
      const msg = err.response?.data?.error?.message ?? 'Account creation failed. Please try again.'
      setApiError(msg)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0F14] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#00FF87]/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#00FF87] flex items-center justify-center shadow-[0_0_24px_rgba(0,255,135,0.5)]">
            <TrendingUp size={20} strokeWidth={2.5} className="text-[#0D0F14]" />
          </div>
          <span className="text-xl font-bold text-white">Trade Journal</span>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-white mb-2">Create an account</h1>
          <p className="text-[#94A3B8] text-sm mb-8">Start tracking your trades with AI power</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="signup-form">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              error={errors.name?.message}
              autoComplete="name"
              {...register('name')}
            />
            
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              autoComplete="email"
              {...register('email')}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.password?.message}
                autoComplete="new-password"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 bottom-2.5 text-[#4B5563] hover:text-[#94A3B8] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
              {...register('confirmPassword')}
            />

            {apiError && (
              <p className="text-sm text-[#FF4757] bg-[#FF4757]/10 border border-[#FF4757]/20 rounded-lg px-3 py-2">
                {apiError}
              </p>
            )}

            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full mt-2"
              size="lg"
              id="signup-submit"
            >
              Sign Up
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-[#4B5563]">or</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <Button variant="secondary" className="w-full" size="lg" id="google-signup" disabled>
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </Button>

          <p className="text-center text-sm text-[#94A3B8] mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#00FF87] hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
