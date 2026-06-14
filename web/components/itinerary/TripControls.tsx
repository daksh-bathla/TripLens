'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Eye, Copy, Check, Sparkles, FileDown, LayoutTemplate } from 'lucide-react'
import type { TripStatus } from '@/lib/types'
import { updateTrip, deleteTrip, generateAndSaveItinerary, saveTripAsTemplate } from '@/app/(dashboard)/trips/actions'

const STATUSES: TripStatus[] = ['draft', 'proposed', 'confirmed', 'completed']

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
      <div className="card p-4">
        <p className="label mb-2">AI Generate</p>
        <button
          onClick={generate}
          disabled={generating}
          className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 bg-brand hover:bg-brand/90 text-white transition-colors disabled:opacity-60"
        >
          <Sparkles className="w-4 h-4" />
          {generating ? 'Generating…' : 'Generate Itinerary'}
        </button>
        {genError && (
          <p className="text-xs text-red-400 mt-2">{genError}</p>
        )}
        {generating && (
          <p className="text-xs text-slate-400 mt-2 text-center">Takes ~15s for a full itinerary</p>
        )}
      </div>

      <div className="card p-4">
        <p className="label mb-2">Status</p>
        <div className="grid grid-cols-2 gap-1.5">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-2 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                status === s ? 'bg-brand text-white' : 'bg-white/[0.04] text-slate-400 hover:bg-white/10'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <p className="label mb-2">Client Portal</p>
        <button
          onClick={togglePublish}
          className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors mb-2 ${
            published ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/[0.06] text-slate-300 hover:bg-white/10'
          }`}
        >
          {published ? 'Published — Live' : 'Publish to client'}
        </button>

        {published && (
          <>
            <div className="flex gap-1.5">
              <button onClick={copyLink} className="btn-secondary flex-1 justify-center py-2 text-xs">
                {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy link</>}
              </button>
              <a href={portalUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary py-2 px-3">
                <Eye className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 break-all">{portalUrl}</p>
          </>
        )}
      </div>

      <div className="card p-4">
        <p className="label mb-2">Export & Reuse</p>
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
            ? <><Check className="w-4 h-4" /> Saved</>
            : <><LayoutTemplate className="w-4 h-4" /> {tplState === 'saving' ? 'Saving…' : 'Save as template'}</>}
        </button>
      </div>

      <button
        onClick={remove}
        className="flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors px-1"
      >
        <Trash2 className="w-4 h-4" /> Delete trip
      </button>
    </div>
  )
}
