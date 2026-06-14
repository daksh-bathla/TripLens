import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ItineraryDay } from '@/lib/types'
import { BLOCK_META } from '@/components/itinerary/blockMeta'
import { MapPin, Calendar } from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

async function getTrip(token: string) {
  const supabase = createClient()
  const { data: trip } = await supabase
    .from('trips')
    .select('*, agencies(name, logo_url)')
    .eq('portal_token', token)
    .eq('published', true)
    .single()
  if (!trip) return null

  const { data: days } = await supabase
    .from('itinerary_days')
    .select('*, blocks:itinerary_blocks(*)')
    .eq('trip_id', trip.id)
    .order('position', { ascending: true })

  return { trip, days: (days ?? []) as ItineraryDay[] }
}

export async function generateMetadata({ params }: { params: { token: string } }): Promise<Metadata> {
  const data = await getTrip(params.token)
  if (!data) return { title: 'Trip' }
  return { title: `${data.trip.title} · Trip Portal` }
}

export default async function PortalPage({ params }: { params: { token: string } }) {
  const data = await getTrip(params.token)
  if (!data) notFound()
  const { trip, days } = data
  const agency = trip.agencies as { name?: string } | null

  return (
    <div className="min-h-screen bg-ink text-white">
      {/* Hero */}
      <header className="relative px-6 pt-16 pb-12 text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-brand font-semibold mb-4">
          {agency?.name || 'Your Trip'}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{trip.title}</h1>
        <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {trip.destination}</span>
          {trip.start_date && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(trip.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
      </header>

      {/* Timeline */}
      <main className="max-w-2xl mx-auto px-6 pb-24">
        {days.map(day => {
          const blocks = (day.blocks ?? []).slice().sort((a, b) => a.position - b.position)
          return (
            <section key={day.id} className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-sm font-bold">
                  {day.day_number}
                </div>
                <h2 className="text-lg font-bold">{day.title}</h2>
              </div>

              <div className="space-y-3 pl-[18px] border-l border-white/10 ml-[18px]">
                {blocks.map(block => {
                  const meta = BLOCK_META[block.type]
                  const Icon = meta.icon
                  return (
                    <div key={block.id} className="relative pl-6">
                      <div className="absolute -left-[27px] top-3 w-2 h-2 rounded-full bg-white/30" />
                      <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-4 h-4 ${meta.color}`} />
                          {block.time_start && (
                            <span className="text-xs font-semibold text-slate-400">{block.time_start}</span>
                          )}
                        </div>
                        <h3 className="font-semibold">{block.title}</h3>
                        {block.description && (
                          <p className="text-sm text-slate-400 mt-1 leading-relaxed">{block.description}</p>
                        )}
                        {block.location && (
                          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {block.location}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}

        {days.length === 0 && (
          <p className="text-center text-slate-500 py-16">Itinerary coming soon.</p>
        )}
      </main>

      <footer className="border-t border-white/[0.06] py-8 text-center">
        <p className="text-xs text-slate-500">
          Curated by {agency?.name || 'your travel agency'} · Powered by TripLens
        </p>
      </footer>
    </div>
  )
}
