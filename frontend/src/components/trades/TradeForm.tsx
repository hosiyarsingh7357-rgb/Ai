'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  TrendingUp, 
  Clock, 
  Tag, 
  Brain, 
  Settings2, 
  ChevronRight,
  Info,
  History,
  Cloud,
  CloudOff
} from 'lucide-react'
import { m, AnimatePresence } from 'framer-motion'
import { offlineStorage } from '@/lib/offlineStorage'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/apiClient'
import { offlineStorage } from '@/lib/offlineStorage'
import { v4 as uuidv4 } from 'uuid'

const tradeSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').toUpperCase(),
  assetClass: z.string().min(1, 'Select asset class'),
  direction: z.enum(['long', 'short']),
  entryPrice: z.coerce.number().positive('Price must be > 0'),
  quantity: z.coerce.number().positive('Quantity must be > 0'),
  entryDate: z.string().min(1, 'Required'),
  
  // Optional but important
  stopLoss: z.coerce.number().optional(),
  takeProfit: z.coerce.number().optional(),
  commission: z.coerce.number().optional(),
  
  // Psychology & Strategy
  setupType: z.string().optional(),
  emotionalStateEntry: z.string().optional(),
  notes: z.string().optional(),
  
  // Context
  accountId: z.string().min(1, 'Select an account'),
})

type TradeFormValues = z.infer<typeof tradeSchema>

export function TradeForm({ onSuccess }: { onSuccess?: () => void }) {
  const [activeTab, setActiveTab] = useState<'basic' | 'strategy' | 'advanced'>('basic')
  const [accounts, setAccounts] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      direction: 'long',
      assetClass: 'stocks',
      entryDate: new Date().toISOString().split('T')[0],
      commission: 0,
      emotionalStateEntry: 'calm',
    }
  })

  const formValues = watch()
  const direction = watch('direction')
  const assetClass = watch('assetClass')

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formValues.symbol) {
        setIsSaving(true)
        await offlineStorage.saveDraft({
          id: 'current-draft',
          ...formValues,
        })
        setTimeout(() => setIsSaving(false), 800)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [formValues])

  // Load accounts and check for drafts
  useEffect(() => {
    // 1. Load accounts
    apiClient.get('/auth/me')
      .then(res => {
        const user = res.data.data
        if (user.tradingAccounts?.length > 0) {
          setAccounts(user.tradingAccounts)
          // Set default account if not set
          const currentAccountId = watch('accountId')
          if (!currentAccountId) {
            const defaultAcc = user.tradingAccounts.find((a: any) => a.isDefault) ?? user.tradingAccounts[0]
            setValue('accountId', defaultAcc.id)
          }
        }
      })
      .catch(console.error)

    // 2. Load draft if exists
    offlineStorage.getDrafts().then(drafts => {
      if (drafts.length > 0) {
        const draft = drafts[0] as any // Use any for flexibility with form values
        // Only restore if form is currently empty/default
        const currentSymbol = watch('symbol')
        if (!currentSymbol) {
          Object.entries(draft).forEach(([key, value]) => {
            if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
              setValue(key as any, value)
            }
          })
        }
      }
    })
  }, [setValue])

  // Save draft on change
  const formValues = watch()
  useEffect(() => {
    const saveDraft = async () => {
      if (!formValues.symbol && !formValues.entryPrice) return

      const draft = {
        id: 'current-draft', // Keep a single draft for now
        ...formValues,
        updatedAt: new Date().toISOString()
      }
      await offlineStorage.saveDraft(draft as any)
    }

    const timer = setTimeout(saveDraft, 1000)
    return () => clearTimeout(timer)
  }, [formValues])

  const onSubmit = async (data: TradeFormValues) => {
    setIsSubmitting(true)
    try {
      // Format dates for backend
      const formattedData = {
        ...data,
        entryDate: new Date(data.entryDate).toISOString(),
      }
      
      await apiClient.post('/trades', formattedData)
      await offlineStorage.deleteDraft('current-draft')
      onSuccess?.()
    } catch (err: any) {
      console.error(err)
      
      // Check if it's a network error
      if (!navigator.onLine || err.message === 'Network Error' || !err.response) {
        const queueItem = {
          id: uuidv4(),
          ...data,
          entryDate: new Date(data.entryDate).toISOString(),
        }
        await offlineStorage.addToQueue(queueItem)
        await offlineStorage.deleteDraft('current-draft')
        alert('You are offline. Trade has been queued and will sync once connection is restored.')
        onSuccess?.()
        return
      }

      alert('Failed to log trade. Check all fields.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardBody className="p-0">
        <div className="flex border-b border-white/5">
          {[
            { id: 'basic', label: 'Trade Details', icon: TrendingUp },
            { id: 'strategy', label: 'Strategy', icon: Brain },
            { id: 'advanced', label: 'Advanced', icon: Settings2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all",
                activeTab === tab.id 
                  ? "text-[#00FF87] border-b-2 border-[#00FF87]" 
                  : "text-[#4B5563] hover:text-[#94A3B8] hover:bg-white/5"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="px-6 pt-4 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Trade Log Entry</h3>
          <AnimatePresence>
            {isSaving && (
              <m.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400/60 uppercase tracking-wider"
              >
                <Cloud size={10} className="animate-pulse" />
                Draft Saved
              </m.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-[#94A3B8] mb-1.5 block">Direction</label>
                  <div className="flex p-1 bg-[#151821] rounded-lg border border-white/5">
                    <button
                      type="button"
                      onClick={() => setValue('direction', 'long')}
                      className={cn(
                        "flex-1 py-2 text-sm font-bold rounded-md transition-all",
                        direction === 'long' ? "bg-[#00FF87]/10 text-[#00FF87]" : "text-[#4B5563] hover:text-white"
                      )}
                    >
                      LONG
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('direction', 'short')}
                      className={cn(
                        "flex-1 py-2 text-sm font-bold rounded-md transition-all",
                        direction === 'short' ? "bg-[#FF4757]/10 text-[#FF4757]" : "text-[#4B5563] hover:text-white"
                      )}
                    >
                      SHORT
                    </button>
                  </div>
                </div>

                <Input 
                  label="Symbol" 
                  placeholder="e.g. NVDA" 
                  {...register('symbol')} 
                  error={errors.symbol?.message}
                />
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#94A3B8]">Asset Class</label>
                  <select 
                    {...register('assetClass')}
                    className="w-full h-10 px-3 rounded-lg text-sm text-white bg-[#151821] border border-white/8 outline-none focus:border-[#00FF87] transition-all"
                  >
                    <option value="stocks">Stocks</option>
                    <option value="options">Options</option>
                    <option value="forex">Forex</option>
                    <option value="crypto">Crypto</option>
                    <option value="futures">Futures</option>
                  </select>
                </div>

                <Input 
                  label="Price" 
                  type="number" 
                  step="0.0001" 
                  {...register('entryPrice')} 
                  error={errors.entryPrice?.message}
                />
                <Input 
                  label="Quantity" 
                  type="number" 
                  {...register('quantity')} 
                  error={errors.quantity?.message}
                />
                
                <Input 
                  label="Stop Loss (SL)" 
                  type="number" 
                  step="0.0001" 
                  placeholder="Optional"
                  {...register('stopLoss')}
                />
                <Input 
                  label="Take Profit (TP)" 
                  type="number" 
                  step="0.0001" 
                  placeholder="Optional"
                  {...register('takeProfit')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Entry Date" 
                  type="date" 
                  {...register('entryDate')} 
                  error={errors.entryDate?.message}
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#94A3B8]">Trading Account</label>
                  <select 
                    {...register('accountId')}
                    className="w-full h-10 px-3 rounded-lg text-sm text-white bg-[#151821] border border-white/8 outline-none focus:border-[#00FF87] transition-all"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'strategy' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
              <Input 
                label="Setup / Strategy Name" 
                placeholder="e.g. Bull Flag Breakout" 
                {...register('setupType')}
              />
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#94A3B8]">Emotional State</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Calm', 'Confident', 'Anxious', 'Neutral', 'Greedy', 'Fearful'].map(emotion => (
                    <button
                      key={emotion}
                      type="button"
                      onClick={() => setValue('emotionalStateEntry', emotion.toLowerCase())}
                      className={cn(
                        "py-2 text-xs rounded-lg border transition-all",
                        watch('emotionalStateEntry') === emotion.toLowerCase()
                          ? "bg-white/10 text-white border-white/20"
                          : "bg-transparent text-[#4B5563] border-white/5 hover:border-white/10"
                      )}
                    >
                      {emotion}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#94A3B8]">Entry Notes</label>
                <textarea
                  {...register('notes')}
                  placeholder="Why are you taking this trade?"
                  className="w-full min-h-[100px] p-3 rounded-lg text-sm text-white bg-[#151821] border border-white/8 outline-none focus:border-[#00FF87] transition-all resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
              <Input 
                label="Commission" 
                type="number" 
                step="0.01" 
                {...register('commission')}
              />
              
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex gap-3">
                <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Advanced fields allow for higher precision in behavioral modeling. You can always update these after closing the trade.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="ghost" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} className="min-w-[140px]">
              {isSubmitting ? 'Logging...' : 'Log Trade'}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}
