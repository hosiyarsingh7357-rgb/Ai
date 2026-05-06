'use client'

import { useAiReport } from '@/hooks/useAi'
import { Card, CardTitle, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Brain, Sparkles, TrendingUp, AlertTriangle, Target, Zap, LayoutDashboard, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function ReportDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: report, isLoading } = useAiReport(id as string)

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[600px] w-full rounded-3xl" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Report not found</h2>
        <Link href="/reports" className="text-indigo-400">Back to Reports</Link>
      </div>
    )
  }

  const fullContent = JSON.parse(report.fullContent)

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-slate-500 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-medium">Back to reports</span>
        </button>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest leading-none">
            {report.geminiModel === 'gemini-1.5-pro' ? 'Elite AI Analyst' : 'Pro AI Analyst'}
          </span>
        </div>
      </div>

      {/* Main Report Card */}
      <div className="relative">
        {/* Decorative elements */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10" />

        <Card className="border-indigo-500/30 backdrop-blur-xl bg-slate-900/60 p-0 overflow-hidden">
          <div className="p-8 md:p-12 space-y-12">
            
            {/* Title & Date */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-indigo-400">
                <Brain className="w-8 h-8" />
                <span className="text-sm font-bold tracking-[0.2em] uppercase">Intelligence Audit</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                {report.title}
              </h1>
              <div className="flex items-center gap-6 text-slate-500 font-medium pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(report.periodStart).toLocaleDateString()} — {new Date(report.periodEnd).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Performance Overview */}
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold text-slate-100">Executive Summary</h2>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-light italic">
                  "{report.weekSummary}"
                </p>
              </div>
            </section>

            {/* Grid of details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
              
              {/* Pattern Detection */}
              <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/20 space-y-4">
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-bold uppercase tracking-wider text-sm">Pattern Detection</h3>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {report.behavioralAlert || 'No negative recursive patterns detected this week. Execution was consistent.'}
                </p>
              </div>

              {/* Trade of the Week */}
              <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 space-y-4">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Target className="w-5 h-5" />
                  <h3 className="font-bold uppercase tracking-wider text-sm">Strategic Highlight</h3>
                </div>
                <div className="font-medium text-white">Best Trade:</div>
                <p className="text-slate-300 leading-relaxed">
                  {report.bestSetup}
                </p>
              </div>
            </div>

            {/* Actionable Focus */}
            <section className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
              <Zap className="absolute top-4 right-4 w-12 h-12 text-white/10 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2 text-white/90">
                  <TrendingUp className="w-6 h-6" />
                  <h3 className="text-lg font-bold uppercase tracking-widest">Next Week's Objective</h3>
                </div>
                <p className="text-xl md:text-2xl font-bold text-white leading-snug">
                  {report.nextWeekFocus}
                </p>
              </div>
            </section>

          </div>
        </Card>
      </div>

      <div className="text-center pb-12">
        <p className="text-slate-500 text-sm">
          This report was generated by the Trade Journal AI Engine using {report.geminiModel}. 
          Insights are provided for educational purposes and should not be considered financial advice.
        </p>
      </div>
    </div>
  )
}
