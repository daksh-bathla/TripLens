import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink flex flex-col relative overflow-hidden">
      {/* Aurora background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand/20 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 rounded-full bg-sky-500/10 blur-[100px]" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-violet-500/10 blur-[100px]" />
      </div>

      <nav className="relative px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand to-sky-400 flex items-center justify-center shadow-lg shadow-brand/30">
            <span className="text-white font-bold text-xs">TL</span>
          </div>
          <span className="text-base font-bold tracking-tight gradient-text">TripLens</span>
        </Link>
      </nav>

      <main className="relative flex-1 flex items-center justify-center px-4 pb-16">
        {children}
      </main>
    </div>
  )
}
