'use client'
import { useRouter } from 'next/navigation'
import { TradeForm } from '@/components/trades/TradeForm'
import { ChevronLeft, History } from 'lucide-react'
import Link from 'next/link'

export default function NewTradePage() {
  const router = useRouter()

  const handleSuccess = () => {
    // Redirect to trade log after success
    router.push('/trades')
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="w-10 h-10 rounded-full bg-[#151821] border border-white/5 flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Log New Trade</h1>
            <p className="text-[#94A3B8] text-sm">Fill in the details of your execution.</p>
          </div>
        </div>
        
        <Link href="/trades">
          <button className="flex items-center gap-2 text-sm font-medium text-[#94A3B8] hover:text-white transition-colors bg-[#151821] px-4 py-2 rounded-lg border border-white/5">
            <History size={16} />
            My Trade Log
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <TradeForm onSuccess={handleSuccess} />
        </div>
        
        <div className="space-y-6">
          <div className="card p-6 border-[#00FF87]/20 bg-[#00FF87]/5">
            <h3 className="text-white font-bold mb-2">Pro Tip</h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Recording your emotional state during entry helps the AI detect patterns of &quot;Revenge Trading&quot; or &quot;FOMO&quot; before they impact your equity curve.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#4B5563] uppercase tracking-widest">Recent Symbols</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {['NVDA', 'AAPL', 'EURUSD', 'BTC', 'TSLA'].map(s => (
                <span key={s} className="px-3 py-1.5 rounded-lg bg-[#151821] border border-white/5 text-[#94A3B8]">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
