'use client'

import { usePropFirmStats } from '@/hooks/useAnalytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { Shield, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PropFirmWidget() {
  const { data: stats, isLoading } = usePropFirmStats()

  if (isLoading || !stats) {
    return (
      <Card className="bg-slate-900/50 border-white/[0.06] backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Prop Firm Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const dailyLossPct = Math.min(Math.max((Math.abs(stats.todayPnl) / stats.dailyLossLimit) * 100, 0), 100)
  const ddPct = Math.min(Math.max((stats.currentDrawdown / stats.maxDrawdownLimit) * 100, 0), 100)
  
  const isDailyDanger = dailyLossPct > 80
  const isDDDanger = ddPct > 80

  const statusBreached = stats.todayPnl < -stats.dailyLossLimit || stats.currentDrawdown > stats.maxDrawdownLimit

  return (
    <Card className="bg-slate-900/40 border-white/[0.06] backdrop-blur-2xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 shadow-2xl">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <Shield className={cn("w-4 h-4", statusBreached ? "text-red-400" : "text-emerald-400")} />
            Prop Firm Health
          </CardTitle>
          <span className="text-[10px] bg-white/[0.03] text-slate-500 px-2 py-0.5 rounded-full border border-white/[0.05]">
            {stats.accountName}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Daily Loss */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs mb-1">
            <span className={cn("text-slate-400 transition-colors", isDailyDanger && "text-red-400 font-medium")}>
              Daily Loss Limit
            </span>
            <span className="font-mono text-slate-500">
              ${Math.abs(stats.todayPnl).toLocaleString()} / ${stats.dailyLossLimit.toLocaleString()}
            </span>
          </div>
          <Progress 
            value={dailyLossPct} 
            className="h-1.5 bg-white/[0.03]" 
            indicatorClassName={cn(
              "transition-all duration-500",
              isDailyDanger ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]" : "bg-emerald-500"
            )}
          />
        </div>

        {/* Max Drawdown */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs mb-1">
            <span className={cn("text-slate-400 transition-colors", isDDDanger && "text-red-400 font-medium")}>
              Max Drawdown
            </span>
            <span className="font-mono text-slate-500">
              ${stats.currentDrawdown.toLocaleString()} / ${stats.maxDrawdownLimit.toLocaleString()}
            </span>
          </div>
          <Progress 
            value={ddPct} 
            className="h-1.5 bg-white/[0.03]" 
            indicatorClassName={cn(
              "transition-all duration-500",
              isDDDanger ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]" : "bg-emerald-500"
            )}
          />
        </div>

        {/* Bottom Stats */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <div className="bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.04] group/item hover:bg-white/[0.04] transition-colors">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-0.5">Consistency</p>
            <p className="text-sm font-mono font-bold text-slate-200">{stats.consistencyScore.toFixed(1)}%</p>
          </div>
          <div className={cn(
            "rounded-lg p-2.5 border transition-all duration-300 flex items-center justify-center gap-2",
            statusBreached 
              ? "bg-red-500/10 border-red-500/20 text-red-400" 
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          )}>
            {statusBreached ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Hard Breach</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 shadow-emerald-500/50" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Verified Safe</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
