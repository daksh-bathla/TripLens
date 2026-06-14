'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="text-4xl mb-4">📬</div>
        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
        <p className="text-slate-400 mb-6">Sent a reset link to <strong className="text-white">{email}</strong></p>
        <Link href="/login" className="text-brand text-sm hover:underline">Back to login</Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Reset your password</h1>
        <p className="text-sm text-slate-400">
          Remember it?{' '}
          <Link href="/login" className="text-brand font-semibold hover:underline">Sign in</Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="you@agency.com"
            value={email} onChange={e => setEmail(e.target.value)} required />
        </div>

        {error && (
          <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
    </div>
  )
}
