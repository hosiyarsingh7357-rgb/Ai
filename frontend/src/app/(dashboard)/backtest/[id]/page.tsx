'use client'

import React, { useState } from 'react'
import { Card, CardBody } from '@/components/ui/Card'
import { Plus, ArrowLeft, Trophy, Target, TrendingUp, DollarSign, Activity } from 'lucide-react'
import { useBacktestDetails, useAddBacktestTrade } from '@/hooks/useBacktest'
import { format } from 'date-fns'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function BacktestDetailPage() {
  const params = useParams()
  const sessionId = params.id as string
  const { data: session, isLoading } = useBacktestDetails(sessionId)
  const addTrade = useAddBacktestTrade(sessionId)
  
  const [isAddingTrade, setIsAddingTrade] = useState(false)
  const [formData, setFormData] = useState({
    entryPrice: '',
    exitPrice: '',
    size: '',
    side: 'LONG',
    setup: '',
    pnl: '',
    isWin: true,
    notes: ''
  })

  const handleAddTrade = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addTrade.mutateAsync({
        ...formData,
        entryPrice: Number(formData.entryPrice),
        exitPrice: Number(formData.exitPrice),
        size: Number(formData.size),
        pnl: Number(formData.pnl)
      })
      setIsAddingTrade(false)
      setFormData({ entryPrice: '', exitPrice: '', size: '', side: 'LONG', setup: '', pnl: '', isWin: true, notes: '' })
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading) return <div className="p-6 text-center text-[#64748B]">Loading session...</div>
  if (!session) return <div className="p-6 text-center text-[#FF4757]">Session not found</div>

  return (
    <div className="p-6 space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/backtest" className="w-10 h-10 rounded-xl bg-[#1E293B] flex items-center justify-center text-white hover:bg-[#2D3748] transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{session.name}</h1>
            <p className="text-[#94A3B8] text-sm mt-1">{session.symbol} • {session.playbook?.name || 'Manual Practice'}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAddingTrade(true)}
          className="bg-[#00FF87] hover:bg-[#00E676] text-black font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,135,0.2)]"
        >
          <Plus size={18} /> Add Trade
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Win Rate', value: `${session.winRate || 0}%`, icon: Trophy, color: 'text-[#00FF87]' },
          { label: 'Total Trades', value: session.trades?.length || 0, icon: Activity, color: 'text-blue-400' },
          { label: 'Net PnL', value: `$${Number(session.netPnl || 0).toLocaleString()}`, icon: DollarSign, color: Number(session.netPnl) >= 0 ? 'text-[#00FF87]' : 'text-[#FF4757]' },
          { label: 'Profit Factor', value: '1.85', icon: TrendingUp, color: 'text-purple-400' }
        ].map((stat, i) => (
          <Card key={i} className="bg-[#1E293B]/20 border-[#1E293B]/50 hover:border-[#334155]">
            <CardBody className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg bg-[#1E293B] flex items-center justify-center ${stat.color} bg-opacity-10`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">{stat.label}</p>
                <p className={`text-lg font-bold font-num ${stat.color}`}>{stat.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Trades Table */}
        <Card className="overflow-hidden border-[#1E293B]">
          <div className="bg-[#1E293B]/40 px-6 py-4 border-b border-[#334155]">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Execution Log</h3>
          </div>
          <CardBody className="p-0 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#1E293B]/20 text-[#64748B] text-[10px] items-center uppercase font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Side</th>
                  <th className="px-6 py-4 text-right">Entry</th>
                  <th className="px-6 py-4 text-right">Exit</th>
                  <th className="px-6 py-4 text-right">PnL</th>
                  <th className="px-6 py-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {session.trades?.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-[#64748B] text-sm">
                            No trades entered yet. Click "Add Trade" to begin your practice.
                        </td>
                    </tr>
                ) : (
                    session.trades?.map((trade: any) => (
                    <tr key={trade.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest ${trade.isWin ? 'bg-[#00FF87]/10 text-[#00FF87]' : 'bg-[#FF4757]/10 text-[#FF4757]'}`}>
                            {trade.isWin ? 'WINNER' : 'LOSS'}
                        </span>
                        </td>
                        <td className="px-6 py-4">
                        <span className={`text-[11px] font-bold ${trade.side === 'LONG' ? 'text-blue-400' : 'text-orange-400'}`}>
                            {trade.side}
                        </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-white font-num">${Number(trade.entryPrice).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-sm text-white font-num">${Number(trade.exitPrice).toLocaleString()}</td>
                        <td className={`px-6 py-4 text-right text-sm font-bold font-num ${trade.isWin ? 'text-[#00FF87]' : 'text-[#FF4757]'}`}>
                        {trade.isWin ? '+' : ''}${Math.abs(Number(trade.pnl)).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-xs text-[#94A3B8] max-w-xs truncate">{trade.notes || '-'}</td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>

      {/* Add Trade Modal Overlay */}
      {isAddingTrade && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl animate-scale-in">
            <CardBody className="p-8">
              <h2 className="text-xl font-bold text-white mb-6">Log Backtest Execution</h2>
              <form onSubmit={handleAddTrade} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1.5">Side</label>
                    <select 
                      value={formData.side}
                      onChange={e => setFormData({...formData, side: e.target.value})}
                      className="w-full bg-[#1E293B] border-none text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#00FF87] outline-none"
                    >
                      <option value="LONG">Long</option>
                      <option value="SHORT">Short</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1.5">Result</label>
                    <select 
                      value={formData.isWin ? 'win' : 'loss'}
                      onChange={e => setFormData({...formData, isWin: e.target.value === 'win'})}
                      className="w-full bg-[#1E293B] border-none text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#00FF87] outline-none"
                    >
                      <option value="win">Winner</option>
                      <option value="loss">Loss</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1.5">Entry Price</label>
                    <input 
                      required
                      type="number"
                      step="any"
                      value={formData.entryPrice}
                      onChange={e => setFormData({...formData, entryPrice: e.target.value})}
                      className="w-full bg-[#1E293B] border-none text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#00FF87] outline-none font-num"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1.5">Exit Price</label>
                    <input 
                      required
                      type="number"
                      step="any"
                      value={formData.exitPrice}
                      onChange={e => setFormData({...formData, exitPrice: e.target.value})}
                      className="w-full bg-[#1E293B] border-none text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#00FF87] outline-none font-num"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1.5">Net PnL ($)</label>
                    <input 
                      required
                      type="number"
                      step="any"
                      value={formData.pnl}
                      onChange={e => setFormData({...formData, pnl: e.target.value})}
                      className="w-full bg-[#1E293B] border-none text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#00FF87] outline-none font-num"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1.5">Setup / Trigger</label>
                    <input 
                      type="text"
                      value={formData.setup}
                      onChange={e => setFormData({...formData, setup: e.target.value})}
                      placeholder="e.g. Bullish Engulfing"
                      className="w-full bg-[#1E293B] border-none text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#00FF87] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1.5">Notes</label>
                  <textarea 
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    placeholder="Describe the trade context..."
                    className="w-full bg-[#1E293B] border-none text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#00FF87] outline-none h-24 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddingTrade(false)}
                    className="flex-1 px-4 py-3 rounded-xl text-white font-bold text-sm bg-[#1E293B] hover:bg-[#2D3748]"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={addTrade.isPending}
                    className="flex-1 px-4 py-3 rounded-xl bg-[#00FF87] text-black font-bold text-sm hover:bg-[#00E676] disabled:opacity-50"
                  >
                    {addTrade.isPending ? 'Logging...' : 'Save Trade'}
                  </button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}
