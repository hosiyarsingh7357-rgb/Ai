'use client'
import { useState } from 'react'
import { 
  X, 
  ChevronRight, 
  Shield, 
  ExternalLink,
  Zap,
  Info
} from 'lucide-react'

interface AddConnectionModalProps {
  onClose: () => void
}

export function AddConnectionModal({ onClose }: AddConnectionModalProps) {
  const [step, setStep] = useState(1)
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null)

  const BROKERS = [
    { id: 'tradestation', name: 'TradeStation', icon: 'TS', color: '#00FF87' },
    { id: 'webull', name: 'Webull', icon: 'W', color: '#4F9CFB' },
    { id: 'ibkr', name: 'Interactive Brokers', icon: 'IB', color: '#FF4560' },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#060709]/80 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#0F1115] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden glass-morphism animate-in zoom-in duration-300">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-white/[0.02] to-transparent">
          <div>
            <h2 className="text-2xl font-bold">Add Connection</h2>
            <p className="text-sm text-[#4B5563]">Sync your trades automatically</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-[#4B5563] hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-10 font-sans">
          {step === 1 && (
            <div className="space-y-6">
              <p className="text-sm font-bold text-[#4B5563] uppercase tracking-widest">Select your broker</p>
              <div className="space-y-3">
                {BROKERS.map((broker) => (
                  <button
                    key={broker.id}
                    onClick={() => {
                        setSelectedBroker(broker.id)
                        setStep(2)
                    }}
                    className="w-full p-6 flex items-center justify-between rounded-2xl bg-white/5 border border-white/5 hover:border-[#00FF87]/50 hover:bg-white/[0.08] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center font-black text-xl border border-white/10" style={{ color: broker.color }}>
                        {broker.icon}
                      </div>
                      <span className="font-bold text-lg">{broker.name}</span>
                    </div>
                    <ChevronRight size={20} className="text-[#4B5563] group-hover:text-white transition-all transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && selectedBroker === 'tradestation' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
               <div className="p-6 rounded-2xl bg-[#00FF87]/5 border border-[#00FF87]/10 flex gap-4">
                  <Shield size={24} className="text-[#00FF87] shrink-0" />
                  <p className="text-sm text-[#94A3B8]">
                    We use OAuth 2.0 to securely link your TradeStation account. Trade Journal will only have <span className="text-white font-bold">read-only</span> access to your executions and P&L.
                  </p>
               </div>

               <div className="space-y-4">
                  <button 
                    onClick={() => setStep(3)}
                    className="w-full py-5 bg-[#00FF87] text-[#0D0F14] rounded-2xl font-black text-lg flex items-center justify-center gap-3 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,255,135,0.2)]"
                  >
                    Authenticate with TradeStation
                    <ExternalLink size={20} />
                  </button>
                  <p className="text-center text-xs text-[#4B5563]">You will be redirected to TradeStation's secure portal</p>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-8 py-4 animate-in zoom-in duration-500">
               <div className="w-20 h-20 bg-[#00FF87]/10 rounded-full flex items-center justify-center mx-auto border border-[#00FF87]/20">
                  <Zap size={32} className="text-[#00FF87]" />
               </div>
               <div>
                  <h3 className="text-2xl font-bold mb-2">Connection Successful!</h3>
                  <p className="text-[#94A3B8]">Your TradeStation dashboard is now linked. We're starting your first historical sync.</p>
               </div>
               <button 
                 onClick={onClose}
                 className="w-full py-4 bg-white text-black rounded-2xl font-black transition-all active:scale-95"
               >
                 Go to Dashboard
               </button>
            </div>
          )}
        </div>

        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center gap-3">
           <Info size={16} className="text-[#4B5563]" />
           <p className="text-[10px] text-[#4B5563] uppercase font-bold tracking-tighter">
              All traffic is encrypted over TLS 1.3
           </p>
        </div>
      </div>
    </div>
  )
}
