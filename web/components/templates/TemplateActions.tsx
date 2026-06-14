'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { createTripFromTemplate, deleteTemplate } from '@/app/(dashboard)/trips/actions'

export default function TemplateActions({ templateId }: { templateId: string }) {
  const [busy, setBusy] = useState(false)

  const use = async () => {
    setBusy(true)
    try {
      await createTripFromTemplate(templateId)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (!msg.includes('NEXT_REDIRECT')) { setBusy(false); alert(msg || 'Failed') }
    }
  }

  const remove = async () => {
    if (!confirm('Delete this template?')) return
    setBusy(true)
    await deleteTemplate(templateId)
    setBusy(false)
  }

  return (
    <div className="flex gap-2 mt-4">
      <button onClick={use} disabled={busy} className="btn-primary flex-1 justify-center py-2 text-sm disabled:opacity-60">
        <Plus className="w-4 h-4" /> {busy ? 'Creating…' : 'Use template'}
      </button>
      <button onClick={remove} disabled={busy} className="btn-secondary py-2 px-3 text-slate-400 hover:text-red-300">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
