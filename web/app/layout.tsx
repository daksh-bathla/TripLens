import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
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
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
