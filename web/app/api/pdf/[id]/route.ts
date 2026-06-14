import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import type { ItineraryDay } from '@/lib/types'
import { buildTripPdf } from './TripPdf'

export const runtime = 'nodejs'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: trip } = await supabase
    .from('trips')
    .select('*, agencies(name)')
    .eq('id', params.id)
    .single()

  if (!trip) return new NextResponse('Not found', { status: 404 })

  const { data: days } = await supabase
    .from('itinerary_days')
    .select('*, blocks:itinerary_blocks(*)')
    .eq('trip_id', params.id)
    .order('position', { ascending: true })

  const agencyName = (trip.agencies as { name?: string } | null)?.name

  const buffer = await renderToBuffer(
    buildTripPdf({ trip, days: (days ?? []) as ItineraryDay[], agencyName })
  )

  const safeName = (trip.title || 'itinerary').replace(/[^\w\s-]/g, '').trim() || 'itinerary'

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${safeName}.pdf"`,
    },
  })
}
