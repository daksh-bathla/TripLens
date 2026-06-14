'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { ItineraryDay } from '@/lib/types'
import BlockEditor from './BlockEditor'
import { addBlock, updateDay, deleteDay } from '@/app/(dashboard)/trips/actions'

export default function DayEditor({ day, tripId }: { day: ItineraryDay; tripId: string }) {
  const [, startTransition] = useTransition()
  const [title, setTitle] = useState(day.title)
  const blocks = (day.blocks ?? []).slice().sort((a, b) => a.position - b.position)

  return (
    <div className="relative pl-8">
      <div className="absolute left-0 top-1.5 w-7 h-7 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center text-xs font-bold text-brand">
        {day.day_number}
      </div>
      <div className="absolute left-[13px] top-9 bottom-0 w-px bg-white/[0.08]" />

      <div className="pb-8">
        <div className="flex items-center gap-2 mb-3 group/day">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={e => startTransition(() => updateDay(day.id, tripId, { title: e.target.value }))}
            className="bg-transparent font-bold text-white outline-none placeholder:text-slate-600"
            placeholder={`Day ${day.day_number}`}
          />
          <button
            onClick={() => startTransition(() => deleteDay(day.id, tripId))}
            className="text-slate-600 hover:text-red-400 opacity-0 group-hover/day:opacity-100 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {blocks.map(block => (
            <BlockEditor key={block.id} block={block} tripId={tripId} />
          ))}
        </div>

        <button
          onClick={() => startTransition(() => addBlock(day.id, tripId))}
          className="mt-2 flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-brand transition-colors"
        >
          <Plus className="w-4 h-4" /> Add item
        </button>
      </div>
    </div>
  )
}
