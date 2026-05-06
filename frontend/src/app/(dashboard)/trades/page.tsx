import { useState, useRef, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useTrades } from '@/hooks/useTrades'
import { useDebounce } from '@/hooks/useDebounce'
import { Card, CardBody } from '@/components/ui/Card'
import { 
  PlusCircle, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  ExternalLink,
  Calendar,
  Play
} from 'lucide-react'
import Link from 'next/link'
import { formatPnL, pnlClass, formatR, cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Button } from '@/components/ui/Button'

export default function TradeLogPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  
  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useTrades({ symbol: debouncedSearch })
  
  const parentRef = useRef<HTMLDivElement>(null)
  
  const allTrades = data?.pages.flatMap(page => page.trades) ?? []

  const rowVirtualizer = useVirtualizer({
    count: allTrades.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 73,
    overscan: 10,
  })

  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems()
    const lastItem = virtualItems[virtualItems.length - 1]
    if (!lastItem) return

    if (
      lastItem.index >= allTrades.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage()
    }
  }, [hasNextPage, fetchNextPage, allTrades.length, isFetchingNextPage, rowVirtualizer.getVirtualItems()])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Trade Log</h1>
          <p className="text-[#94A3B8] text-sm">Review your history and performance.</p>
        </div>
        
        <Link href="/trades/new">
          <Button className="w-full md:w-auto">
            <PlusCircle size={18} />
            Log New Trade
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" size={16} />
          <input 
            type="text" 
            placeholder="Search by symbol..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#151821] border border-white/5 rounded-lg text-sm text-white focus:border-[#00FF87] outline-none transition-all"
          />
        </div>
        <Button variant="secondary" className="gap-2">
          <Filter size={16} />
          Filters
        </Button>
      </div>

      {/* Table */}
      <Card>
        <div 
          ref={parentRef}
          className="h-[600px] overflow-auto custom-scrollbar rounded-xl"
        >
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 z-10 bg-[#0D0F14] shadow-sm">
              <tr className="border-b border-white/5 bg-white/[0.02] flex items-center">
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider w-[15%]">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider w-[15%]">Asset</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider w-[8%]">Dir</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider text-right w-[10%]">Entry</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider text-right w-[10%]">Exit</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider text-right w-[8%]">Qty</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider text-right w-[10%]">Net P&L</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider text-right w-[8%]">R</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider w-[10%]">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider w-[6%]"></th>
              </tr>
            </thead>
            <tbody 
              className="relative"
              style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
            >
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={10} className="px-6 py-4">
                      <div className="h-6 skeleton rounded-md w-full" />
                    </td>
                  </tr>
                ))
              ) : allTrades.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-[#4B5563] text-sm">
                    No trades found. Start by logging your first execution.
                  </td>
                </tr>
              ) : (
                rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const trade = allTrades[virtualRow.index]
                  if (!trade) return null
                  
                  return (
                    <tr 
                      key={trade.id} 
                      className="hover:bg-white/[0.01] transition-colors group absolute w-full flex items-center border-b border-white/5"
                      style={{
                        height: `${virtualRow.size}px`,
                        top: 0,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <td className="px-6 py-4 text-sm text-[#94A3B8] w-[15%]">
                        {format(new Date(trade.entryDate), 'MMM d, HH:mm')}
                      </td>
                      <td className="px-6 py-4 w-[15%]">
                        <div>
                          <p className="text-sm font-bold text-white uppercase">{trade.symbol}</p>
                          <p className="text-[10px] text-[#4B5563] uppercase">{trade.assetClass}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 w-[8%]">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                          trade.direction === 'long' ? "bg-[#00FF87]/10 text-[#00FF87]" : "bg-[#FF4757]/10 text-[#FF4757]"
                        )}>
                          {trade.direction}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-white font-num w-[10%]">
                        {trade.entryPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-[#94A3B8] font-num w-[10%]">
                        {trade.exitPrice?.toLocaleString() ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-[#94A3B8] font-num w-[8%]">
                        {trade.quantity}
                      </td>
                      <td className={cn("px-6 py-4 text-sm font-bold text-right font-num w-[10%]", pnlClass(trade.netPnl ?? 0))}>
                        {trade.netPnl ? formatPnL(trade.netPnl) : '—'}
                      </td>
                      <td className={cn("px-6 py-4 text-sm font-medium text-right font-num w-[8%]", pnlClass(trade.netRMultiple ?? 0))}>
                        {formatR(trade.netRMultiple)}
                      </td>
                      <td className="px-6 py-4 w-[10%]">
                        <span className={cn(
                          "text-[10px] font-medium px-2 py-0.5 rounded border capitalize",
                          trade.status === 'closed' ? "border-[#00FF87]/20 text-[#00FF87]" : "border-yellow-500/20 text-yellow-500"
                        )}>
                          {trade.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right w-[6%]">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/trades/${trade.id}/replay`}>
                            <button 
                              className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all p-1.5 rounded-lg border border-emerald-500/20"
                              title="Replay with AI Analysis"
                            >
                              <Play size={14} fill="currentColor" />
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
          {isFetchingNextPage && (
            <div className="p-4 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

