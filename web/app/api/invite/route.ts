import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// POST /api/invite — create invite (authenticated agency member)
export async function POST(req: Request) {
  const { email, role = 'agent' } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const admin = createAdminClient()

  // Get caller identity via cookie (passed from client)
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authErr } = await admin.auth.getUser(token)
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await admin
    .from('profiles')
    .select('agency_id')
    .eq('id', user.id)
    .single()

  if (!profile?.agency_id) return NextResponse.json({ error: 'No agency' }, { status: 400 })

  const { data: invite, error } = await admin
    .from('team_invites')
    .insert({ agency_id: profile.agency_id, email, role, created_by: user.id })
    .select('token')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite/${invite.token}`
  return NextResponse.json({ inviteUrl })
}
