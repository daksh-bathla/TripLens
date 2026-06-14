import { createClient } from '@/lib/supabase/server'
import { LayoutTemplate, MapPin } from 'lucide-react'
import TemplateActions from '@/components/templates/TemplateActions'

export default async function TemplatesPage() {
  const supabase = createClient()
  const { data: templates } = await supabase
    .from('templates')
    .select('id, title, destination, style, duration_days')
    .order('created_at', { ascending: false })

  const list = templates ?? []

  return (
    <div className="animate-slide-up">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Templates</h1>
        <p className="text-sm text-slate-400 mt-1">Reusable trip blueprints. Save a trip as a template to reuse it.</p>
      </header>

      {list.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map(t => (
            <div key={t.id} className="card p-5">
              <div className="w-9 h-9 bg-brand/15 rounded-lg flex items-center justify-center mb-3">
                <LayoutTemplate className="w-4 h-4 text-brand" />
              </div>
              <h3 className="font-semibold">{t.title}</h3>
              <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {t.destination}
              </p>
              <div className="flex gap-2 mt-3">
                <span className="badge bg-white/[0.06] text-slate-400 capitalize">{t.style}</span>
                {t.duration_days && <span className="badge bg-white/[0.06] text-slate-400">{t.duration_days} days</span>}
              </div>
              <TemplateActions templateId={t.id} />
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-16 text-center">
          <LayoutTemplate className="w-8 h-8 text-white/20 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No templates yet. Build a great trip, then save it as a template.</p>
        </div>
      )}
    </div>
  )
}
