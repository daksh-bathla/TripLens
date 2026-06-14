'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({ agencyName: '', fullName: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Sign up WITHOUT metadata — avoids triggering the DB trigger's agency branch,
    // which may fail on some projects. We create agency+profile via API after.
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Signup failed — please try again.')
      setLoading(false)
      return
    }

    // Provision agency + profile via server action (uses service role, bypasses RLS)
    const res = await fetch('/api/onboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: data.user.id,
        agencyName: form.agencyName.trim(),
        fullName: form.fullName.trim(),
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error || 'Failed to set up your account. Please contact support.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Create your agency account</h1>
        <p className="text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-brand font-semibold hover:underline">Log in</Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Agency Name</label>
          <input
            className="input"
            type="text"
            placeholder="Wanderlust Travel Agency"
            value={form.agencyName}
            onChange={e => set('agencyName', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Your Name</label>
          <input
            className="input"
            type="text"
            placeholder="Priya Sharma"
            value={form.fullName}
            onChange={e => set('fullName', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Work Email</label>
          <input
            className="input"
            type="email"
            placeholder="priya@agency.com"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={e => set('password', e.target.value)}
            minLength={8}
            required
          />
        </div>

        {error && (
          <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-xs text-slate-500 text-center mt-6">
        By signing up, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}
