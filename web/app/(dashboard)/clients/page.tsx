import { createClient } from '@/lib/supabase/server'
import { Users, Mail, Phone } from 'lucide-react'

export default async function ClientsPage() {
  const supabase = createClient()
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, email, phone, created_at, trips(count)')
    .order('created_at', { ascending: false })

  const list = clients ?? []

  return (
    <div className="animate-slide-up">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Clients</h1>
        <p className="text-sm text-slate-400 mt-1">{list.length} total</p>
      </header>

      {list.length > 0 ? (
        <div className="card divide-y divide-white/[0.06]">
          {list.map(c => (
            <div key={c.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 rounded-full bg-brand/15 flex items-center justify-center text-sm font-bold text-brand">
                {c.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{c.name}</p>
                <div className="flex gap-4 text-sm text-slate-400">
                  {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>}
                  {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-16 text-center">
          <Users className="w-8 h-8 text-white/20 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No clients yet. They're added automatically when you create trips.</p>
        </div>
      )}
    </div>
  )
}
