'use client'

import { useState } from 'react'
import { UserPlus, Copy, Check, Trash2 } from 'lucide-react'

type Member = { id: string; full_name: string | null; role: string }
type Invite = { id: string; email: string; role: string; token: string; created_at: string }

export default function TeamSection({
  members,
  invites,
}: {
  members: Member[]
  invites: Invite[]
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('agent')
  const [loading, setLoading] = useState(false)
  const [inviteUrl, setInviteUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInviteUrl('')

    const { data: { session } } = await (await import('@/lib/supabase/client')).createClient().auth.getSession()
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token ?? ''}`,
      },
      body: JSON.stringify({ email, role }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error || 'Failed'); setLoading(false); return }
    setInviteUrl(json.inviteUrl)
    setEmail('')
    setLoading(false)
  }

  const copy = async () => {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <h2 className="font-semibold mb-4">Team</h2>

      {/* Members */}
      <div className="card divide-y divide-white/[0.06] mb-6">
        {members.map(m => (
          <div key={m.id} className="flex items-center justify-between px-5 py-3.5">
            <div>
              <p className="text-sm font-medium">{m.full_name || 'Unnamed'}</p>
              <p className="text-xs text-slate-500 capitalize">{m.role}</p>
            </div>
          </div>
        ))}
        {members.length === 0 && (
          <div className="px-5 py-4 text-sm text-slate-500">No team members yet</div>
        )}
      </div>

      {/* Invite form */}
      <form onSubmit={sendInvite} className="flex gap-2 mb-4">
        <input
          className="input flex-1"
          type="email"
          placeholder="colleague@agency.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <select
          className="input w-28"
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          <option value="agent">Agent</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
          <UserPlus className="w-4 h-4" />
          {loading ? 'Inviting…' : 'Invite'}
        </button>
      </form>

      {error && (
        <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 mb-4">
          {error}
        </div>
      )}

      {inviteUrl && (
        <div className="card p-4 flex items-center gap-3 mb-6">
          <p className="text-xs text-slate-400 truncate flex-1 font-mono">{inviteUrl}</p>
          <button onClick={copy} className="btn-secondary py-1.5 px-3 shrink-0">
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}

      {/* Pending invites */}
      {invites.length > 0 && (
        <>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pending invites</h3>
          <div className="card divide-y divide-white/[0.06]">
            {invites.map(inv => (
              <div key={inv.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm">{inv.email}</p>
                  <p className="text-xs text-slate-500 capitalize">{inv.role}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
