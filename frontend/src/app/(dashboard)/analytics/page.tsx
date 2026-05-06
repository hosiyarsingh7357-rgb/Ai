'use client'

import { useAnalyticsOverview, useEquityCurve, usePerformanceStats, useWeeklyReport, useRiskMetrics } from '@/hooks/useAnalytics'
import { Card } from '@/components/ui/Card'
import { 
  EquityCurve, 
  PnlBySetupChart, 
  WinRateBySymbolChart, 
  PsychologyChart, 
  TemporalAnalysisChart 
} from '@/components/charts'
import { ChartSkeleton } from '@/components/ui/ChartSkeleton'
import { Skeleton } from '@/components/ui/Skeleton'
import { Suspense } from 'react'
import { TrendingUp, Target, Activity, BarChart3, Sparkles, AlertCircle } from 'lucide-react'

export default function AnalyticsPage() {
  const { data: overview, isLoading: isOverviewLoading } = useAnalyticsOverview()
  const { data: equityData, isLoading: isCurveLoading } = useEquityCurve()
  const { data: perfStats, isLoading: isPerfLoading } = usePerformanceStats()
  const { data: riskMetrics, isLoading: isRiskLoading } = useRiskMetrics()
  const { data: aiReport, isLoading: isAiLoading } = useWeeklyReport()

  const stats = [
    { 
      label: 'Net Profit', 
      value: overview ? `$${overview.totalNetPnl}` : null, 
      isLoading: isOverviewLoading,
      icon: TrendingUp, 
      color: 'text-emerald-500' 
    },
    { 
      label: 'Win Rate', 
      value: overview ? `${overview.winRate}%` : null, 
      isLoading: isOverviewLoading,
      icon: Target, 
      color: 'text-blue-500' 
    },
    { 
      label: 'Profit Factor', 
      value: overview?.profitFactor || null, 
      isLoading: isOverviewLoading,
      icon: Activity, 
      color: 'text-purple-500' 
    },
    { 
      label: 'Max Drawdown', 
      value: riskMetrics ? `$${riskMetrics.maxDrawdown}` : null, 
      isLoading: isRiskLoading,
      icon: AlertCircle, 
      color: 'text-rose-500' 
    },
  ]

  return (
    <div className="p-8 space-y-8 animate-fade-in optimize-gpu">
      <div className="flex justify-between items-center">
        <div className="header">
          <h1 className="text-3xl font-bold tracking-tight">Performance Analytics</h1>
          <p className="text-zinc-400 mt-1">Hedge-fund grade metrics for your trading edge.</p>
        </div>
        <div className="flex gap-3">
           <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
             Export CSV
           </button>
           <button className="px-4 py-2 bg-[#00FF87] text-[#001D00] rounded-lg text-sm font-bold hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,255,135,0.2)]">
             Share Report
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                {stat.isLoading ? (
                  <Skeleton className="h-8 w-24 mt-1 bg-white/10" />
                ) : (
                  <p className="text-2xl font-bold mt-0.5">{stat.value || '0'}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Equity Curve */}
        <Card className="lg:col-span-2 p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <TrendingUp className="w-24 h-24 text-[#00FF87]" />
          </div>
          <div className="mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              Equity Curve
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">LIVE</span>
            </h3>
            <p className="text-sm text-zinc-500">Cumulative P&L growth over time.</p>
          </div>
          <div className="chart-container-lg">
            {isCurveLoading ? (
              <ChartSkeleton height={350} />
            ) : (
              <EquityCurve data={equityData || []} showXAxis />
            )}
          </div>
        </Card>

        {/* AI Performance Insight */}
        <Card className="p-8 flex flex-col border-[#00FF87]/20 bg-gradient-to-b from-[#161B26] to-[#0D121D]">
          <div className="flex items-center gap-2 text-amber-500 mb-4">
             <Sparkles className="w-5 h-5" />
             <span className="text-sm font-bold uppercase tracking-widest">AI Weekly Insight</span>
          </div>
          
          {isAiLoading ? (
            <div className="space-y-6 flex-1">
               <Skeleton className="h-20 w-full bg-white/5" />
               <Skeleton className="h-16 w-full bg-white/5" />
               <Skeleton className="h-16 w-full bg-white/5" />
            </div>
          ) : aiReport?.performanceOverview ? (
            <div className="space-y-6 flex-1">
              <div>
                <p className="text-zinc-300 leading-relaxed text-sm">
                  {aiReport.performanceOverview}
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <p className="text-[10px] text-emerald-500 font-bold uppercase mb-1">Trade of the Week</p>
                <p className="text-xs text-zinc-100">{aiReport.tradeOfTheWeek}</p>
              </div>

              <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                <p className="text-[10px] text-orange-500 font-bold uppercase mb-1">Focus for Next Week</p>
                <p className="text-xs text-zinc-100">{aiReport.nextWeekFocus}</p>
              </div>
            </div>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                   <AlertCircle className="w-6 h-6 text-zinc-500" />
                </div>
                <p className="text-sm text-zinc-500">Not enough data for this week's AI analysis.</p>
             </div>
          )}
          
          <button className="w-full mt-6 py-3 rounded-lg bg-zinc-800 text-zinc-100 text-sm font-bold hover:bg-zinc-700 transition-colors">
            View Full AI Report
          </button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* P&L by Setup */}
        <Card className="p-8">
           <div className="mb-8 flex justify-between items-end">
              <div>
                <h3 className="text-xl font-bold">P&L by Setup</h3>
                <p className="text-sm text-zinc-500">Which strategy is driving your growth?</p>
              </div>
           </div>
           <div className="chart-container-md">
              {isPerfLoading ? (
                <ChartSkeleton height={300} />
              ) : (
                <PnlBySetupChart data={perfStats?.bySetup || []} />
              )}
           </div>
        </Card>

        {/* Win Rate by Symbol */}
        <Card className="p-8">
           <div className="mb-8 flex justify-between items-end">
              <div>
                <h3 className="text-xl font-bold">Win Rate by Symbol</h3>
                <p className="text-sm text-zinc-500">Instrument specific performance accuracy.</p>
              </div>
           </div>
           <div className="chart-container-md">
              {isPerfLoading ? (
                <ChartSkeleton height={300} />
              ) : (
                <WinRateBySymbolChart data={perfStats?.bySymbol || []} />
              )}
           </div>
        </Card>
      </div>

      {/* Temporal Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* P&L by Day */}
        <Card className="p-8">
           <div className="mb-8">
              <h3 className="text-xl font-bold">P&L by Day of Week</h3>
              <p className="text-sm text-zinc-500">Identify your most profitable days.</p>
           </div>
           <div className="chart-container-md">
              {isPerfLoading ? (
                <ChartSkeleton height={300} />
              ) : (
                <TemporalAnalysisChart data={perfStats?.byDay || []} />
              )}
           </div>
        </Card>

        {/* P&L by Session */}
        <Card className="p-8">
           <div className="mb-8">
              <h3 className="text-xl font-bold">Market Session Alpha</h3>
              <p className="text-sm text-zinc-500">London vs New York vs Asian session edge.</p>
           </div>
           <div className="chart-container-md">
              {isPerfLoading ? (
                <ChartSkeleton height={300} />
              ) : (
                <TemporalAnalysisChart data={perfStats?.bySession || []} type="session" />
              )}
           </div>
        </Card>
      </div>

      {/* Psychology Analysis */}
      <Card className="p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">The Human Element</h3>
            <p className="text-sm text-zinc-500">Relationship between your pre-trade emotion and final P&L.</p>
          </div>
          <div className="flex gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 bg-white/5 px-2 py-1 rounded">
              <div className="w-2 h-2 rounded-full bg-[#00FF87]" /> PROFITABLE
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 bg-white/5 px-2 py-1 rounded">
              <div className="w-2 h-2 rounded-full bg-[#FF4D4D]" /> LOSS
            </span>
          </div>
        </div>
        <div className="chart-container-md">
          {isPerfLoading ? (
            <ChartSkeleton height={350} />
          ) : (
            <PsychologyChart data={perfStats?.byEmotion || []} />
          )}
        </div>
      </Card>
    </div>
  )
}
