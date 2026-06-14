'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Eye, Copy, Check, Sparkles, FileDown, LayoutTemplate } from 'lucide-react'
import type { TripStatus } from '@/lib/types'
import { updateTrip, deleteTrip, generateAndSaveItinerary, saveTripAsTemplate } from '@/app/(dashboard)/trips/actions'

const STATUSES: TripStatus[] = ['draft', 'proposed', 'confirmed', 'completed']

const STATUS_COLORS: Record<TripStatus, string> = {
  draft: 'bg-white/[0.04] text-slate-400 hover:bg-white/10',
  proposed: 'bg-blue-500/15 text-blue-300 hover:bg-blue-500/25',
  confirmed: 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25',
  completed: 'bg-white/[0.04] text-slate-400 hover:bg-white/10',
}

export default function TripControls({
  tripId, status, published, portalToken, appUrl,
}: {
  tripId: string
  status: TripStatus
  published: boolean
  portalToken: string
  appUrl: string
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [tplState, setTplState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const portalUrl = `${appUrl}/portal/${portalToken}`

  const generate = async () => {
    setGenerating(true)
    setGenError('')
    const result = await generateAndSaveItinerary(tripId)
    setGenerating(false)
    if (result.error) setGenError(result.error)
  }

  const saveTemplate = async () => {
    setTplState('saving')
    const result = await saveTripAsTemplate(tripId)
    setTplState(result.error ? 'idle' : 'saved')
    if (result.error) alert(result.error)
    else setTimeout(() => setTplState('idle'), 2000)
  }

  const setStatus = (s: TripStatus) =>
    startTransition(() => updateTrip(tripId, { status: s }))

  const togglePublish = () =>
    startTransition(() => updateTrip(tripId, { published: !published }))

  const copyLink = () => {
    navigator.clipboard.writeText(portalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const remove = () => {
    if (!confirm('Delete this trip permanently?')) return
    startTransition(() => deleteTrip(tripId))
  }

  return (
    <div className="space-y-4">
      {/* AI Generate */}
      <div className="card p-4">
        <p className="label mb-3">AI Generate</p>
        <button
          onClick={generate}
          disabled={generating}
          className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-white transition-all duration-200 cursor-pointer
            bg-gradient-to-r from-brand to-sky-500
            hover:from-brand/90 hover:to-sky-500/90
            active:scale-[0.98]
            disabled:opacity-60 disabled:cursor-not-allowed
            ${generating ? 'animate-glow-pulse' : 'shadow-lg shadow-brand/25'}`}
        >
          <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Generating…' : 'Generate Itinerary'}
        </button>
        {generating && (
          <p className="text-xs text-slate-400 mt-2 text-center">~15s for a full itinerary</p>
        )}
        {genError && (
          <p className="text-xs text-red-400 mt-2">{genError}</p>
        )}
      </div>

      {/* Status */}
      <div className="card p-4">
        <p className="label mb-3">Status</p>
        <div className="grid grid-cols-2 gap-1.5">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-2 py-2 rounded-lg text-xs font-semibold capitalize transition-all duration-150 cursor-pointer ${
                status === s
                  ? 'bg-brand text-white shadow-sm shadow-brand/30'
                  : STATUS_COLORS[s]
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Client Portal */}
      <div className="card p-4">
        <p className="label mb-3">Client Portal</p>
        <button
          onClick={togglePublish}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 mb-2 cursor-pointer ${
            published
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/25'
              : 'bg-white/[0.06] text-slate-300 border border-white/10 hover:bg-white/10'
          }`}
        >
          {published ? '● Published — Live' : 'Publish to client'}
        </button>

        {published && (
          <>
            <div className="flex gap-1.5">
              <button onClick={copyLink} className="btn-secondary flex-1 justify-center py-2 text-xs">
                {copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy link</>}
              </button>
              <a href={portalUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary py-2 px-3">
                <Eye className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-[11px] text-slate-600 mt-2 break-all">{portalUrl}</p>
          </>
        )}
      </div>

      {/* Export & Reuse */}
      <div className="card p-4">
        <p className="label mb-3">Export & Reuse</p>
        <a
          href={`/api/pdf/${tripId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary w-full justify-center py-2 text-sm mb-2"
        >
          <FileDown className="w-4 h-4" /> Download PDF
        </a>
        <button
          onClick={saveTemplate}
          disabled={tplState === 'saving'}
          className="btn-secondary w-full justify-center py-2 text-sm disabled:opacity-60"
        >
          {tplState === 'saved'
            ? <><Check className="w-4 h-4 text-emerald-400" /> Saved as template</>
            : <><LayoutTemplate className="w-4 h-4" /> {tplState === 'saving' ? 'Saving…' : 'Save as template'}</>}
        </button>
      </div>

      <button
        onClick={remove}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-400 transition-colors duration-150 px-1 cursor-pointer"
      >
        <Trash2 className="w-4 h-4" /> Delete trip
      </button>
    </div>
  )
}
