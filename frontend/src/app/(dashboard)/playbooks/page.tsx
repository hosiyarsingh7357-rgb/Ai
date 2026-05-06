'use client'
import { useState, useEffect } from 'react'
import { Plus, Search, BookMarked, MoreVertical, Edit3, Trash2, Shield, Target, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PlaybookModal } from '@/components/dashboard/PlaybookModal'
import { apiClient } from '@/lib/apiClient'
import { toast } from 'react-hot-toast'
import { FeatureGate } from '@/components/auth/FeatureGate'

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlaybook, setSelectedPlaybook] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchPlaybooks = async () => {
    try {
      const response = await apiClient.get('/playbooks')
      setPlaybooks(response.data.data)
    } catch (error) {
      toast.error('Failed to load playbooks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlaybooks()
  }, [])

  const handleEdit = (playbook: any) => {
    setSelectedPlaybook(playbook)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this strategy?')) return
    try {
      await apiClient.delete(`/playbooks/${id}`)
      toast.success('Strategy removed')
      fetchPlaybooks()
    } catch (error) {
      toast.error('Failed to delete strategy')
    }
  }

  const filteredPlaybooks = playbooks.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.setupType.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <FeatureGate requiredTier="PRO">
      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Strategy Playbooks</h1>
            <p className="text-zinc-400 mt-1">Define and refine your trading edge with systematic rules.</p>
          </div>
          <Button onClick={() => { setSelectedPlaybook(null); setIsModalOpen(true); }} className="h-11">
            <Plus size={18} className="mr-2" /> New Strategy
          </Button>
        </div>

        {/* Search & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search strategies by name or setup..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#16181D] border border-white/5 rounded-xl h-12 pl-12 pr-4 text-white focus:border-[#00FF87] outline-none transition-all"
              />
            </div>
          </div>
          <Card className="flex items-center gap-4 px-6 h-12 bg-zinc-900/50 border-white/5">
            <BookMarked size={18} className="text-[#00FF87]" />
            <span className="text-sm font-medium text-zinc-300">{playbooks.length} Active Strategies</span>
          </Card>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredPlaybooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPlaybooks.map((p) => (
              <Card key={p.id} className="group hover:border-[#00FF87]/30 transition-all duration-300 flex flex-col overflow-hidden">
                <div className="p-6 flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center">
                        <Target size={20} className="text-[#00FF87]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-[#00FF87] transition-colors">{p.name}</h3>
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">{p.setupType}</span>
                      </div>
                    </div>
                    <div className="relative group/menu">
                      <button className="p-1 hover:bg-white/5 rounded transition-colors text-zinc-500">
                        <MoreVertical size={16} />
                      </button>
                      <div className="absolute right-0 top-full mt-2 w-32 bg-[#1C1F26] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 py-1">
                        <button 
                          onClick={() => handleEdit(p)}
                          className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/5 flex items-center gap-2"
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="w-full px-3 py-2 text-left text-sm text-rose-500 hover:bg-rose-500/5 flex items-center gap-2"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-400 line-clamp-2">
                    {p.description || 'No description provided.'}
                  </p>

                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {p.markets?.slice(0, 3).map((m: string) => (
                        <span key={m} className="px-2 py-0.5 rounded bg-zinc-900 border border-white/5 text-[10px] text-zinc-400">
                          {m}
                        </span>
                      ))}
                      {p.markets?.length > 3 && (
                        <span className="text-[10px] text-zinc-600">+{p.markets.length - 3} more</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-zinc-900/30 border-t border-white/5 flex items-center justify-between text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                  <div className="flex gap-4">
                    <span>WR: --%</span>
                    <span>Profit: $0.00</span>
                  </div>
                  <button className="text-[#00FF87] hover:underline flex items-center gap-1 group/btn">
                    Stats <ExternalLink size={10} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-dashed border-white/5 bg-transparent">
            <BookMarked size={48} className="mx-auto text-zinc-700 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No strategies found</h3>
            <p className="text-zinc-500 mb-6">Start by creating your first systematic playbook to track its accuracy.</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={18} className="mr-2" /> Add My First Strategy
            </Button>
          </Card>
        )}

        {isModalOpen && (
          <PlaybookModal
            playbook={selectedPlaybook}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
              setIsModalOpen(false)
              fetchPlaybooks()
            }}
          />
        )}
      </div>
    </FeatureGate>
  )
}
