'use client'

import { useSyncErrors } from '@/hooks/useSyncErrors'
import { m, AnimatePresence } from 'framer-motion'
import { AlertTriangle, RefreshCw, X, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'

export function ConflictAlert() {
  const { errors, resolveError, retryError } = useSyncErrors()
  const [isExpanded, setIsExpanded] = useState(false)

  if (errors.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3 max-w-md w-full px-4 md:px-0">
      <AnimatePresence>
        {!isExpanded ? (
          <m.button
            layoutId="conflict-alert"
            onClick={() => setIsExpanded(true)}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="flex items-center gap-3 px-4 py-3 bg-rose-500 text-white rounded-2xl shadow-[0_10px_30px_rgba(244,63,94,0.3)] hover:brightness-110 transition-all group"
          >
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <span className="font-bold text-sm tracking-wide">
              {errors.length} Sync Conflict{errors.length > 1 ? 's' : ''}
            </span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </m.button>
        ) : (
          <m.div
            layoutId="conflict-alert"
            className="w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="bg-[#1A1F2B] border-rose-500/50 shadow-2xl overflow-hidden">
              <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-500">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Sync Conflicts</span>
                </div>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-white/5 rounded-md transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-500" />
                </button>
              </div>
              
              <div className="max-h-64 overflow-y-auto p-2 space-y-2">
                {errors.map((err) => (
                  <div 
                    key={err.id}
                    className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2 group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-zinc-200">{err.data?.symbol || 'Unknown Trade'}</p>
                        <p className="text-[10px] text-rose-400 mt-0.5">{err.error}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => retryError(err)}
                          className="p-1.5 hover:bg-emerald-500/20 rounded-lg text-emerald-500 transition-colors"
                          title="Retry Sync"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => resolveError(err.id)}
                          className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-500 transition-colors"
                          title="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-3 bg-white/[0.02] text-center border-t border-white/5">
                <button className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest transition-colors">
                  Resolve All Conflicts
                </button>
              </div>
            </Card>
          </m.div>
        )
        }
      </AnimatePresence>
    </div>
  )
}
