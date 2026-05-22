"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home, ClipboardCheck, FolderOpen, Brain,
  Flame, BarChart2, Table2, MessageSquare,
  User, LogOut, Zap,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import ThemeToggle from './ThemeToggle'

const NAV_ITEMS = [
  { label: 'Home',       href: '/dashboard',  icon: Home },
  { label: 'Attendance', href: '/attendance', icon: ClipboardCheck },
  { label: 'Study Hub',  href: '/study',      icon: FolderOpen },
  { label: 'AI Brain',   href: '/ai-chat',    icon: Brain },
  { label: 'Deadlines',  href: '/deadline',   icon: Flame },
  { label: 'Analytics',  href: '/analytics',  icon: BarChart2 },
  { label: 'Timetable',  href: '/timetable',  icon: Table2 },
  { label: 'Chat',       href: '/chat',       icon: MessageSquare },
  { label: 'Profile',    href: '/profile',    icon: User },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, clear } = useAuthStore()

  const handleLogout = () => {
    clear()
    router.push('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'SY'

  return (
    <div className="flex h-full w-44 flex-col border-r border-white/[0.07] bg-[#0a0a0f]">
      {/* Logo */}
      <div className="px-4 pb-4 pt-5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#00e5ff]/10 text-xs font-black text-[#00e5ff]">S</div>
          <span className="text-sm font-black tracking-widest text-[#00e5ff]">SYNAPTO</span>
        </div>
        <p className="mt-0.5 pl-9 text-[10px] uppercase tracking-widest text-[#6b7280]">
          {user?.year ? `Year ${user.year} Student` : 'AI Study Platform'}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                active
                  ? 'border-l-2 border-[#00e5ff] bg-[#00e5ff]/10 text-[#00e5ff]'
                  : 'text-[#6b7280] hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={14} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom — user + controls */}
      <div className="border-t border-white/[0.07] px-3 pb-4 pt-3">
        {/* User info */}
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00e5ff]/20 text-[10px] font-bold text-[#00e5ff]">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-white">{user?.name ?? 'Alex Kumar'}</p>
            <p className="truncate text-[9px] text-[#6b7280]">
              {user?.isCR ? '⭐ Class Rep' : user?.branch ?? 'CS'}
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Upgrade button */}
        <button className="mb-2 w-full rounded-lg bg-[#00e5ff] py-1.5 text-[10px] font-black uppercase tracking-widest text-black transition-opacity hover:opacity-90">
          <Zap size={10} className="mr-1 inline" />
          Upgrade to Pro
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium text-[#6b7280] transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={12} />
          Logout
        </button>
      </div>
    </div>
  )
}
