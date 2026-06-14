// ── ENUMS ─────────────────────────────────────────────────────

export type AgencyPlan = 'starter' | 'pro' | 'agency_plus'
export type UserRole = 'owner' | 'agent'
export type TripStatus = 'draft' | 'proposed' | 'confirmed' | 'completed'
export type TripStyle = 'budget' | 'luxury' | 'adventure' | 'balanced'
export type BlockType = 'activity' | 'hotel' | 'transport' | 'meal' | 'flight' | 'note'
export type DocumentType = 'passport' | 'visa' | 'booking' | 'other'

// ── DATABASE ROWS ─────────────────────────────────────────────

export interface Agency {
  id: string
  name: string
  slug: string | null
  plan: AgencyPlan
  logo_url: string | null
  created_at: string
}

export interface Profile {
  id: string
  agency_id: string
  full_name: string | null
  role: UserRole
  created_at: string
}

export interface Client {
  id: string
  agency_id: string
  name: string
  email: string | null
  phone: string | null
  notes: string | null
  created_at: string
}

export interface Trip {
  id: string
  agency_id: string
  client_id: string | null
  client_name: string | null
  title: string
  destination: string
  start_date: string | null
  end_date: string | null
  budget: number | null
  style: TripStyle
  status: TripStatus
  published: boolean
  portal_token: string
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ItineraryDay {
  id: string
  trip_id: string
  agency_id: string
  day_number: number
  date: string | null
  title: string
  notes: string | null
  position: number
  created_at: string
  blocks?: ItineraryBlock[]  // joined
}

export interface ItineraryBlock {
  id: string
  day_id: string
  agency_id: string
  type: BlockType
  title: string
  description: string | null
  time_start: string | null
  duration: string | null
  location: string | null
  price: number | null
  position: number
  metadata: Record<string, unknown>
  created_at: string
}

export interface Document {
  id: string
  trip_id: string
  agency_id: string
  name: string
  url: string
  type: DocumentType | null
  created_at: string
}

export interface Template {
  id: string
  agency_id: string
  title: string
  destination: string
  style: TripStyle
  description: string | null
  duration_days: number | null
  itinerary_snapshot: ItineraryDaySnapshot[]
  created_at: string
}

// ── AI / GENERATION TYPES ─────────────────────────────────────

export interface ItineraryDaySnapshot {
  dayNumber: number
  title: string
  blocks: ItineraryBlockSnapshot[]
}

export interface ItineraryBlockSnapshot {
  type: BlockType
  title: string
  description?: string
  time_start?: string
  duration?: string
  location?: string
  price?: number
}

export interface GeneratedItinerary {
  title: string
  summary: string
  highlights: string[]
  days: ItineraryDaySnapshot[]
}

// ── ENRICHED / JOINED TYPES ───────────────────────────────────

export interface TripWithDays extends Trip {
  itinerary_days: ItineraryDay[]
  client?: Client | null
}

export interface TripSummary extends Pick<Trip, 'id' | 'title' | 'destination' | 'status' | 'published' | 'start_date' | 'end_date' | 'portal_token' | 'created_at'> {
  client_name: string | null
  day_count: number
}
