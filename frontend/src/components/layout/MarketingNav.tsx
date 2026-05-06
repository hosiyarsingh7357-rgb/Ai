'use client'
import Link from 'next/link'
import { TrendingUp, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export function MarketingNav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-black/60 backdrop-blur-md border-b border-white/5 py-3" : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#00FF87] flex items-center justify-center shadow-[0_0_16px_rgba(0,255,135,0.5)]">
            <TrendingUp size={16} strokeWidth={2.5} className="text-[#0D0F14]" />
          </div>
          <span className="font-bold text-white text-xl tracking-tight group-hover:text-[#00FF87] transition-colors">
            Trade Journal <span className="text-[#00FF87]">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors">Features</Link>
          <Link href="/pricing" className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors">Pricing</Link>
          <Link href="#about" className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors">Methodology</Link>
          <Link href="/login" className="text-sm font-medium text-white px-4 py-2 hover:bg-white/5 rounded-lg transition-colors">Login</Link>
          <Link 
            href="/signup" 
            className="text-sm font-bold bg-white text-black px-5 py-2.5 rounded-full hover:bg-[#00FF87] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
          >
            Start Free
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={cn(
        "fixed inset-0 z-40 bg-[#060709] transition-all duration-500 md:hidden",
        isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      )}>
        <div className="flex flex-col h-full pt-32 px-8 pb-12">
          <nav className="flex flex-col gap-8 flex-1">
            <MobileNavLink href="#features" label="Features" onClick={() => setIsMobileMenuOpen(false)} />
            <MobileNavLink href="/pricing" label="Pricing" onClick={() => setIsMobileMenuOpen(false)} />
            <MobileNavLink href="#about" label="Methodology" onClick={() => setIsMobileMenuOpen(false)} />
            <MobileNavLink href="/login" label="Member Login" onClick={() => setIsMobileMenuOpen(false)} />
          </nav>
          
          <Link 
            href="/signup" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full py-6 bg-[#00FF87] text-[#0D0F14] text-center rounded-[2rem] font-black text-2xl shadow-[0_0_40px_rgba(0,255,135,0.3)]"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </header>
  )
}

function MobileNavLink({ href, label, onClick }: { href: string, label: string, onClick: () => void }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="text-4xl font-black text-white hover:text-[#00FF87] transition-colors"
    >
      {label}
    </Link>
  )
}
