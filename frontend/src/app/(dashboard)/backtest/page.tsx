'use client'

import React, { useState } from 'react'
import { Card, CardBody } from '@/components/ui/Card'
import { Plus, History, Play, Trophy, Target, ChevronRight, AlertCircle } from 'lucide-react'
import { useBacktestSessions, useCreateBacktestSession } from '@/hooks/useBacktest'
import { usePlaybooks } from '@/hooks/usePlaybooks'
import { format } from 'date-fns'
import Link from 'next/link'
import { FeatureGate } from '@/components/auth/FeatureGate'

export default function BacktestPage() {
  const { data: sessions, isLoading: isSessionsLoading } = useBacktestSessions()
  const { data: playbooks } = usePlaybooks()
  const createSession = useCreateBacktestSession()
  
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    playbookId: '',
    symbol: '',
    description: ''
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createSession.mutateAsync(formData)
      setIsCreating(false)
      setFormData({ name: '', playbookId: '', symbol: '', description: '' })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <FeatureGate requiredTier="ELITE">
      <div className="p-6 space-y-8 animate-fade-in max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Manual Backtester</h1>
            <p className="text-[#94A3B8] text-sm mt-1">Accelerate your learning. Test strategies on historical data.</p>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-[#00FF87] hover:bg-[#00E676] text-black font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,135,0.2)]"
          >
            <Plus size={18} /> New Session
          </button>
        </div>

        {/* Elite Banner */}
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/20 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Trophy size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white">Elite Feature Active</h3>
              <p className="text-xs text-purple-200 opacity-80">You have unlimited access to the manual backtesting suite.</p>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-[10px] text-purple-300 uppercase tracking-widest">Total Backtests</p>
                <p className="text-xl font-bold text-white font-num">{sessions?.length || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-purple-300 uppercase tracking-widest">Efficiency</p>
                <p className="text-xl font-bold text-white">High</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active/Recent Sessions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-[#94A3B8] text-xs font-bold uppercase tracking-widest mb-2">
              <History size={14} /> Recent Sessions
            </div>
            
            {isSessionsLoading ? (
              [...Array(3)].map((_, i) => <div key={i} className="h-24 skeleton rounded-2xl" />)
            ) : sessions?.length === 0 ? (
              <Card className="bg-[#1E293B]/20 border-dashed border-2 border-[#1E293B]">
                <CardBody className="py-12 flex flex-col items-center justify-center text-center">
                  <Target size={40} className="text-[#334155] mb-4" />
                  <p className="text-[#64748B] text-sm">No backtest sessions found. Start your first session to see results.</p>
                </CardBody>
              </Card>
            ) : (
              sessions?.map((session: any) => (
                <Link key={session.id} href={`/backtest/${session.id}`}>
                  <Card hover className="group cursor-pointer mb-4">
                    <CardBody className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#1E293B] flex items-center justify-center group-hover:bg-[#00FF87]/10 transition-colors">
                          <Play size={20} className="text-[#00FF87]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white group-hover:text-[#00FF87] transition-colors">
                            {session.name}
                          </h3>
                          <p className="text-xs text-[#64748B] mt-1">
                            {session.symbol} • {session.playbook?.name || 'Untagged'} • {format(new Date(session.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] text-[#64748B] uppercase">Win Rate</p>
                          <p className="text-sm font-bold text-[#00FF87] font-num">{session.winRate || 0}%</p>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] text-[#64748B] uppercase">Net PnL</p>
                          <p className={`text-sm font-bold font-num ${Number(session.netPnl) >= 0 ? 'text-[#00FF87]' : 'text-[#FF4757]'}`}>
                            ${Math.abs(Number(session.netPnl)).toLocaleString()}
                          </p>
                        </div>
                        <ChevronRight size={20} className="text-[#1E293B] group-hover:text-white transition-colors" />
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))
            )}
          </div>

          {/* Info / Tips */}
          <div className="space-y-6">
            <Card className="bg-[#1E293B]/30">
              <CardBody className="p-6">
                <h3 className="font-bold text-white mb-4">Why Backtest?</h3>
                <ul className="space-y-4">
                  {[
                    { title: 'Confidence', desc: 'Know your statistics before risking real capital.' },
                    { title: 'Speed', desc: 'Simulate 100 trades in 1 hour instead of 1 month.' },
                    { title: 'Refinement', desc: 'Find the flaws in your strategy rules early.' }
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00FF87] mt-1.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">{tip.title}</p>
                        <p className="text-[11px] text-[#94A3B8]">{tip.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Create Modal Overlay */}
        {isCreating && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md animate-scale-in">
              <CardBody className="p-8">
                <h2 className="text-xl font-bold text-white mb-6">Start New Backtest</h2>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1.5">Session Name</label>
                    <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. BTC/USD Mean Reversion"
                      className="w-full bg-[#1E293B] border-none text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#00FF87] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1.5">Strategy / Playbook</label>
                    <select 
                      value={formData.playbookId}
                      onChange={e => setFormData({...formData, playbookId: e.target.value})}
                      className="w-full bg-[#1E293B] border-none text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#00FF87] outline-none"
                    >
                      <option value="">Select a Strategy</option>
                      {playbooks?.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1.5">Symbol</label>
                    <input 
                      type="text"
                      value={formData.symbol}
                      onChange={e => setFormData({...formData, symbol: e.target.value})}
                      placeholder="e.g. BTCUSD"
                      className="w-full bg-[#1E293B] border-none text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#00FF87] outline-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="flex-1 px-4 py-3 rounded-xl text-white font-bold text-sm bg-[#1E293B] hover:bg-[#2D3748]"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={createSession.isPending}
                      className="flex-1 px-4 py-3 rounded-xl bg-[#00FF87] text-black font-bold text-sm hover:bg-[#00E676] disabled:opacity-50"
                    >
                      {createSession.isPending ? 'Starting...' : 'Go Live'}
                    </button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </FeatureGate>
  )
}
