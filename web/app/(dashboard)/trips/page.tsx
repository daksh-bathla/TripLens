import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Map, ArrowRight } from 'lucide-react'

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-white/10 text-slate-300',
  proposed: 'bg-blue-500/20 text-blue-300',
  confirmed: 'bg-emerald-500/20 text-emerald-300',
  completed: 'bg-white/10 text-slate-400',
}

export default async function TripsPage() {
  const supabase = createClient()
  const { data: trips } = await supabase
    .from('trips')
    .select('id, title, destination, status, published, client_name, start_date, created_at')
    .order('created_at', { ascending: false })

  const list = trips ?? []

  return (
    <div className="animate-slide-up">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Trips</h1>
          <p className="text-sm text-slate-400 mt-1">{list.length} total</p>
        </div>
        <Link href="/trips/new" className="btn-primary">
          <Plus className="w-4 h-4" /> New Trip
        </Link>
      </header>

      <div className="card divide-y divide-white/[0.06]">
        {list.length > 0 ? list.map(trip => (
          <Link
            key={trip.id}
            href={`/trips/${trip.id}`}
            className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors group first:rounded-t-2xl last:rounded-b-2xl"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate group-hover:text-brand transition-colors">{trip.title}</p>
              <p className="text-sm text-slate-400 truncate">
                {trip.client_name || 'No client'} · {trip.destination}
                {trip.start_date && ` · ${new Date(trip.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
              </p>
            </div>
            <span className={`badge ${STATUS_BADGE[trip.status] || STATUS_BADGE.draft} capitalize`}>
              {trip.status}
            </span>
            {trip.published
              ? <span className="badge bg-emerald-500/15 text-emerald-300 hidden sm:inline">Live</span>
              : <span className="badge bg-white/5 text-slate-500 hidden sm:inline">Draft</span>}
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-brand transition-colors" />
          </Link>
        )) : (
          <div className="px-5 py-16 text-center">
            <Map className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-sm text-slate-400 mb-4">No trips yet.</p>
            <Link href="/trips/new" className="btn-primary inline-flex">
              <Plus className="w-4 h-4" /> Create your first trip
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
