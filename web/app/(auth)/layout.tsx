import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <nav className="px-6 py-5">
        <Link href="/" className="text-lg font-bold tracking-tight">TripLens</Link>
      </nav>
      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        {children}
      </main>
    </div>
  )
}
