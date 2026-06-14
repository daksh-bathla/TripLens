import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// POST /api/accept-invite — provision profile for invited user
export async function POST(req: Request) {
  const { token, userId, fullName } = await req.json()
  if (!token || !userId) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const admin = createAdminClient()

  const { data: invite, error: inviteErr } = await admin
    .from('team_invites')
    .select('agency_id, role, accepted_at')
    .eq('token', token)
    .single()

  if (inviteErr || !invite) return NextResponse.json({ error: 'Invalid invite' }, { status: 404 })
  if (invite.accepted_at) return NextResponse.json({ error: 'Invite already used' }, { status: 409 })

  // Create profile
  await admin.from('profiles').upsert({
    id: userId,
    agency_id: invite.agency_id,
    role: invite.role,
    full_name: fullName ?? 'Team Member',
  })

  // Mark invite accepted
  await admin.from('team_invites').update({ accepted_at: new Date().toISOString() }).eq('token', token)

  return NextResponse.json({ ok: true })
}
