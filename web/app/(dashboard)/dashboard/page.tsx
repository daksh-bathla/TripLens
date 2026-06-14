import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Map, Users, FileCheck, Plus, ArrowRight, TrendingUp } from 'lucide-react'

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-white/10 text-slate-300',
  proposed: 'bg-blue-500/20 text-blue-300',
  confirmed: 'bg-emerald-500/20 text-emerald-300',
  completed: 'bg-white/10 text-slate-400',
}

export default async function DashboardPage() {
  const supabase = createClient()

  const [{ data: trips }, { count: tripCount }, { count: confirmedCount }, { count: clientCount }] = await Promise.all([
    supabase.from('trips')
      .select('id, title, destination, status, published, client_name, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('trips').select('id', { count: 'exact', head: true }),
    supabase.from('trips').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
    supabase.from('clients').select('id', { count: 'exact', head: true }),
  ])

  const tripList = trips ?? []

  const stats = [
    { label: 'Total Trips', value: tripCount ?? 0, icon: Map, color: 'from-brand to-sky-500', glow: 'shadow-brand/20' },
    { label: 'Confirmed', value: confirmedCount ?? 0, icon: FileCheck, color: 'from-emerald-500 to-teal-400', glow: 'shadow-emerald-500/20' },
    { label: 'Clients', value: clientCount ?? 0, icon: Users, color: 'from-violet-500 to-purple-400', glow: 'shadow-violet-500/20' },
  ]

  return (
    <div className="animate-slide-up">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Your agency at a glance.</p>
        </div>
        <Link href="/trips/new" className="btn-primary shadow-lg shadow-brand/20">
          <Plus className="w-4 h-4" /> New Trip
        </Link>
      </header>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color, glow }) => (
          <div key={label} className="card-accent p-5">
            <div className={`w-9 h-9 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-4 shadow-lg ${glow}`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Recent Trips</h2>
        <Link href="/trips" className="flex items-center gap-1 text-sm text-brand font-semibold hover:underline">
          View all <TrendingUp className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="card divide-y divide-white/[0.06]">
        {tripList.length > 0 ? tripList.map(trip => (
          <Link
            key={trip.id}
            href={`/trips/${trip.id}`}
            className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors duration-150 group first:rounded-t-2xl last:rounded-b-2xl cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
              <Map className="w-3.5 h-3.5 text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate group-hover:text-brand transition-colors duration-150">
                {trip.title || trip.destination}
              </p>
              <p className="text-sm text-slate-400 truncate">
                {trip.client_name || 'No client'} · {trip.destination}
              </p>
            </div>
            <span className={`badge ${STATUS_BADGE[trip.status] || STATUS_BADGE.draft} capitalize`}>
              {trip.status}
            </span>
            {!trip.published && (
              <span className="badge bg-white/5 text-slate-500 hidden sm:inline">Unpublished</span>
            )}
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-brand transition-colors duration-150 shrink-0" />
          </Link>
        )) : (
          <div className="px-5 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
              <Map className="w-6 h-6 text-white/20" />
            </div>
            <p className="font-semibold mb-1">No trips yet</p>
            <p className="text-sm text-slate-400 mb-6">Create your first trip to get started.</p>
            <Link href="/trips/new" className="btn-primary inline-flex shadow-lg shadow-brand/20">
              <Plus className="w-4 h-4" /> New Trip
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
