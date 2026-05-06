'use client'

import { ImportWizard } from '@/components/dashboard/ImportWizard'
import { Card } from '@/components/ui/Card'
import { useTrades } from '@/hooks/useTrades'
import { Skeleton } from '@/components/ui/Skeleton'

export default function ImportPage() {
  const { data: trades, isLoading } = useTrades()

  // For simplicity in Phase 1, we use the first available trading account.
  // In a real app, the user would select which account they are importing into.
  const accountId = trades?.pages[0]?.trades[0]?.accountId || ''

  return (
    <div className="container max-w-2xl py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-3 tracking-tight">Sync Your Broker</h1>
        <p className="text-zinc-400">
          Upload your trade history CSV to get hedge-fund grade analytics in seconds.
        </p>
      </div>

      <Card className="p-8">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <ImportWizard accountId={accountId} />
        )}
      </Card>

      <div className="mt-12">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-6 text-center">Supported Formats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 grayscale opacity-40">
          {['MetaTrader', 'IBKR', 'Robinhood', 'Webull'].map(broker => (
            <div key={broker} className="flex items-center justify-center p-4 border border-white/5 rounded-lg text-sm font-medium">
              {broker}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
