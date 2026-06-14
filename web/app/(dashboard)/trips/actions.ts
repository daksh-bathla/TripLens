'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { BlockType, TripStyle, GeneratedItinerary } from '@/lib/types'

async function agencyId() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase
    .from('profiles').select('agency_id').eq('id', user.id).single()
  if (!profile?.agency_id) throw new Error('No agency')
  return { supabase, agency_id: profile.agency_id, user_id: user.id }
}

// ── CLIENTS ───────────────────────────────────────────────────

// Find an existing client by name (case-insensitive) within the agency, or create one.
async function findOrCreateClient(
  supabase: Awaited<ReturnType<typeof agencyId>>['supabase'],
  agency_id: string,
  name: string,
): Promise<string | null> {
  const trimmed = name.trim()
  if (!trimmed) return null

  const { data: existing } = await supabase
    .from('clients')
    .select('id')
    .eq('agency_id', agency_id)
    .ilike('name', trimmed)
    .limit(1)
    .maybeSingle()

  if (existing?.id) return existing.id

  const { data: created } = await supabase
    .from('clients')
    .insert({ agency_id, name: trimmed })
    .select('id')
    .single()

  return created?.id ?? null
}

// ── TRIPS ─────────────────────────────────────────────────────

export async function createTrip(input: {
  title: string
  destination: string
  client_name?: string
  client_id?: string | null
  start_date?: string | null
  end_date?: string | null
  budget?: number | null
  style?: string
}) {
  const { supabase, agency_id, user_id } = await agencyId()

  // Auto-create / link a client record when a client name is given
  let client_id = input.client_id || null
  if (!client_id && input.client_name?.trim()) {
    client_id = await findOrCreateClient(supabase, agency_id, input.client_name)
  }

  const { data, error } = await supabase.from('trips').insert({
    agency_id,
    created_by: user_id,
    title: input.title,
    destination: input.destination,
    client_name: input.client_name?.trim() || null,
    client_id,
    start_date: input.start_date || null,
    end_date: input.end_date || null,
    budget: input.budget ?? null,
    style: input.style || 'balanced',
  }).select('id').single()

  if (error) throw new Error(error.message)
  redirect(`/trips/${data.id}`)
}

export async function updateTrip(id: string, patch: Record<string, unknown>) {
  const { supabase } = await agencyId()
  const { error } = await supabase.from('trips').update(patch).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/trips/${id}`)
}

// Edit core trip details (title, dates, budget, client, etc.) from the trip page.
export async function updateTripDetails(id: string, input: {
  title?: string
  destination?: string
  client_name?: string
  start_date?: string | null
  end_date?: string | null
  budget?: number | null
  style?: string
}) {
  const { supabase, agency_id } = await agencyId()

  const patch: Record<string, unknown> = {}
  if (input.title !== undefined) patch.title = input.title.trim()
  if (input.destination !== undefined) patch.destination = input.destination.trim()
  if (input.start_date !== undefined) patch.start_date = input.start_date || null
  if (input.end_date !== undefined) patch.end_date = input.end_date || null
  if (input.budget !== undefined) patch.budget = input.budget ?? null
  if (input.style !== undefined) patch.style = input.style

  if (input.client_name !== undefined) {
    const name = input.client_name.trim()
    patch.client_name = name || null
    patch.client_id = name ? await findOrCreateClient(supabase, agency_id, name) : null
  }

  const { error } = await supabase.from('trips').update(patch).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/trips/${id}`)
  return {}
}

export async function deleteTrip(id: string) {
  const { supabase } = await agencyId()
  await supabase.from('trips').delete().eq('id', id)
  redirect('/trips')
}

// ── DAYS ──────────────────────────────────────────────────────

export async function addDay(tripId: string) {
  const { supabase, agency_id } = await agencyId()
  const { count } = await supabase.from('itinerary_days')
    .select('id', { count: 'exact', head: true }).eq('trip_id', tripId)
  const dayNumber = (count ?? 0) + 1
  const { error } = await supabase.from('itinerary_days').insert({
    trip_id: tripId,
    agency_id,
    day_number: dayNumber,
    position: dayNumber,
    title: `Day ${dayNumber}`,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/trips/${tripId}`)
}

export async function updateDay(id: string, tripId: string, patch: Record<string, unknown>) {
  const { supabase } = await agencyId()
  await supabase.from('itinerary_days').update(patch).eq('id', id)
  revalidatePath(`/trips/${tripId}`)
}

export async function deleteDay(id: string, tripId: string) {
  const { supabase } = await agencyId()
  await supabase.from('itinerary_days').delete().eq('id', id)
  revalidatePath(`/trips/${tripId}`)
}

// ── BLOCKS ────────────────────────────────────────────────────

export async function addBlock(dayId: string, tripId: string, type: BlockType = 'activity') {
  const { supabase, agency_id } = await agencyId()
  const { count } = await supabase.from('itinerary_blocks')
    .select('id', { count: 'exact', head: true }).eq('day_id', dayId)
  const { error } = await supabase.from('itinerary_blocks').insert({
    day_id: dayId,
    agency_id,
    type,
    title: 'New item',
    position: (count ?? 0) + 1,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/trips/${tripId}`)
}

export async function updateBlock(id: string, tripId: string, patch: Record<string, unknown>) {
  const { supabase } = await agencyId()
  await supabase.from('itinerary_blocks').update(patch).eq('id', id)
  revalidatePath(`/trips/${tripId}`)
}

export async function deleteBlock(id: string, tripId: string) {
  const { supabase } = await agencyId()
  await supabase.from('itinerary_blocks').delete().eq('id', id)
  revalidatePath(`/trips/${tripId}`)
}

export async function reorderBlocks(tripId: string, ordered: { id: string; position: number }[]) {
  const { supabase } = await agencyId()
  await Promise.all(
    ordered.map(b => supabase.from('itinerary_blocks').update({ position: b.position }).eq('id', b.id))
  )
  revalidatePath(`/trips/${tripId}`)
}

// ── AI GENERATION ─────────────────────────────────────────────

async function callGroq(prompt: string): Promise<string> {
  const key = process.env.GROQ_API_KEY
  if (!key) throw new Error('GROQ_API_KEY not set')

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4096,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.choices[0].message.content as string
}

export async function generateAndSaveItinerary(tripId: string): Promise<{ error?: string }> {
  const { supabase, agency_id } = await agencyId()

  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single()

  if (!trip) return { error: 'Trip not found' }

  const days =
    trip.start_date && trip.end_date
      ? Math.max(1, Math.round((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / 86_400_000) + 1)
      : 5

  const styleGuide: Record<TripStyle, string> = {
    budget: 'affordable stays, street food, free attractions, public transport',
    luxury: 'five-star hotels, fine dining, private transfers, exclusive experiences',
    adventure: 'outdoor activities, unique experiences, off-the-beaten-path, active itinerary',
    balanced: 'mix of comfort and value, good restaurants, popular sights with local gems',
  }

  const prompt = `You are an expert travel planner for a premium agency.

Client: ${trip.client_name || 'Valued Traveler'}
Destination: ${trip.destination}
Duration: ${days} days
${trip.budget ? `Budget: ₹${Number(trip.budget).toLocaleString()}` : ''}
Style: ${trip.style} — ${styleGuide[trip.style as TripStyle] ?? ''}

Create a complete day-by-day itinerary. Return ONLY valid JSON:

{
  "title": "A compelling trip title",
  "summary": "2-3 sentence overview",
  "highlights": ["highlight 1", "highlight 2", "highlight 3"],
  "days": [
    {
      "dayNumber": 1,
      "title": "Arrival & First Impressions",
      "blocks": [
        { "type": "transport", "title": "Airport Transfer", "description": "Private transfer to hotel", "time_start": "14:00", "duration": "45 minutes", "location": "Airport → Hotel" },
        { "type": "hotel", "title": "Hotel Name", "description": "Check in and freshen up", "location": "City Center" },
        { "type": "meal", "title": "Welcome dinner", "description": "Local cuisine at a recommended restaurant", "time_start": "20:00", "duration": "1.5 hours", "location": "Restaurant name" }
      ]
    }
  ]
}

Block types: activity | hotel | transport | meal | flight | note
Each day: 4-6 blocks. Be specific with times and locations.
Return ONLY the JSON object, no markdown.`

  let generated: GeneratedItinerary
  try {
    const raw = await callGroq(prompt)
    const clean = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    generated = JSON.parse(clean)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Generation failed' }
  }

  // Delete existing days (cascade deletes blocks)
  await supabase.from('itinerary_days').delete().eq('trip_id', tripId)

  // Insert new days + blocks
  for (const day of generated.days) {
    const { data: dayRow, error: dayErr } = await supabase
      .from('itinerary_days')
      .insert({
        trip_id: tripId,
        agency_id,
        day_number: day.dayNumber,
        position: day.dayNumber,
        title: day.title,
      })
      .select('id')
      .single()

    if (dayErr || !dayRow) continue

    const blocks = day.blocks ?? []
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i]
      await supabase.from('itinerary_blocks').insert({
        day_id: dayRow.id,
        agency_id,
        type: b.type,
        title: b.title,
        description: b.description ?? null,
        time_start: b.time_start ?? null,
        duration: b.duration ?? null,
        location: b.location ?? null,
        position: i + 1,
      })
    }
  }

  revalidatePath(`/trips/${tripId}`)
  return {}
}

// ── TEMPLATES ─────────────────────────────────────────────────

export async function saveTripAsTemplate(tripId: string): Promise<{ error?: string }> {
  const { supabase, agency_id } = await agencyId()

  const { data: trip } = await supabase
    .from('trips')
    .select('title, destination, style')
    .eq('id', tripId)
    .single()
  if (!trip) return { error: 'Trip not found' }

  const { data: days } = await supabase
    .from('itinerary_days')
    .select('day_number, title, position, blocks:itinerary_blocks(type, title, description, time_start, duration, location, price, position)')
    .eq('trip_id', tripId)
    .order('position', { ascending: true })

  const snapshot = (days ?? []).map(d => ({
    dayNumber: d.day_number,
    title: d.title,
    blocks: (d.blocks ?? [])
      .slice()
      .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
      .map((b: Record<string, unknown>) => ({
        type: b.type, title: b.title, description: b.description,
        time_start: b.time_start, duration: b.duration, location: b.location, price: b.price,
      })),
  }))

  const { error } = await supabase.from('templates').insert({
    agency_id,
    title: trip.title,
    destination: trip.destination,
    style: trip.style,
    duration_days: snapshot.length || null,
    itinerary_snapshot: snapshot,
  })

  if (error) return { error: error.message }
  revalidatePath('/templates')
  return {}
}

export async function createTripFromTemplate(templateId: string) {
  const { supabase, agency_id, user_id } = await agencyId()

  const { data: tpl } = await supabase
    .from('templates')
    .select('*')
    .eq('id', templateId)
    .single()
  if (!tpl) throw new Error('Template not found')

  const { data: trip, error: tripErr } = await supabase.from('trips').insert({
    agency_id,
    created_by: user_id,
    title: tpl.title,
    destination: tpl.destination,
    style: tpl.style,
  }).select('id').single()
  if (tripErr || !trip) throw new Error(tripErr?.message || 'Failed to create trip')

  const snapshot = (tpl.itinerary_snapshot ?? []) as Array<{
    dayNumber: number; title: string
    blocks: Array<Record<string, unknown>>
  }>

  for (const day of snapshot) {
    const { data: dayRow } = await supabase.from('itinerary_days').insert({
      trip_id: trip.id,
      agency_id,
      day_number: day.dayNumber,
      position: day.dayNumber,
      title: day.title,
    }).select('id').single()
    if (!dayRow) continue

    const blocks = day.blocks ?? []
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i]
      await supabase.from('itinerary_blocks').insert({
        day_id: dayRow.id,
        agency_id,
        type: b.type ?? 'activity',
        title: b.title ?? 'Item',
        description: b.description ?? null,
        time_start: b.time_start ?? null,
        duration: b.duration ?? null,
        location: b.location ?? null,
        price: b.price ?? null,
        position: i + 1,
      })
    }
  }

  redirect(`/trips/${trip.id}`)
}

export async function deleteTemplate(id: string) {
  const { supabase } = await agencyId()
  await supabase.from('templates').delete().eq('id', id)
  revalidatePath('/templates')
}
