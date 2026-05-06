'use client'
import { Sidebar } from '@/components/layout/Sidebar'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useTradeUpdates } from '@/hooks/useTradeUpdates'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import { m, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { ConflictAlert } from '@/components/offline/ConflictAlert'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isSyncing } = useOfflineSync()
  const { user } = useRequireAuth()
  useTradeUpdates()

  if (!user) return <div className="h-screen w-screen bg-[#0D0F14]" />

  return (
    <LazyMotion features={domAnimation}>
      <div className="flex h-screen overflow-hidden bg-[#0D0F14]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            {isSyncing && (
              <m.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full backdrop-blur-md shadow-lg"
              >
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                <span className="text-xs font-medium text-emerald-400 tracking-wide uppercase">Syncing Data</span>
              </m.div>
            )}
          </AnimatePresence>

          <ConflictAlert />
          
          {children}
        </main>
      </div>
    </LazyMotion>
  )
}
