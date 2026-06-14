import { Activity, Hotel, Bus, Utensils, Plane, StickyNote, type LucideIcon } from 'lucide-react'
import type { BlockType } from '@/lib/types'

export const BLOCK_META: Record<BlockType, { label: string; icon: LucideIcon; color: string }> = {
  activity:  { label: 'Activity',  icon: Activity,   color: 'text-brand' },
  hotel:     { label: 'Hotel',     icon: Hotel,      color: 'text-purple-300' },
  transport: { label: 'Transport', icon: Bus,        color: 'text-amber-300' },
  meal:      { label: 'Meal',      icon: Utensils,   color: 'text-orange-300' },
  flight:    { label: 'Flight',    icon: Plane,      color: 'text-sky-300' },
  note:      { label: 'Note',      icon: StickyNote, color: 'text-slate-300' },
}

export const BLOCK_TYPES: BlockType[] = ['activity', 'hotel', 'transport', 'meal', 'flight', 'note']
