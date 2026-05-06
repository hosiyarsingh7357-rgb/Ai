'use client'

import { useAiReports } from '@/hooks/useAi'
import { Card, CardTitle, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import Link from 'next/link'
import { Brain, Calendar, ChevronRight, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react'

export default function ReportsPage() {
  const { data: reports, isLoading } = useAiReports()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <Brain className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            AI Performance Intelligence
          </h1>
        </div>
        <p className="text-slate-400 text-lg ml-13">
          Automated weekly performance audits, behavioral pattern detection, and cognitive growth tracking.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-3xl" />
          ))}
        </div>
      ) : reports && reports.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {reports.map((report) => (
            <Link key={report.id} href={`/reports/${report.id}`}>
              <Card className="group hover:border-indigo-500/50 transition-all duration-300 cursor-pointer overflow-hidden h-full">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                </div>
                
                <CardTitle className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  {report.title}
                </CardTitle>
                
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 group-hover:bg-indigo-500/10 transition-colors">
                    <p className="text-slate-300 line-clamp-3 italic text-sm leading-relaxed">
                      "{report.weekSummary}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Top Weakness</span>
                      <div className="flex items-center gap-2 text-rose-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs font-semibold truncate">{report.behavioralAlert || 'No Alert'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Next Focus</span>
                      <div className="flex items-center gap-2 text-emerald-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-semibold truncate">{report.nextWeekFocus}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-sm">
                    <span className="text-slate-500">{new Date(report.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1 text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform">
                      View full audit <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-800/50 flex items-center justify-center border border-slate-700">
            <Sparkles className="w-8 h-8 text-slate-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">No reports generated yet</h2>
            <p className="text-slate-400 max-w-sm">
              Your first AI Performance Audit will be automatically generated this Sunday at midnight based on your week's trades.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
