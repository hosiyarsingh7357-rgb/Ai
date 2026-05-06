'use client'

import React, { useRef, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, RotateCcw, Cloud, CloudOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChatMessage } from '@/hooks/useAiCoach'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface AICoachChatProps {
  messages: ChatMessage[]
  isLoading: boolean
  onSend: (text: string) => void
  onClear: () => void
  input: string
  setInput: (text: string) => void
}

export function AICoachChat({ 
  messages, 
  isLoading, 
  onSend, 
  onClear, 
  input, 
  setInput 
}: AICoachChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    onSend(input)
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-[#0D0F14]/40 border border-white/[0.08] rounded-[2.5rem] backdrop-blur-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative group/chat">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.05] via-transparent to-purple-500/[0.05] pointer-events-none opacity-50 group-hover/chat:opacity-100 transition-opacity duration-1000" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Bot className="text-emerald-400" size={32} />
            </div>
            <div className="max-w-xs">
              <p className="text-white font-bold mb-2">Nexus AI Coach Online</p>
              <p className="text-sm text-slate-400">Ask about your recent patterns, psychology, or how to improve your discipline.</p>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <m.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex items-start gap-4 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border transition-all duration-500",
                msg.role === 'user' 
                  ? "bg-slate-800 border-white/10 group-hover:border-emerald-500/30" 
                  : "bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
              )}>
                {msg.role === 'user' ? <User size={16} className="text-slate-400" /> : <Bot size={16} className="text-emerald-400" />}
              </div>
              <div className={cn(
                "p-5 rounded-[1.5rem] text-sm leading-relaxed shadow-sm transition-all duration-300",
                msg.role === 'user'
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-50 rounded-tr-none"
                  : "bg-white/[0.03] border border-white/[0.08] text-slate-200 rounded-tl-none hover:bg-white/[0.05]"
              )}>
                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-[#151821] prose-pre:border prose-pre:border-white/5">
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
                  ) : (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({node, ...props}) => (
                          <div className="my-4 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
                            <table className="min-w-full divide-y divide-white/10" {...props} />
                          </div>
                        ),
                        thead: ({node, ...props}) => <thead className="bg-white/[0.03]" {...props} />,
                        th: ({node, ...props}) => <th className="px-4 py-3 text-left text-[10px] font-bold text-emerald-400 uppercase tracking-wider" {...props} />,
                        td: ({node, ...props}) => <td className="px-4 py-3 text-xs text-zinc-300 border-t border-white/5" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside my-3 space-y-1.5 text-zinc-300" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-inside my-3 space-y-1.5 text-zinc-300" {...props} />,
                        li: ({node, ...props}) => <li className="text-sm" {...props} />,
                        code: ({node, ...props}) => (
                          <code className="bg-white/10 rounded px-1.5 py-0.5 text-xs text-emerald-300 font-mono" {...props} />
                        ),
                      }}
                    >
                      {msg.parts[0].text}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            </m.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex items-start gap-4 max-w-[85%]">
            <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border bg-emerald-500/10 border-emerald-500/20">
              <Bot size={14} className="text-emerald-400" />
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-emerald-400/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-emerald-400/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input area */}
      <div className="p-6 bg-slate-900/60 border-t border-white/[0.05]">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask your coach anything..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-4 px-6 pr-14 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-emerald-500 text-slate-900 hover:brightness-110 disabled:opacity-50 disabled:grayscale transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
