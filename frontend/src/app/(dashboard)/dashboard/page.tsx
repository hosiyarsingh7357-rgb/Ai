'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { Card, CardBody } from '@/components/ui/Card'
import { TrendingUp, TrendingDown, BarChart3, BookOpen, Clock } from 'lucide-react'
import { PropFirmWidget } from '@/components/dashboard/PropFirmWidget'
import { useAnalyticsOverview, useEquityCurve } from '@/hooks/useAnalytics'
import { EquityCurve } from '@/components/charts'
import { ChartSkeleton } from '@/components/ui/ChartSkeleton'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const { data: overview, isLoading: loadingOverview } = useAnalyticsOverview()
  const { data: equityData, isLoading: loadingEquity } = useEquityCurve()

  const STATS = [
    {
      label: 'Total Net P&L',
      value: overview ? `$${overview.totalNetPnl.toLocaleString()}` : '$0.00',
      change: 'Lifetime',
      positive: overview ? overview.totalNetPnl >= 0 : true,
      icon: TrendingUp,
      color: '#00FF87',
    },
    {
      label: 'Win Rate',
      value: overview ? `${overview.winRate}%` : '0%',
      change: overview ? `Avg Win: $${overview.avgWin}` : 'N/A',
      positive: true,
      icon: BarChart3,
      color: '#4F9CFB',
    },
    {
      label: 'Profit Factor',
      value: overview ? overview.profitFactor.toString() : '0.00',
      change: overview ? `Avg Loss: $${overview.avgLoss}` : 'N/A',
      positive: overview ? overview.profitFactor >= 1.5 : false,
      icon: TrendingDown,
      color: '#FFD93D',
    },
    {
      label: 'Total Trades',
      value: overview ? overview.totalTrades.toString() : '0',
      change: 'All Accounts',
      positive: true,
      icon: BookOpen,
      color: '#A78BFA',
    },
  ]

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
              <p className="text-[#94A3B8] text-sm mt-1 font-medium italic opacity-80">
                Performance metrics are synchronized across your linked accounts.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STATS.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.label} hover className="animate-fade-in">
                  <CardBody className="flex items-start justify-between p-5">
                    <div>
                      <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em] mb-3 opacity-60">
                        {stat.label}
                      </p>
                      {loadingOverview ? (
                        <div className="h-8 w-24 skeleton bg-white/5 rounded" />
                      ) : (
                        <>
                          <p
                            className="text-2xl font-black font-num"
                            style={{ color: stat.label.includes('P&L') ? (stat.positive ? '#00FF87' : '#FF4757') : 'white' }}
                          >
                            {stat.value}
                          </p>
                          <div className="flex items-center gap-1 mt-1 font-num text-[10px] font-bold opacity-60">
                             <span>{stat.change}</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/[0.05]"
                      style={{ background: `${stat.color}14` }}
                    >
                      <Icon size={18} style={{ color: stat.color }} />
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>

          {/* Equity Chart */}
          <Card className="overflow-hidden bg-white/[0.01] border-white/[0.05]">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                   <p className="text-sm font-bold text-white uppercase tracking-wider opacity-80">Equity Curve</p>
                   <div className="flex gap-2 text-[10px] font-bold">
                    <span className="text-[#00FF87] bg-[#00FF87]/10 px-2 py-1 rounded">REAL-TIME</span>
                  </div>
                </div>
                <div className="flex gap-2">
                   {['7D', '30D', 'ALL'].map(t => (
                     <button key={t} className={`text-[10px] font-bold px-2 py-1 rounded ${t === 'ALL' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}>
                       {t}
                     </button>
                   ))}
                </div>
              </div>
              <div className="chart-container-md relative">
                <Suspense fallback={<ChartSkeleton height={300} />}>
                  <EquityCurve data={equityData || []} />
                </Suspense>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar Widgets */}
        <div className="w-full lg:w-80 space-y-6 optimize-gpu">
          <PropFirmWidget />
          
          <Card className="bg-[#00FF87]/5 border-[#00FF87]/20 border shadow-[0_0_30px_rgba(0,255,135,0.05)]">
            <CardBody className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00FF87]/20 flex items-center justify-center">
                   <div className="w-2 h-2 rounded-full bg-[#00FF87] animate-pulse" />
                </div>
                <p className="text-sm font-bold text-[#00FF87]">Live Connectivity</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Your credentials are encrypted. TradeStation adapter is monitoring executions.
              </p>
            </CardBody>
          </Card>

          {/* Recent Trades mini-list */}
          <Card className="bg-white/[0.02] border-white/[0.05]">
            <CardBody className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Trades</p>
                <Link href="/trades" className="text-[10px] font-bold text-[#00FF87] hover:brightness-125 transition-all cursor-pointer">VIEW LOG</Link>
              </div>
              <div className="space-y-3">
                {(overview?.recentTrades?.length ?? 0) > 0 ? (
                  overview?.recentTrades?.map((t: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-white/[0.02] p-3 rounded-xl border border-white/[0.03] hover:border-[#00FF87]/30 transition-all cursor-pointer">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">{t.symbol}</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">{new Date(t.exitDate).toLocaleDateString()}</span>
                      </div>
                      <span className={cn("text-xs font-num font-bold", t.netPnl > 0 ? "text-[#00FF87]" : "text-red-400")}>
                        {t.netPnl > 0 ? '+' : ''}{t.netPnl.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-500 text-center py-4 italic font-medium">No recent trades to display</p>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
