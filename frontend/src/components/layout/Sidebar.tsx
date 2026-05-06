'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  PlusCircle,
  Settings,
  CreditCard,
  LogOut,
  TrendingUp,
  Bot,
  BookMarked,
  History,
  Brain,
  MessagesSquare,
  Link2,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard',   href: '/dashboard',         icon: LayoutDashboard },
  { label: 'Log Trade',   href: '/trades/new',        icon: PlusCircle,  accent: true },
  { label: 'Trade Log',   href: '/trades',            icon: BookOpen },
  { label: 'Analytics',   href: '/analytics',         icon: BarChart3 },
  { label: 'Playbooks',   href: '/playbooks',         icon: BookMarked },
  { label: 'AI Reports',  href: '/reports',           icon: Brain,       pro: true },
  { label: 'AI Insights', href: '/ai',                icon: Bot,         pro: true },
  { label: 'AI Coach',    href: '/ai-coach',          icon: MessagesSquare, elite: true },
  { label: 'Connections', href: '/connections',       icon: Link2,           elite: true },
  { label: 'Backtesting', href: '/backtest',          icon: History,     pro: true },
]

const BOTTOM_ITEMS = [
  { label: 'Billing',    href: '/settings/billing',    icon: CreditCard },
  { label: 'Settings',   href: '/settings',            icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  const tierColor = user?.subscriptionTier === 'elite' ? '#00FF87' : user?.subscriptionTier === 'pro' ? '#A78BFA' : '#4B5563'

  return (
    <aside className="flex flex-col h-screen w-64 bg-[#0D0F14] border-r border-white/5 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-[#00FF87] flex items-center justify-center shadow-[0_0_16px_rgba(0,255,135,0.5)]">
          <TrendingUp size={16} strokeWidth={2.5} className="text-[#0D0F14]" />
        </div>
        <div>
          <span className="font-bold text-white text-sm">Trade Journal</span>
          <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: tierColor }}>
            {user?.subscriptionTier || 'Free'}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-[#00FF87]/10 text-[#00FF87]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5',
                item.accent && !isActive && 'text-[#00FF87]/80 hover:text-[#00FF87] hover:bg-[#00FF87]/5'
              )}
            >
              <Icon
                size={18}
                className={cn(
                  'shrink-0 transition-colors',
                  isActive ? 'text-[#00FF87]' : 'group-hover:text-current'
                )}
              />
              {item.label}
              {item.pro && (
                <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#A78BFA]/15 text-[#A78BFA]">
                  PRO
                </span>
              )}
              {item.elite && (
                <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#00FF87]/15 text-[#00FF87]">
                  ELITE
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-white/5 pt-3 space-y-0.5">
        {BOTTOM_ITEMS.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive ? 'bg-white/5 text-white' : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              )}
            >
              <Icon size={16} className="shrink-0" />
              {item.label}
            </Link>
          )
        })}

        {/* User */}
        <div className="mt-2 pt-3 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00FF87] to-[#4F9CFB] flex items-center justify-center text-[#0D0F14] text-xs font-bold shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name ?? 'Trader'}</p>
              <p className="text-[11px] text-[#4B5563] truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="ml-auto text-[#4B5563] hover:text-[#FF4757] transition-colors p-1"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
