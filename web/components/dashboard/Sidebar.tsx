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
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight">TripLens</Link>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{agencyName}</p>
      </div>

      <div className="px-3 py-4">
        <Link href="/trips/new" className="btn-primary w-full justify-center mb-4">
          <Plus className="w-4 h-4" /> New Trip
        </Link>

        <nav className="space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-white/[0.08] text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </Link>
            )
          })}
        </nav>
      </div>

      <button
        onClick={logout}
        className="mt-auto flex items-center gap-3 px-6 py-4 text-sm font-medium text-slate-400 hover:text-red-300 transition-colors border-t border-white/[0.06]"
      >
        <LogOut className="w-4 h-4" /> Log out
      </button>
    </aside>
  )
}
