'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TrendingUp, Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/lib/apiClient'

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

function ResetPasswordFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({ resolver: zodResolver(resetPasswordSchema) })

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      setApiError('Invalid or missing reset token')
      return
    }

    setApiError('')
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        password: data.password
      })
      setIsSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err: any) {
      const msg = err.response?.data?.error?.message ?? 'Something went wrong'
      setApiError(msg)
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Invalid link</h1>
        <p className="text-[#94A3B8] text-sm mb-8">
          The password reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password">
          <Button className="w-full">Request new link</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      {isSuccess ? (
        <div className="text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 rounded-full bg-[#00FF87]/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-[#00FF87]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Password reset</h1>
          <p className="text-[#94A3B8] text-sm mb-8">
            Your password has been successfully reset. Redirecting to login...
          </p>
          <Link href="/login" className="w-full">
            <Button className="w-full">Sign In Now</Button>
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-white mb-2">Set new password</h1>
          <p className="text-[#94A3B8] text-sm mb-8">
            Your new password must be different from previous passwords.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.password?.message}
                autoComplete="new-password"
                icon={<Lock size={16} />}
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
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
              icon={<Lock size={16} />}
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
            >
              Reset Password
            </Button>
          </form>
        </>
      )}
    </>
  )
}

export default function ResetPasswordPage() {
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
          <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
            <ResetPasswordFormContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
