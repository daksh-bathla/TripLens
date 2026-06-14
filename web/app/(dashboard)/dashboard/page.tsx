import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Map, Users, FileCheck, Plus, ArrowRight } from 'lucide-react'

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
    { label: 'Total Trips', value: tripCount ?? 0, icon: Map },
    { label: 'Confirmed', value: confirmedCount ?? 0, icon: FileCheck },
    { label: 'Clients', value: clientCount ?? 0, icon: Users },
  ]

  return (
    <div className="animate-slide-up">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Your agency at a glance.</p>
        </div>
        <Link href="/trips/new" className="btn-primary">
          <Plus className="w-4 h-4" /> New Trip
        </Link>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-5">
            <div className="w-9 h-9 bg-brand/15 rounded-lg flex items-center justify-center mb-3">
              <Icon className="w-4 h-4 text-brand" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Recent Trips</h2>
        <Link href="/trips" className="text-sm text-brand font-semibold hover:underline">View all</Link>
      </div>

      <div className="card divide-y divide-white/[0.06]">
        {tripList.length > 0 ? tripList.map(trip => (
          <Link
            key={trip.id}
            href={`/trips/${trip.id}`}
            className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors group first:rounded-t-2xl last:rounded-b-2xl"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate group-hover:text-brand transition-colors">
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
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-brand transition-colors" />
          </Link>
        )) : (
          <div className="px-5 py-16 text-center">
            <Map className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-sm text-slate-400 mb-4">No trips yet. Create your first one.</p>
            <Link href="/trips/new" className="btn-primary inline-flex">
              <Plus className="w-4 h-4" /> New Trip
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
