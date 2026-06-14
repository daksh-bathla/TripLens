'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { createTrip } from '../actions'

const STYLES = [
  { id: 'budget', label: 'Budget' },
  { id: 'balanced', label: 'Balanced' },
  { id: 'luxury', label: 'Luxury' },
  { id: 'adventure', label: 'Adventure' },
]

export default function NewTripPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '', destination: '', client_name: '',
    start_date: '', end_date: '', budget: '', style: 'balanced',
  })

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.destination.trim()) return
    setLoading(true)
    setError('')
    try {
      await createTrip({
        title: form.title.trim(),
        destination: form.destination.trim(),
        client_name: form.client_name.trim() || undefined,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        budget: form.budget ? Number(form.budget) : null,
        style: form.style,
      })
    } catch (err) {
      // redirect() throws internally on success — only real errors land here
      const msg = err instanceof Error ? err.message : 'Failed to create trip'
      if (!msg.includes('NEXT_REDIRECT')) { setError(msg); setLoading(false) }
    }
  }

  return (
    <div className="max-w-xl animate-slide-up">
      <Link href="/trips" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors mb-6">
        <ChevronLeft className="w-4 h-4" /> Trips
      </Link>

      <h1 className="text-2xl font-bold mb-1">New Trip</h1>
      <p className="text-sm text-slate-400 mb-8">Start with the basics. Build the itinerary next.</p>

      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="label">Trip Title</label>
          <input className="input" placeholder="Sharma Family — Bali Honeymoon"
            value={form.title} onChange={e => set('title', e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Destination</label>
            <input className="input" placeholder="Bali, Indonesia"
              value={form.destination} onChange={e => set('destination', e.target.value)} required />
          </div>
          <div>
            <label className="label">Client Name</label>
            <input className="input" placeholder="Rahul Sharma"
              value={form.client_name} onChange={e => set('client_name', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Start Date</label>
            <input className="input" type="date"
              value={form.start_date} onChange={e => set('start_date', e.target.value)} />
          </div>
          <div>
            <label className="label">End Date</label>
            <input className="input" type="date"
              value={form.end_date} onChange={e => set('end_date', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Budget (₹)</label>
            <input className="input" type="number" placeholder="200000"
              value={form.budget} onChange={e => set('budget', e.target.value)} />
          </div>
          <div>
            <label className="label">Style</label>
            <select className="input" value={form.style} onChange={e => set('style', e.target.value)}>
              {STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
          {loading ? 'Creating…' : 'Create Trip'}
        </button>
      </form>
    </div>
  )
}
