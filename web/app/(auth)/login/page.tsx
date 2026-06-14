'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-sm text-slate-400">
          New to TripLens?{' '}
          <Link href="/signup" className="text-brand font-semibold hover:underline">Create an account</Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="you@agency.com"
            value={form.email} onChange={e => set('email', e.target.value)} required />
        </div>
        <div>
          <label className="label">
            Password
            <Link href="/forgot-password" className="float-right text-xs text-slate-500 hover:text-brand font-normal">
              Forgot password?
            </Link>
          </label>
          <input className="input" type="password" placeholder="••••••••"
            value={form.password} onChange={e => set('password', e.target.value)} required />
        </div>

        {error && (
          <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
