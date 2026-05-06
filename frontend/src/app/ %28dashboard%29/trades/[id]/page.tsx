'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTrade } from '@/hooks/useTrades'
import { Card, CardBody } from '@/components/ui/Card'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  BrainCircuit, 
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function TradeDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: trade, isLoading, error } = useTrade(id as string)

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 skeleton rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 skeleton rounded-2xl" />
            <div className="h-96 skeleton rounded-2xl" />
          </div>
          <div className="h-96 skeleton rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error || !trade) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle size={48} className="text-[#FF4757] mb-4" />
        <h2 className="text-xl font-bold text-white">Trade not found</h2>
        <p className="text-[#94A3B8] mt-2 text-center max-w-md">
          The trade you are looking for doesn&apos;t exist or you don&apos;t have permission to view it.
        </p>
        <button 
          onClick={() => router.back()}
          className="mt-6 text-[#00FF87] flex items-center gap-2 hover:underline"
        >
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    )
  }

  const isWin = Number(trade.netPnl) >= 0
  const aiAnalysis = trade.aiAnalysis as any

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="text-[#94A3B8] hover:text-white flex items-center gap-2 transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back to Journal
        </button>
        <div className="flex items-center gap-3">
          <button className="text-xs bg-[#1E293B] text-white px-4 py-2 rounded-xl hover:bg-[#2D3748] transition-all">
            Edit Trade
          </button>
          <button className="text-xs bg-[#FF4757]/10 text-[#FF4757] px-4 py-2 rounded-xl hover:bg-[#FF4757]/20 transition-all border border-[#FF4757]/20">
            Delete
          </button>
        </div>
      </div>

      {/* Main Stats Header */}
      <Card className="overflow-hidden border-l-4" style={{ borderColor: isWin ? '#00FF87' : '#FF4757' }}>
        <CardBody className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#1E293B]">
            <div className="p-6">
              <p className="text-[10px] text-[#94A3B8] uppercase tracking-widest mb-1">Asset</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white">{trade.symbol}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  trade.direction === 'long' ? 'bg-[#00FF87]/10 text-[#00FF87]' : 'bg-[#FF4757]/10 text-[#FF4757]'
                }`}>
                  {trade.direction}
                </span>
              </div>
            </div>
            <div className="p-6">
              <p className="text-[10px] text-[#94A3B8] uppercase tracking-widest mb-1">Net P&L</p>
              <span className={`text-2xl font-bold font-num ${isWin ? 'text-[#00FF87]' : 'text-[#FF4757]'}`}>
                {isWin ? '+' : ''}${Math.abs(Number(trade.netPnl)).toLocaleString()}
              </span>
            </div>
            <div className="p-6">
              <p className="text-[10px] text-[#94A3B8] uppercase tracking-widest mb-1">Date & Time</p>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-white font-num text-sm">
                  <Calendar size={14} className="text-[#64748B]" />
                  {format(new Date(trade.entryDate), 'MMM dd, yyyy')}
                </div>
                <div className="flex items-center gap-2 text-[#94A3B8] font-num text-[11px] mt-1">
                  <Clock size={14} className="text-[#64748B]" />
                  {format(new Date(trade.entryDate), 'HH:mm:ss')}
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-[10px] text-[#94A3B8] uppercase tracking-widest mb-1">Status</p>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[#00FF87]" />
                <span className="text-white font-bold capitalize">{trade.status}</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI & Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Analysis Section */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BrainCircuit size={80} />
            </div>
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <BrainCircuit size={20} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Analysis</h3>
                  <p className="text-xs text-[#94A3B8]">Gemini-powered technical & psychological review</p>
                </div>
              </div>

              {aiAnalysis ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="p-4 bg-[#1E293B]/50 rounded-2xl border border-[#1E293B]">
                    <p className="text-white text-sm leading-relaxed italic">
                      &quot;{aiAnalysis.summary}&quot;
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest flex items-center gap-2 mb-2">
                          <TrendingUp size={12} className="text-[#00FF87]" /> Technical Insights
                        </h4>
                        <p className="text-sm text-[#CBD5E1] leading-relaxed">
                          {aiAnalysis.technicalFeedback}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest flex items-center gap-2 mb-2">
                          <MessageSquare size={12} className="text-blue-400" /> Risk Management
                        </h4>
                        <p className="text-sm text-[#CBD5E1] leading-relaxed">
                          {aiAnalysis.riskFeedback}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest flex items-center gap-2 mb-2">
                          <BrainCircuit size={12} className="text-purple-400" /> Psychological Review
                        </h4>
                        <p className="text-sm text-[#CBD5E1] leading-relaxed">
                          {aiAnalysis.psychologicalFeedback}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/10">
                        <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Key Takeaway</h4>
                        <p className="text-xs text-purple-200 font-medium">{aiAnalysis.keyTakeaway}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <p className="text-[#64748B] italic">No AI analysis available yet for this trade.</p>
                  <button className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-lg text-sm">
                    Generate AI Insight (Pro)
                  </button>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Trade Legs / Execution Log */}
          <Card>
            <CardBody className="p-8">
              <h3 className="text-lg font-bold text-white mb-6">Execution Log</h3>
              <div className="space-y-4">
                {trade.legs?.map((leg: any, idx: number) => (
                  <div key={leg.id} className="flex items-center justify-between p-4 bg-[#1E293B]/30 rounded-2xl border border-[#1E293B]/50">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black uppercase ${
                        leg.action === 'buy' ? 'bg-[#00FF87]/20 text-[#00FF87]' : 'bg-[#FF4757]/20 text-[#FF4757]'
                      }`}>
                        {leg.action.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{leg.action.toUpperCase()} {leg.quantity} @ ${leg.price}</p>
                        <p className="text-[10px] text-[#64748B] font-num">{format(new Date(leg.executedAt), 'HH:mm:ss')}</p>
                      </div>
                    </div>
                    {leg.commission > 0 && (
                      <span className="text-[11px] text-[#64748B]">Fee: ${leg.commission}</span>
                    )}
                  </div>
                ))}
                {(!trade.legs || trade.legs.length === 0) && (
                  <div className="py-6 text-center text-[#64748B] italic text-sm">
                    Single entry trade (no detailed legs imported).
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Execution Details & Screenshots */}
        <div className="space-y-6">
          <Card>
            <CardBody className="p-8">
              <h3 className="text-sm font-bold text-[#94A3B8] uppercase tracking-widest mb-6">Execution Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#64748B]">Entry Price</span>
                  <span className="text-white font-num font-medium">${Number(trade.entryPrice).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-sm">
                  <span className="text-[#64748B]">Exit Price</span>
                  <span className="text-white font-num font-medium">${Number(trade.exitPrice).toLocaleString()}</span>
                </div>
                <div className="h-px bg-[#1E293B] my-2" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#64748B]">Quantity</span>
                  <span className="text-white font-num font-medium">{trade.quantity}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#64748B]">Asset Class</span>
                  <span className="text-white font-medium capitalize">{trade.assetClass}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#64748B]">Strategy/Setup</span>
                  <span className="text-[#00FF87] font-medium">{trade.setupType || 'Untagged'}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-8">
              <h3 className="text-sm font-bold text-[#94A3B8] uppercase tracking-widest mb-6">Screenshots</h3>
              <div className="grid grid-cols-1 gap-4">
                {trade.screenshots?.map((screenshot: any) => (
                  <div key={screenshot.id} className="relative aspect-video rounded-xl overflow-hidden group cursor-zoom-in">
                    <img src={screenshot.url} alt="Trade Screenshot" className="object-cover w-full h-full transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ImageIcon className="text-white" />
                    </div>
                  </div>
                ))}
                {(!trade.screenshots || trade.screenshots.length === 0) && (
                  <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-[#1E293B] rounded-2xl text-[#64748B]">
                    <ImageIcon size={32} className="mb-2 opacity-50" />
                    <span className="text-xs">No screenshots uploaded</span>
                    <button className="text-[10px] text-[#00FF87] mt-2 hover:underline">Upload Chart</button>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-[#1E293B] to-[#0F172A]">
            <CardBody className="p-8">
              <h3 className="text-sm font-bold text-[#94A3B8] uppercase tracking-widest mb-4">Trading Psychology</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-[#64748B] uppercase tracking-widest mb-1">Emotion at Entry</p>
                  <span className="text-sm text-white font-medium capitalize">
                    {trade.emotionalStateEntry || 'Not recorded'}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-[#64748B] uppercase tracking-widest mb-1">Emotion at Exit</p>
                  <span className="text-sm text-white font-medium capitalize">
                    {trade.emotionalStateExit || 'Not recorded'}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
