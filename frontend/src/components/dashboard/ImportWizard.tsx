'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { apiClient } from '@/lib/apiClient'
import { useRouter } from 'next/navigation'

const BROKERS = [
  { id: 'ibkr', name: 'Interactive Brokers' },
  { id: 'schwab', name: 'Charles Schwab / TD Ameritrade' },
  { id: 'mt4', name: 'MetaTrader 4/5' },
  { id: 'webull', name: 'Webull' },
  { id: 'robinhood', name: 'Robinhood' },
  { id: 'binance', name: 'Binance (Crypto)' },
]

export function ImportWizard({ accountId }: { accountId: string }) {
  const [selectedBroker, setSelectedBroker] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'previewing' | 'preview_ready' | 'uploading' | 'success' | 'error'>('idle')
  const [previewData, setPreviewData] = useState<any>(null)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)
  const router = useRouter()

  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0])
    setError('')
    setStatus('idle')
    setPreviewData(null)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  })

  const fetchPreview = async () => {
    if (!file || !selectedBroker) return
    setStatus('previewing')
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('brokerType', selectedBroker)

    try {
      const response = await apiClient.post('/trades/bulk-import-preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setPreviewData(response.data.data)
      setStatus('preview_ready')
    } catch (err: any) {
      setStatus('error')
      setError(err.response?.data?.message || 'Failed to generate preview')
    }
  }

  const handleUpload = async () => {
    if (!file || !selectedBroker) return

    setStatus('uploading')
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('brokerType', selectedBroker)
    formData.append('accountId', accountId)

    try {
      const response = await apiClient.post('/trades/bulk-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(response.data.data)
      setStatus('success')
    } catch (err: any) {
      setStatus('error')
      setError(err.response?.data?.message || 'Failed to upload CSV')
    }
  }

  if (status === 'success') {
    return (
      <Card className="p-8 text-center border-emerald-500/30 bg-emerald-500/5">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Import Successful!</h3>
        <p className="text-zinc-400 mb-6">
          Imported {result.imported} trades. {result.skipped} duplicates skipped.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => router.push('/trades')}>View Trades</Button>
          <Button variant="secondary" onClick={() => setStatus('idle')}>Import More</Button>
        </div>
      </Card>
    )
  }

  if (status === 'preview_ready') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Import Preview</h3>
          <span className="text-sm font-medium text-zinc-400">Found {previewData.total} items</span>
        </div>

        <div className="border border-white/5 rounded-xl overflow-hidden bg-zinc-900/50">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">Symbol</th>
                <th className="px-4 py-3 font-medium">Side</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Entry Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {previewData.trades.map((trade: any, i: number) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-bold text-[#00FF87]">{trade.symbol}</td>
                  <td className={`px-4 py-3 font-medium uppercase ${trade.direction === 'long' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {trade.direction}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{trade.quantity}</td>
                  <td className="px-4 py-3 text-zinc-300">${trade.entryPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {previewData.total > 50 && (
            <div className="p-3 text-center text-xs text-zinc-500 italic border-t border-white/5">
              Showing first 50 of {previewData.total} items...
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Button variant="secondary" className="flex-1" onClick={() => setStatus('idle')}>
            Back
          </Button>
          <Button className="flex-1" onClick={handleUpload}>
            Confirm & Import
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-400">Select Broker</label>
        <select
          value={selectedBroker}
          onChange={(e) => setSelectedBroker(e.target.value)}
          className="w-full h-11 bg-zinc-900 border border-white/10 rounded-lg px-4 focus:outline-none focus:border-[#00FF87] transition-colors appearance-none text-white"
        >
          <option value="">-- Choose Broker --</option>
          {BROKERS.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
          isDragActive ? 'border-[#00FF87] bg-[#00FF87]/5' : 'border-white/10 hover:border-white/20'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-zinc-900 border border-white/5">
            {file ? <FileText className="w-8 h-8 text-[#00FF87]" /> : <Upload className="w-8 h-8 text-zinc-500" />}
          </div>
          <div>
            <p className="text-lg font-medium">
              {file ? file.name : (isDragActive ? 'Drop the file here' : 'Click or drag CSV here')}
            </p>
            <p className="text-sm text-zinc-500 mt-1">Only .csv files from your broker statement</p>
          </div>
        </div>
      </div>

      {status === 'error' && (
        <div className="flex items-center gap-2 text-rose-500 text-sm bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <Button
        className="w-full h-12"
        disabled={!file || !selectedBroker || status === 'previewing' || status === 'uploading'}
        onClick={fetchPreview}
      >
        {status === 'previewing' || status === 'uploading' ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing data...
          </>
        ) : 'Analyze CSV'}
      </Button>
    </div>
  )
}
