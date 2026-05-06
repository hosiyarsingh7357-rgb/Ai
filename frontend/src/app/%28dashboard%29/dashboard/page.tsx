'use client'

import { Card, CardBody } from '@/components/ui/Card'
import { TrendingUp, TrendingDown, BarChart3, BookOpen, ExternalLink } from 'lucide-react'
import { useAnalyticsOverview, useEquityCurve } from '@/hooks/useAnalytics'
import { useTrades } from '@/hooks/useTrades'
import { EquityCurve } from '@/components/dashboard/EquityCurve'
import Link from 'next/link'
import { format } from 'date-fns'

export default function DashboardPage() {
  const { data: overview, isLoading: isOverviewLoading } = useAnalyticsOverview()
  const { data: equityData, isLoading: isEquityLoading } = useEquityCurve()
  const { data: recentTrades, isLoading: isTradesLoading } = useTrades({ limit: 5 })

  const stats = [
    {
      label: 'Total Net P&L',
      value: overview?.totalNetPnl !== undefined ? `$${overview.totalNetPnl.toLocaleString()}` : '$0.00',
      positive: (overview?.totalNetPnl ?? 0) >= 0,
      icon: TrendingUp,
      color: '#00FF87',
      loading: isOverviewLoading,
    },
    {
      label: 'Win Rate',
      value: overview?.winRate !== undefined ? `${overview.winRate}%` : '0%',
      positive: (overview?.winRate ?? 0) >= 50,
      icon: BarChart3,
      color: '#4F9CFB',
      loading: isOverviewLoading,
    },
    {
      label: 'Profit Factor',
      value: overview?.profitFactor !== undefined ? overview.profitFactor.toString() : '0.00',
      positive: (overview?.profitFactor ?? 0) >= 1,
      icon: TrendingDown,
      color: '#FFD93D',
      loading: isOverviewLoading,
    },
    {
      label: 'Total Trades',
      value: overview?.totalTrades !== undefined ? overview.totalTrades.toString() : '0',
      positive: true,
      icon: BookOpen,
      color: '#A78BFA',
      loading: isOverviewLoading,
    },
  ]

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-[#94A3B8] text-sm mt-1">Real-time performance analytics and trade history.</p>
        </div>
        <Link href="/trades/new">
          <button className="bg-[#00FF87] hover:bg-[#00E676] text-black font-semibold px-4 py-2 rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,135,0.2)] flex items-center gap-2 text-sm">
            Add New Trade
          </button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} hover className="animate-fade-in">
              <CardBody className="flex items-start justify-between p-5">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                    {stat.label}
                  </p>
                  {stat.loading ? (
                    <div className="h-8 w-24 skeleton rounded" />
                  ) : (
                    <p
                      className="text-2xl font-bold font-num"
                      style={{ color: stat.positive ? '#00FF87' : '#FF4757' }}
                    >
                      {stat.value}
                    </p>
                  )}
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${stat.color}14` }}
                >
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 min-h-[400px]">
          <CardBody className="h-full flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Equity Curve</h3>
              <select className="bg-[#1E293B] border-none text-[#94A3B8] text-xs rounded-lg px-2 py-1 outline-none">
                <option>Last 30 Days</option>
                <option>All Time</option>
              </select>
            </div>
            {isEquityLoading ? (
              <div className="flex-1 skeleton rounded-xl" />
            ) : (
              <div className="flex-1">
                <EquityCurve data={equityData || []} />
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Performance Details</h3>
            <div className="space-y-6">
              {[
                { label: 'Average Win', value: overview?.avgWin ?? 0, color: '#00FF87' },
                { label: 'Average Loss', value: overview?.avgLoss ?? 0, color: '#FF4757' },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#94A3B8]">{item.label}</span>
                    <span className="text-white font-num">${item.value}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1E293B] rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-1000" 
                      style={{ 
                        width: '100%', 
                        background: item.color,
                        opacity: 0.8
                      }} 
                    />
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t border-[#1E293B]">
                <p className="text-[10px] text-[#64748B] leading-relaxed italic">
                  &quot;Your win rate is {overview?.winRate}% — consider tightening your stop losses to improve profit factor.&quot;
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Trades Table */}
      <Card>
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Recent Closed Trades</h3>
            <Link href="/trades" className="text-xs text-[#00FF87] flex items-center gap-1 hover:underline">
              View Journal <ExternalLink size={12} />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[#64748B] text-[10px] uppercase tracking-widest border-b border-[#1E293B]">
                  <th className="pb-3 px-2 font-medium">Symbol</th>
                  <th className="pb-3 px-2 font-medium">Side</th>
                  <th className="pb-3 px-2 font-medium">Entry Date</th>
                  <th className="pb-3 px-2 font-medium">Net P&L</th>
                  <th className="pb-3 px-2 font-medium">Setup</th>
                  <th className="pb-3 px-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {isTradesLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="border-b border-[#1E293B]/50 last:border-none">
                      <td colSpan={6} className="py-4"><div className="h-8 w-full skeleton rounded-lg" /></td>
                    </tr>
                  ))
                ) : (
                  recentTrades?.map((trade: any) => (
                    <tr key={trade.id} className="border-b border-[#1E293B]/50 last:border-none hover:bg-[#1E293B]/20 transition-colors group">
                      <td className="py-4 px-2 font-bold text-white">{trade.symbol}</td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          trade.direction === 'long' ? 'bg-[#00FF87]/10 text-[#00FF87]' : 'bg-[#FF4757]/10 text-[#FF4757]'
                        }`}>
                          {trade.direction}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-[#94A3B8] font-num">
                        {format(new Date(trade.entryDate), 'MMM dd, HH:mm')}
                      </td>
                      <td className={`py-4 px-2 font-bold font-num ${
                        Number(trade.netPnl) >= 0 ? 'text-[#00FF87]' : 'text-[#FF4757]'
                      }`}>
                        {Number(trade.netPnl) >= 0 ? '+' : ''}${Math.abs(Number(trade.netPnl)).toLocaleString()}
                      </td>
                      <td className="py-4 px-2 text-[#94A3B8] italic">{trade.setupType || 'No Setup'}</td>
                      <td className="py-4 px-2 text-right">
                        <Link href={`/trades/${trade.id}`} className="text-[#64748B] hover:text-white transition-colors">
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
                {!isTradesLoading && (!recentTrades || recentTrades.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#64748B] italic">
                      No trades found. Start by importing or adding a trade.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
