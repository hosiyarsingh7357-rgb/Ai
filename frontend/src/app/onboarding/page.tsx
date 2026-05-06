'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { m, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  TrendingUp, 
  ChevronRight, 
  ChevronLeft, 
  Briefcase, 
  Target, 
  BarChart, 
  CheckCircle2, 
  CircleDot
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'
import { apiClient } from '@/lib/apiClient'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils'

const onboardingSchema = z.object({
  // Step 1: Profile
  tradingStyle: z.string().min(1, 'Please select a style'),
  experienceLevel: z.string().min(1, 'Please select your level'),
  primaryAssets: z.array(z.string()).min(1, 'Select at least one asset type'),
  
  // Step 2: Account
  accountName: z.string().min(1, 'Account name is required'),
  currency: z.string().min(1, 'Required'),
  initialBalance: z.coerce.number().min(0, 'Must be positive'),
  riskPerTrade: z.coerce.number().min(0).max(100, '0-100%'),
})

type OnboardingForm = z.infer<typeof onboardingSchema>

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isFinishing, setIsFinishing] = useState(false)
  const { user } = useAuthStore()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      tradingStyle: '',
      experienceLevel: '',
      primaryAssets: [],
      accountName: 'Main Portfolio',
      currency: 'USD',
      initialBalance: 10000,
      riskPerTrade: 1,
    }
  })

  const formValues = watch()

  const onSubmit = async (data: OnboardingForm) => {
    setIsFinishing(true)
    try {
      await apiClient.post('/auth/onboarding', {
        ...data,
        tradingStyle: data.tradingStyle.toUpperCase().replace(' ', '_'),
        experienceLevel: data.experienceLevel.toUpperCase(),
      })
      // Success - small delay for effect
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err) {
      console.error(err)
      setIsFinishing(false)
      alert('Something went wrong. Please try again.')
    }
  }

  const nextStep = () => {
    // Basic local validation for step 1
    if (step === 1) {
      if (!formValues.tradingStyle || !formValues.experienceLevel || formValues.primaryAssets.length === 0) {
        return
      }
    }
    setStep(s => s + 1)
  }

  const prevStep = () => setStep(s => s - 1)

  const toggleAsset = (asset: string) => {
    const current = formValues.primaryAssets
    if (current.includes(asset)) {
      setValue('primaryAssets', current.filter(a => a !== asset))
    } else {
      setValue('primaryAssets', [...current, asset])
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0F14] flex flex-col items-center p-4 pt-12 md:pt-24">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#00FF87]/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-2xl relative">
        {/* Progress header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00FF87] flex items-center justify-center shadow-[0_0_16px_rgba(0,255,135,0.4)]">
              <TrendingUp size={16} strokeWidth={2.5} className="text-[#0D0F14]" />
            </div>
            <span className="font-bold text-white tracking-tight">Onboarding</span>
          </div>
          
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(i => (
              <div 
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  step === i ? "w-8 bg-[#00FF87]" : "w-4 bg-white/10"
                )}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <m.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Build your profile</h1>
                  <p className="text-[#94A3B8]">Tell us how you trade so we can tailor your insights.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Style */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider">Trading Style</label>
                    <div className="grid gap-2">
                      {['Scalper', 'Day Trader', 'Swing Trader', 'Position Trader'].map(style => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setValue('tradingStyle', style)}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
                            formValues.tradingStyle === style 
                              ? "bg-[#00FF87]/5 border-[#00FF87]/50 text-white shadow-[0_0_20px_rgba(0,255,135,0.05)]" 
                              : "bg-[#151821] border-white/5 text-[#94A3B8] hover:border-white/10 hover:text-white"
                          )}
                        >
                          <CircleDot size={18} className={formValues.tradingStyle === style ? "text-[#00FF87]" : "text-white/10"} />
                          <span className="text-sm font-medium">{style}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Level */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider">Experience</label>
                    <div className="grid gap-2">
                      {['Beginner', 'Intermediate', 'Advanced', 'Professional'].map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setValue('experienceLevel', lvl)}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
                            formValues.experienceLevel === lvl 
                              ? "bg-[#00FF87]/5 border-[#00FF87]/50 text-white shadow-[0_0_20px_rgba(0,255,135,0.05)]" 
                              : "bg-[#151821] border-white/5 text-[#94A3B8] hover:border-white/10 hover:text-white"
                          )}
                        >
                          <BarChart size={18} className={formValues.experienceLevel === lvl ? "text-[#00FF87]" : "text-white/10"} />
                          <span className="text-sm font-medium">{lvl}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Assets */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider">What do you trade?</label>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {['Stocks', 'Options', 'Forex', 'Crypto', 'Futures', 'Commodities'].map(asset => (
                      <button
                        key={asset}
                        type="button"
                        onClick={() => toggleAsset(asset.toUpperCase())}
                        className={cn(
                          "px-6 py-3 rounded-full border transition-all font-medium",
                          formValues.primaryAssets.includes(asset.toUpperCase())
                            ? "bg-[#00FF87] text-[#0D0F14] border-[#00FF87]"
                            : "bg-[#151821] border-white/5 text-[#94A3B8] hover:border-white/10"
                        )}
                      >
                        {asset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    disabled={!formValues.tradingStyle || !formValues.experienceLevel || formValues.primaryAssets.length === 0}
                  >
                    Continue <ChevronRight size={18} />
                  </Button>
                </div>
              </m.div>
            )}

            {step === 2 && (
              <m.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Set up your account</h1>
                  <p className="text-[#94A3B8]">The starting point for your performance tracking.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Account Name" 
                    placeholder="e.g. Interactive Brokers Main"
                    {...register('accountName')}
                    error={errors.accountName?.message}
                  />
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#94A3B8]">Currency</label>
                    <select 
                      {...register('currency')}
                      className="w-full h-10 px-3 rounded-lg text-sm text-white bg-[#151821] border border-white/8 outline-none focus:border-[#00FF87] transition-all appearance-none"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="BTC">BTC - Bitcoin</option>
                    </select>
                  </div>
                  <Input 
                    label="Starting Balance" 
                    type="number"
                    {...register('initialBalance')}
                    error={errors.initialBalance?.message}
                  />
                  <Input 
                    label="Risk Per Trade (%)" 
                    type="number"
                    step="0.1"
                    {...register('riskPerTrade')}
                    error={errors.riskPerTrade?.message}
                  />
                </div>

                <div className="p-6 rounded-2xl bg-[#00FF87]/5 border border-[#00FF87]/20 flex gap-4 items-start">
                  <Target className="text-[#00FF87] shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="text-white font-medium mb-1">Recommended for you</h4>
                    <p className="text-sm text-[#94A3B8]">
                      Based on your profile, we recommend a risk per trade of {formValues.experienceLevel === 'Beginner' ? '0.5%' : '1.0%'} to ensure longevity in the markets.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button type="button" variant="secondary" onClick={prevStep}>
                    <ChevronLeft size={18} /> Back
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Review Profile <ChevronRight size={18} />
                  </Button>
                </div>
              </m.div>
            )}

            {step === 3 && (
              <m.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8 text-center py-8"
              >
                {!isFinishing ? (
                  <>
                    <div className="w-20 h-20 rounded-full bg-[#00FF87]/10 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="text-[#00FF87]" size={40} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">Ready to trade?</h1>
                      <p className="text-[#94A3B8]">Finalize your profile and step into your professional dashboard.</p>
                    </div>

                    <Card className="text-left bg-[#151821] border-white/5 max-w-sm mx-auto">
                      <CardBody className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#4B5563]">Profile</span>
                          <span className="text-white font-medium">{formValues.tradingStyle}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#4B5563]">Assets</span>
                          <span className="text-white font-medium">{formValues.primaryAssets.length} Selected</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-white/5 pt-3">
                          <span className="text-[#4B5563]">Initial Capital</span>
                          <span className="text-[#00FF87] font-bold">{formValues.currency} {formValues.initialBalance.toLocaleString()}</span>
                        </div>
                      </CardBody>
                    </Card>

                    <div className="flex flex-col gap-3 max-w-sm mx-auto pt-4">
                      <Button type="submit" size="lg" loading={isFinishing}>
                        Finish Setup
                      </Button>
                      <Button type="button" variant="ghost" onClick={prevStep}>
                        Modify details
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="py-12 flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-[#00FF87]/20 border-t-[#00FF87] rounded-full animate-spin mb-6" />
                    <h2 className="text-2xl font-bold text-white">Initializing Dashboard</h2>
                    <p className="text-[#94A3B8] mt-2">Setting up your behavioral analysis engine...</p>
                  </div>
                )}
              </m.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  )
}
