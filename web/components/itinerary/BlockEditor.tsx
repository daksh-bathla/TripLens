'use client'

import { useState, useTransition } from 'react'
import { Trash2, GripVertical, ChevronDown } from 'lucide-react'
import type { ItineraryBlock, BlockType } from '@/lib/types'
import { BLOCK_META, BLOCK_TYPES } from './blockMeta'
import { updateBlock, deleteBlock } from '@/app/(dashboard)/trips/actions'

export default function BlockEditor({ block, tripId }: { block: ItineraryBlock; tripId: string }) {
  const [, startTransition] = useTransition()
  const [local, setLocal] = useState(block)
  const [typeOpen, setTypeOpen] = useState(false)
  const meta = BLOCK_META[local.type]
  const Icon = meta.icon

  const save = (patch: Partial<ItineraryBlock>) => {
    setLocal(p => ({ ...p, ...patch }))
    startTransition(() => { updateBlock(block.id, tripId, patch) })
  }

  const remove = () => startTransition(() => { deleteBlock(block.id, tripId) })

  return (
    <div className="group/block bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 hover:border-white/15 transition-colors">
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-slate-600 mt-2 cursor-grab opacity-0 group-hover/block:opacity-100 transition-opacity" />

        {/* Type selector */}
        <div className="relative">
          <button
            onClick={() => setTypeOpen(o => !o)}
            className={`flex items-center gap-1 mt-1.5 px-2 py-1 rounded-lg bg-white/[0.04] ${meta.color}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
          {typeOpen && (
            <div className="absolute z-20 mt-1 w-36 bg-panel border border-white/10 rounded-xl p-1 shadow-xl">
              {BLOCK_TYPES.map(t => {
                const m = BLOCK_META[t]
                const TIcon = m.icon
                return (
                  <button
                    key={t}
                    onClick={() => { save({ type: t as BlockType }); setTypeOpen(false) }}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm text-slate-300 hover:bg-white/5"
                  >
                    <TIcon className={`w-3.5 h-3.5 ${m.color}`} /> {m.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <input
            value={local.title}
            onChange={e => setLocal(p => ({ ...p, title: e.target.value }))}
            onBlur={e => save({ title: e.target.value })}
            placeholder="Title"
            className="w-full bg-transparent font-semibold text-white text-sm outline-none placeholder:text-slate-600"
          />
          <textarea
            value={local.description ?? ''}
            onChange={e => setLocal(p => ({ ...p, description: e.target.value }))}
            onBlur={e => save({ description: e.target.value })}
            placeholder="Description (optional)"
            rows={1}
            className="w-full bg-transparent text-sm text-slate-400 outline-none resize-none placeholder:text-slate-600"
          />
          <div className="flex flex-wrap gap-3 pt-1">
            <input
              value={local.time_start ?? ''}
              onChange={e => setLocal(p => ({ ...p, time_start: e.target.value }))}
              onBlur={e => save({ time_start: e.target.value })}
              placeholder="09:00"
              className="w-16 bg-white/[0.04] rounded-md px-2 py-1 text-xs text-slate-300 outline-none placeholder:text-slate-600"
            />
            <input
              value={local.location ?? ''}
              onChange={e => setLocal(p => ({ ...p, location: e.target.value }))}
              onBlur={e => save({ location: e.target.value })}
              placeholder="Location"
              className="flex-1 min-w-24 bg-white/[0.04] rounded-md px-2 py-1 text-xs text-slate-300 outline-none placeholder:text-slate-600"
            />
          </div>
        </div>

        <button
          onClick={remove}
          className="text-slate-600 hover:text-red-400 mt-1.5 opacity-0 group-hover/block:opacity-100 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
