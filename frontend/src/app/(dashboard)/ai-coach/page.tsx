'use client'

import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { AICoachChat } from '@/components/charts'
import { useAiCoach, ChatMessage } from '@/hooks/useAiCoach'
import { FeatureGate } from '@/components/auth/FeatureGate'

export default function AiCoachPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const { streamMessage, isLoading } = useAiCoach()

  const handleSend = async (text: string) => {
    const userMessage: ChatMessage = {
      role: 'user',
      parts: [{ text }]
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsStreaming(true)

    // Add placeholder for streaming response
    setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }] }])

    try {
      await streamMessage({ 
        message: text, 
        history: messages,
        onUpdate: (fullText) => {
          setMessages(prev => {
            const updated = [...prev]
            const lastIndex = updated.length - 1
            if (updated[lastIndex].role === 'model') {
              updated[lastIndex] = {
                ...updated[lastIndex],
                parts: [{ text: fullText }]
              }
            }
            return updated
          })
        }
      })
    } catch (error) {
      console.error('Failed to stream message:', error)
      // Remove the empty placeholder on error if it has no text
      setMessages(prev => {
        const last = prev[prev.length - 1]
        if (last.role === 'model' && !last.parts[0].text) {
          return prev.slice(0, -1)
        }
        return prev
      })
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <FeatureGate requiredTier="ELITE">
      <div className="h-[calc(100vh-80px)] flex flex-col p-6 space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              AI Performance Coach
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                Elite
              </span>
            </h1>
            <p className="text-[#94A3B8] text-sm mt-1">Direct access to your personalized EdgeLog analyst.</p>
          </div>
          <button 
            onClick={() => setMessages([])}
            className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
            title="Clear Session"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Chat Area - Lazy Loaded */}
        <AICoachChat 
          messages={messages}
          isLoading={isLoading || isStreaming}
          onSend={handleSend}
          onClear={() => setMessages([])}
          input={input}
          setInput={setInput}
        />
      </div>
    </FeatureGate>
  )
}
