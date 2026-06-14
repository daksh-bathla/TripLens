import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: { default: 'TripLens', template: '%s · TripLens' },
  description: 'Create premium travel itineraries in minutes. The modern workflow platform for travel agencies.',
  openGraph: {
    title: 'TripLens — Premium Travel Itineraries for Agencies',
    description: 'AI-assisted travel planning. Beautiful client portals. Save hours per trip.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body>{children}</body>
    </html>
  )
}
