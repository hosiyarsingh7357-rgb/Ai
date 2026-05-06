'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TrendingUp, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/lib/apiClient'

const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email'),
})
type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [apiError, setApiError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setApiError('')
    try {
      await apiClient.post('/auth/forgot-password', data)
      setIsSubmitted(true)
    } catch (err: any) {
      const msg = err.response?.data?.error?.message ?? 'Something went wrong'
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
          {isSubmitted ? (
            <div className="text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-[#00FF87]/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} className="text-[#00FF87]" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
              <p className="text-[#94A3B8] text-sm mb-8">
                We have sent a password reset link to your email address.
              </p>
              <Link href="/login" className="w-full">
                <Button className="w-full" variant="secondary">
                  Back to login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">Forgot password?</h1>
              <p className="text-[#94A3B8] text-sm mb-8">
                No worries, we&apos;ll send you reset instructions.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  autoComplete="email"
                  icon={<Mail size={16} />}
                  {...register('email')}
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

              <div className="mt-8 text-center">
                <Link 
                  href="/login" 
                  className="text-sm text-[#94A3B8] hover:text-white inline-flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
