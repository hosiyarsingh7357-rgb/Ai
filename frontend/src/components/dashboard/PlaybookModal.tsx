'use client'
import { useState, useEffect } from 'react'
import { X, Save, Shield, Target, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { apiClient } from '@/lib/apiClient'
import { toast } from 'react-hot-toast'

interface PlaybookModalProps {
  playbook?: any
  onClose: () => void
  onSuccess: () => void
}

export function PlaybookModal({ playbook, onClose, onSuccess }: PlaybookModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    setupType: '',
    entryRules: '',
    exitRules: '',
    riskRules: '',
    markets: [] as string[],
    timeframes: [] as string[],
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (playbook) {
      setFormData({
        name: playbook.name || '',
        description: playbook.description || '',
        setupType: playbook.setupType || '',
        entryRules: playbook.entryRules || '',
        exitRules: playbook.exitRules || '',
        riskRules: playbook.riskRules || '',
        markets: playbook.markets || [],
        timeframes: playbook.timeframes || [],
      })
    }
  }, [playbook])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (playbook) {
        await apiClient.patch(`/playbooks/${playbook.id}`, formData)
        toast.success('Strategy updated')
      } else {
        await apiClient.post('/playbooks', formData)
        toast.success('Strategy added to playbook')
      }
      onSuccess()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save strategy')
    } finally {
      setLoading(false)
    }
  }

  const toggleItem = (list: 'markets' | 'timeframes', val: string) => {
    setFormData(prev => ({
      ...prev,
      [list]: prev[list].includes(val)
        ? prev[list].filter(i => i !== val)
        : [...prev[list], val]
    }))
  }

  const MARKET_OPTIONS = ['S&P 500', 'Nasdaq', 'Gold', 'Oil', 'EUR/USD', 'BTC', 'ETH']
  const TIMEFRAME_OPTIONS = ['1m', '5m', '15m', '1h', '4h', 'Daily']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#16181D] border border-white/10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00FF87] to-[#4F9CFB] flex items-center justify-center shadow-[0_0_20px_rgba(0,255,135,0.2)]">
              <Shield size={20} className="text-[#0D0F14]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{playbook ? 'Edit Strategy' : 'New Strategy'}</h2>
              <p className="text-xs text-zinc-400">Define your systematic trading edge</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={20} className="text-zinc-500 hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Strategy Name</label>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Bullish Engulfing V1"
                className="w-full bg-zinc-900/50 border border-white/5 rounded-xl h-11 px-4 text-white focus:border-[#00FF87] outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Setup Type</label>
              <input
                required
                value={formData.setupType}
                onChange={(e) => setFormData({ ...formData, setupType: e.target.value })}
                placeholder="e.g. Mean Reversion"
                className="w-full bg-zinc-900/50 border border-white/5 rounded-xl h-11 px-4 text-white focus:border-[#00FF87] outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What makes this strategy unique?"
              className="w-full bg-zinc-900/50 border border-white/5 rounded-xl p-4 text-white focus:border-[#00FF87] outline-none transition-colors min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                <Target size={14} className="text-[#00FF87]" /> Entry Rules
              </label>
              <textarea
                value={formData.entryRules}
                onChange={(e) => setFormData({ ...formData, entryRules: e.target.value })}
                placeholder="List rules..."
                className="w-full bg-zinc-900/50 border border-white/5 rounded-xl p-3 text-sm text-white focus:border-[#00FF87] outline-none transition-colors min-h-[120px]"
              />
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                <X size={14} className="text-rose-500" /> Exit Rules
              </label>
              <textarea
                value={formData.exitRules}
                onChange={(e) => setFormData({ ...formData, exitRules: e.target.value })}
                placeholder="List rules..."
                className="w-full bg-zinc-900/50 border border-white/5 rounded-xl p-3 text-sm text-white focus:border-[#00FF87] outline-none transition-colors min-h-[120px]"
              />
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                <Shield size={14} className="text-sky-500" /> Risk Rules
              </label>
              <textarea
                value={formData.riskRules}
                onChange={(e) => setFormData({ ...formData, riskRules: e.target.value })}
                placeholder="Max drawdown..."
                className="w-full bg-zinc-900/50 border border-white/5 rounded-xl p-3 text-sm text-white focus:border-[#00FF87] outline-none transition-colors min-h-[120px]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                <MapPin size={14} /> Applied Markets
              </label>
              <div className="flex flex-wrap gap-2">
                {MARKET_OPTIONS.map(market => (
                  <button
                    key={market}
                    type="button"
                    onClick={() => toggleItem('markets', market)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      formData.markets.includes(market)
                        ? 'bg-[#00FF87] text-[#0D0F14] font-bold'
                        : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                    }`}
                  >
                    {market}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                <Clock size={14} /> Timeframes
              </label>
              <div className="flex flex-wrap gap-2">
                {TIMEFRAME_OPTIONS.map(tf => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => toggleItem('timeframes', tf)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      formData.timeframes.includes(tf)
                        ? 'bg-sky-500 text-white font-bold'
                        : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-white/5 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : (
              <span className="flex items-center justify-center gap-2">
                <Save size={18} /> {playbook ? 'Update' : 'Save Strategy'}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
