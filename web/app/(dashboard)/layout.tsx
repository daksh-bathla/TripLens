import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/dashboard/Sidebar'
import MobileNav from '@/components/dashboard/MobileNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('agency_id, agencies(name)')
    .eq('id', user.id)
    .single()

  const agencyName = (profile?.agencies as { name?: string } | null)?.name ?? 'Your Agency'

  return (
    <div className="min-h-screen bg-ink">
      <Sidebar agencyName={agencyName} />
      <MobileNav />
      <main className="md:ml-60 px-5 md:px-10 py-8 pb-24 md:pb-8 max-w-6xl">
        {children}
      </main>
    </div>
  )
}
