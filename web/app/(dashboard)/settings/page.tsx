import { createClient } from '@/lib/supabase/server'
import { Check } from 'lucide-react'

const PLANS = [
  { id: 'starter', name: 'Starter', price: '₹0', period: '/mo', features: ['10 trips/month', '1 agent seat', 'Client portals', 'Manual itinerary builder'] },
  { id: 'pro', name: 'Pro', price: '₹2,999', period: '/mo', features: ['Unlimited trips', '5 agent seats', 'AI itinerary drafts', 'PDF export', 'Custom branding'] },
  { id: 'agency_plus', name: 'Agency+', price: 'Custom', period: '', features: ['Everything in Pro', 'Unlimited seats', 'White-label portals', 'API access', 'Priority support'] },
]

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, agencies(name, plan)')
    .eq('id', user!.id)
    .single()

  const agency = profile?.agencies as { name?: string; plan?: string } | null
  const currentPlan = agency?.plan ?? 'starter'

  return (
    <div className="animate-slide-up max-w-3xl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
      </header>

      <section className="card p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-brand rounded-xl flex items-center justify-center text-lg font-bold">
            {agency?.name?.slice(0, 2).toUpperCase() || 'TL'}
          </div>
          <div>
            <h2 className="text-lg font-bold">{agency?.name || 'Your Agency'}</h2>
            <p className="text-sm text-slate-400">
              {profile?.full_name} · <span className="capitalize">{profile?.role}</span>
            </p>
          </div>
        </div>
      </section>

      <h2 className="font-semibold mb-4">Plan & Billing</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map(plan => {
          const isCurrent = plan.id === currentPlan
          return (
            <div key={plan.id} className={`card p-5 relative ${isCurrent ? 'ring-1 ring-brand border-brand/40' : ''}`}>
              {isCurrent && (
                <span className="absolute -top-2.5 left-4 bg-brand text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  CURRENT
                </span>
              )}
              <h3 className="font-bold">{plan.name}</h3>
              <p className="text-2xl font-bold mt-1">{plan.price}<span className="text-sm text-slate-500 font-normal">{plan.period}</span></p>
              <ul className="space-y-2 mt-4 mb-5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              {!isCurrent && (
                <button className="btn-primary w-full justify-center py-2">
                  {plan.id === 'agency_plus' ? 'Contact sales' : 'Upgrade'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
