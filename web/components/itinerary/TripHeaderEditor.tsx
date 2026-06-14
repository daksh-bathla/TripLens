'use client'

import { useState } from 'react'
import { MapPin, Calendar, Wallet, Pencil, X } from 'lucide-react'
import type { Trip } from '@/lib/types'
import { updateTripDetails } from '@/app/(dashboard)/trips/actions'

const STYLES = ['budget', 'balanced', 'luxury', 'adventure']

export default function TripHeaderEditor({ trip }: { trip: Trip }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: trip.title,
    destination: trip.destination,
    client_name: trip.client_name ?? '',
    start_date: trip.start_date ?? '',
    end_date: trip.end_date ?? '',
    budget: trip.budget != null ? String(trip.budget) : '',
    style: trip.style,
  })

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const save = async () => {
    setSaving(true)
    const res = await updateTripDetails(trip.id, {
      title: form.title,
      destination: form.destination,
      client_name: form.client_name,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      budget: form.budget ? Number(form.budget) : null,
      style: form.style,
    })
    setSaving(false)
    if (res.error) { alert(res.error); return }
    setEditing(false)
  }

  if (!editing) {
    return (
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400 mb-1">{trip.client_name || 'No client'}</p>
            <h1 className="text-3xl font-bold mb-4">{trip.title}</h1>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="btn-secondary py-1.5 px-3 text-xs shrink-0"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="badge bg-white/[0.06] text-slate-300 gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> {trip.destination}
          </span>
          {trip.start_date && (
            <span className="badge bg-white/[0.06] text-slate-300 gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(trip.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              {trip.end_date && ` – ${new Date(trip.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
            </span>
          )}
          {trip.budget != null && (
            <span className="badge bg-white/[0.06] text-slate-300 gap-1.5">
              <Wallet className="w-3.5 h-3.5" /> ₹{Number(trip.budget).toLocaleString('en-IN')}
            </span>
          )}
          <span className="badge bg-white/[0.06] text-slate-300 capitalize">{trip.style}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Edit trip details</h2>
        <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input className="input" value={form.title} onChange={e => set('title', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Destination</label>
            <input className="input" value={form.destination} onChange={e => set('destination', e.target.value)} />
          </div>
          <div>
            <label className="label">Client Name</label>
            <input className="input" value={form.client_name} onChange={e => set('client_name', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Start Date</label>
            <input className="input" type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
          </div>
          <div>
            <label className="label">End Date</label>
            <input className="input" type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Budget (₹)</label>
            <input className="input" type="number" value={form.budget} onChange={e => set('budget', e.target.value)} />
          </div>
          <div>
            <label className="label">Style</label>
            <select className="input capitalize" value={form.style} onChange={e => set('style', e.target.value)}>
              {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={save} disabled={saving} className="btn-primary justify-center py-2 px-5 text-sm disabled:opacity-60">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button onClick={() => setEditing(false)} className="btn-secondary py-2 px-4 text-sm">Cancel</button>
        </div>
      </div>
    </div>
  )
}
