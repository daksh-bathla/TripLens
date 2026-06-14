'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutGrid, Map, Users, LayoutTemplate, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/dashboard', label: 'Home', icon: LayoutGrid },
  { href: '/trips', label: 'Trips', icon: Map },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/templates', label: 'Templates', icon: LayoutTemplate },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-ink border-t border-white/[0.06] flex">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === '/dashboard'
          ? pathname === '/dashboard'
          : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-colors ${
              active ? 'text-brand' : 'text-slate-500'
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
