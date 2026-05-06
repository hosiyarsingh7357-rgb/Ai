'use client'
import { useState } from 'react'
import { 
  Link2, 
  Plus, 
  Trash2, 
  RefreshCcw, 
  AlertCircle, 
  CheckCircle2,
  Lock
} from 'lucide-react'
import { AddConnectionModal } from '@/components/connections/AddConnectionModal'

// Dummy data for initial display
const MOCK_CONNECTIONS = [
  { id: '1', broker: 'TradeStation', status: 'connected', lastSync: '2 hours ago', account: 'SIM-1234' },
]

export default function ConnectionsPage() {
  const [connections, setConnections] = useState(MOCK_CONNECTIONS)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const handleSyncAll = () => {
    setIsSyncing(true)
    setTimeout(() => setIsSyncing(false), 2000)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {showAddModal && <AddConnectionModal onClose={() => setShowAddModal(false)} />}
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Broker Connections</h1>
          <p className="text-[#94A3B8]">Sync your trades automatically from Elite brokers.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm font-medium disabled:opacity-50"
          >
            <RefreshCcw size={16} className={isSyncing ? 'animate-spin' : ''} />
            Sync All
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#00FF87] text-[#0D0F14] rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(0,255,135,0.3)] transition-all"
          >
            <Plus size={16} />
            Add Connection
          </button>
        </div>
      </div>

      {/* Connection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connections.map((conn) => (
          <div key={conn.id} className="p-6 rounded-2xl bg-[#0F1115] border border-white/5 hover:border-[#00FF87]/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <Link2 className="text-[#00FF87]" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{conn.broker}</h3>
                <p className="text-xs text-[#4B5563]">{conn.account}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#4B5563]">Status</span>
                <span className="flex items-center gap-1 text-[#00FF87] font-medium">
                  <CheckCircle2 size={14} />
                  Connected
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#4B5563]">Last Sync</span>
                <span className="text-[#94A3B8]">{conn.lastSync}</span>
              </div>
            </div>

            <button className="w-full mt-6 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold text-[#94A3B8]">
              Connection Settings
            </button>
          </div>
        ))}

        {/* Locked Feature Placeholder (Elite Tier Only) */}
        <div className="p-6 rounded-2xl bg-[#0F1115]/50 border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-4 opacity-60">
           <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#4B5563]">
              <Lock size={20} />
           </div>
           <div>
              <p className="font-bold text-sm">Interactive Brokers</p>
              <p className="text-[10px] text-[#4B5563] uppercase tracking-wider font-black">Elite Only</p>
           </div>
        </div>
      </div>

      {/* Security Info */}
      <div className="p-6 rounded-2xl bg-[#00FF87]/5 border border-[#00FF87]/10 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-[#00FF87]/10 flex items-center justify-center shrink-0">
          <AlertCircle size={20} className="text-[#00FF87]" />
        </div>
        <div>
          <h4 className="font-bold text-[#00FF87]">Banking-Grade Security</h4>
          <p className="text-sm text-[#94A3B8] mt-1">
            Your broker credentials are encrypted using AES-256-GCM. We never store your trading passwords directly; we only use secure API tokens with limited execution-viewing scopes.
          </p>
        </div>
      </div>
    </div>
  )
}
