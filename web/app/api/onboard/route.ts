import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

// Service-role client — server only, never exposed to browser. Bypasses RLS.
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: Request) {
  try {
    const { agencyName, fullName } = await req.json()
    if (!agencyName?.trim()) {
      return NextResponse.json({ error: 'Agency name is required' }, { status: 400 })
    }

    // Identify the caller from their session — never trust a userId from the body.
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Not signed in. If email confirmation is enabled, confirm your email then log in.' },
        { status: 401 }
      )
    }

    const admin = adminClient()

    // Already provisioned? Just refresh the name.
    const { data: existing } = await admin
      .from('profiles')
      .select('id, agency_id')
      .eq('id', user.id)
      .maybeSingle()

    if (existing?.agency_id) {
      if (fullName?.trim()) {
        await admin.from('profiles').update({ full_name: fullName.trim() }).eq('id', user.id)
      }
      return NextResponse.json({ ok: true })
    }

    const { data: agency, error: agencyErr } = await admin
      .from('agencies')
      .insert({ name: agencyName.trim() })
      .select('id')
      .single()
    if (agencyErr) throw agencyErr

    const { error: profileErr } = await admin
      .from('profiles')
      .upsert({
        id: user.id,
        agency_id: agency.id,
        full_name: fullName?.trim() || null,
        role: 'owner',
      })
    if (profileErr) throw profileErr

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
