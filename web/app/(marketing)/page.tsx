import Link from 'next/link'
import { ArrowRight, Sparkles, Globe, Users, FileText } from 'lucide-react'

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI itinerary drafts in seconds',
    desc: 'Describe the trip. TripLens drafts a structured, day-by-day plan. You refine, personalize, and publish — AI assists, you stay in control.',
  },
  {
    icon: Globe,
    title: 'Cinematic client portals',
    desc: 'Every trip gets a premium shareable portal. Clients get their full itinerary, documents, and updates — beautiful on any device.',
  },
  {
    icon: Users,
    title: 'Built for agency teams',
    desc: 'Multiple agents, shared trip library, client database, reusable templates. Your whole agency in one calm workspace.',
  },
  {
    icon: FileText,
    title: 'Branded PDF export',
    desc: 'Export any itinerary as a polished, branded PDF. Preview, then send or print in one click.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink">
      <nav className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <span className="text-lg font-bold tracking-tight">TripLens</span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary py-2">
            Start free <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-white/[0.06] text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-8 border border-white/10">
          <Sparkles className="w-3.5 h-3.5 text-brand" /> The modern workspace for travel agencies
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
          Create premium travel<br />
          <span className="text-brand">experiences in minutes</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          TripLens replaces Canva itineraries, Google Docs chaos, and WhatsApp overload
          with one calm, premium workflow. AI drafts. You perfect it. Clients love it.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/signup" className="btn-primary px-8 py-3 text-base">
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/demo" className="btn-secondary px-8 py-3 text-base">
            See a demo portal
          </Link>
        </div>
        <p className="text-sm text-slate-500 mt-5">No credit card required · Setup in 2 minutes</p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-7">
              <div className="w-10 h-10 bg-brand/15 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-brand" />
              </div>
              <h3 className="font-bold mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="card p-12 text-center bg-gradient-to-b from-panel to-ink">
          <h2 className="text-3xl font-bold mb-4">Ready to upgrade your agency?</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Join agencies saving 3+ hours per trip. Run every trip through TripLens.
          </p>
          <Link href="/signup" className="btn-primary px-8 py-3 text-base">
            Start your free trial <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-8 px-6 text-center">
        <p className="text-sm text-slate-500">© 2026 TripLens · The client experience layer for travel agencies</p>
      </footer>
    </div>
  )
}
