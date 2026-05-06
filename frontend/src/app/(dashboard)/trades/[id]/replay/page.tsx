'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTradeReplay } from '@/hooks/useTradeReplay';
import { ReplayChart } from '@/components/analytics/ReplayChart';
import { FeatureGate } from '@/components/auth/FeatureGate';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  FastForward,
  Brain,
  Timer,
  AlertCircle
} from 'lucide-react';

export default function TradeReplayPage() {
  const { id } = useParams();
  const router = useRouter();
  const {
    trade,
    currentBars,
    activeInsights,
    isPlaying,
    currentIndex,
    totalBars,
    loading,
    error,
    togglePlay,
    seek,
    setPlaybackSpeed,
    playbackSpeed
  } = useTradeReplay(id as string);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full" />
          <motion.div 
            className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <p className="text-white/60 font-medium animate-pulse">Generating Simulation & AI Insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8">
        <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/20">
          <AlertCircle className="w-12 h-12 text-rose-500" />
        </div>
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-white mb-2">Simulation Failed</h2>
          <p className="text-white/60">{error}</p>
        </div>
        <button 
          onClick={() => router.back()}
          className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <FeatureGate requiredTier="ELITE">
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Trade Replay</h1>
              <p className="text-sm text-white/40">Powered by Gemini 1.5 Flash Simulation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 tracking-wider">ELITE ACTIVE</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Viewport */}
          <div className="lg:col-span-3 space-y-6">
            <ReplayChart data={currentBars} trade={trade} />

            {/* Controls Bar */}
            <div className="p-6 rounded-2xl border border-white/10 bg-[#0B0F1A]/50 backdrop-blur-xl space-y-6">
              <div className="flex items-center gap-6">
                <button 
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                </button>
                
                <button 
                  onClick={() => seek(0)}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <div className="flex-1 space-y-2">
                  <div className="flex justify-between text-[10px] font-mono text-white/40 uppercase tracking-widest">
                    <span>Progress</span>
                    <span>{Math.round((currentIndex / (totalBars - 1)) * 100)}%</span>
                  </div>
                  <input 
                    type="range"
                    min={0}
                    max={totalBars - 1}
                    value={currentIndex}
                    onChange={(e) => seek(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                  <Timer className="w-4 h-4 text-white/40" />
                  <select 
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(parseInt(e.target.value))}
                    className="bg-transparent text-sm font-medium text-white outline-none cursor-pointer"
                  >
                    <option value={2000} className="bg-[#0B0F1A]">0.5x</option>
                    <option value={1000} className="bg-[#0B0F1A]">1.0x</option>
                    <option value={500} className="bg-[#0B0F1A]">2.0x</option>
                    <option value={250} className="bg-[#0B0F1A]">4.0x</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insight Sidebar */}
          <div className="space-y-4">
            <div className="p-4 flex items-center gap-2 text-emerald-400">
              <Brain className="w-5 h-5" />
              <h2 className="font-bold tracking-tight">AI REPLAY FEED</h2>
            </div>
            
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {[...activeInsights].reverse().map((insight, idx) => (
                  <motion.div
                    key={insight.timestamp + insight.type}
                    initial={{ opacity: 0, x: 20, y: 10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    className="group relative p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                        insight.type === 'execution' ? 'bg-blue-400' :
                        insight.type === 'exit' ? 'bg-rose-400' :
                        insight.type === 'setup' ? 'bg-emerald-400' : 'bg-amber-400'
                      }`} />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-white/20">
                            {new Date(insight.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            insight.type === 'execution' ? 'bg-blue-500/10 text-blue-400' :
                            insight.type === 'exit' ? 'bg-rose-500/10 text-rose-400' :
                            insight.type === 'setup' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {insight.type}
                          </span>
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed">
                          {insight.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {activeInsights.length === 0 && (
                <div className="py-20 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                    <Play className="w-4 h-4 text-white/20" />
                  </div>
                  <p className="text-xs text-white/30 uppercase tracking-widest font-medium">Start Playback</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}
