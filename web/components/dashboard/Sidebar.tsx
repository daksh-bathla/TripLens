'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutGrid, Map, Users, LayoutTemplate, Settings, LogOut, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/trips', label: 'Trips', icon: Map },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/templates', label: 'Templates', icon: LayoutTemplate },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ agencyName }: { agencyName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-white/[0.06] bg-ink fixed inset-y-0 left-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          {/* Brand mark */}
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand to-sky-400 flex items-center justify-center shrink-0 shadow-lg shadow-brand/20">
            <span className="text-white font-bold text-xs">TL</span>
          </div>
          <span className="text-base font-bold tracking-tight gradient-text">TripLens</span>
        </Link>
        <p className="text-xs text-slate-500 mt-1.5 ml-9 truncate">{agencyName}</p>
      </div>

      <div className="px-3 py-4 flex-1 flex flex-col">
        <Link href="/trips/new" className="btn-primary w-full justify-center mb-5 shadow-lg shadow-brand/20">
          <Plus className="w-4 h-4" /> New Trip
        </Link>

        <nav className="space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative ${
                  active
                    ? 'bg-brand/10 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {active && (
                  <span className="absolute left-0 inset-y-1.5 w-0.5 rounded-full bg-brand" />
                )}
                <Icon className={`w-4 h-4 ${active ? 'text-brand' : ''}`} />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-slate-500 hover:text-red-300 transition-colors duration-150 border-t border-white/[0.06] cursor-pointer"
      >
        <LogOut className="w-4 h-4" /> Log out
      </button>
    </aside>
  )
}
