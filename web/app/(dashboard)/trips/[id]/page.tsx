import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { ItineraryDay, Trip, TripStatus } from '@/lib/types'
import DayEditor from '@/components/itinerary/DayEditor'
import TripControls from '@/components/itinerary/TripControls'
import AddDayButton from '@/components/itinerary/AddDayButton'
import TripHeaderEditor from '@/components/itinerary/TripHeaderEditor'

export default async function TripDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!trip) notFound()

  const { data: days } = await supabase
    .from('itinerary_days')
    .select('*, blocks:itinerary_blocks(*)')
    .eq('trip_id', params.id)
    .order('position', { ascending: true })

  const dayList = (days ?? []) as ItineraryDay[]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return (
    <div className="animate-slide-up">
      <Link href="/trips" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors mb-6">
        <ChevronLeft className="w-4 h-4" /> Trips
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <TripHeaderEditor trip={trip as Trip} />

          {/* Itinerary */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold">Itinerary</h2>
              <AddDayButton tripId={trip.id} />
            </div>

            {dayList.length > 0 ? (
              <div>
                {dayList.map(day => (
                  <DayEditor key={day.id} day={day} tripId={trip.id} />
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <p className="text-sm text-slate-400 mb-4">No days yet. Start building the itinerary.</p>
                <AddDayButton tripId={trip.id} />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar controls */}
        <div>
          <TripControls
            tripId={trip.id}
            status={trip.status as TripStatus}
            published={trip.published}
            portalToken={trip.portal_token}
            appUrl={appUrl}
          />
        </div>
      </div>
    </div>
  )
}
