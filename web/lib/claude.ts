import Anthropic from '@anthropic-ai/sdk'
import type { GeneratedItinerary, TripStyle } from './types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface GenerateParams {
  destination: string
  days: number
  budget: number
  style: TripStyle
  clientName?: string
  notes?: string
}

export async function generateItinerary(params: GenerateParams): Promise<GeneratedItinerary> {
  const { destination, days, budget, style, clientName, notes } = params

  const styleGuide: Record<TripStyle, string> = {
    budget: 'affordable stays, street food, free attractions, public transport',
    luxury: 'five-star hotels, fine dining, private transfers, exclusive experiences',
    adventure: 'outdoor activities, unique experiences, off-the-beaten-path, active itinerary',
    balanced: 'mix of comfort and value, good restaurants, popular sights with local gems',
  }

  const prompt = `You are an expert travel planner creating a detailed itinerary for a travel agency.

Client: ${clientName || 'Valued Traveler'}
Destination: ${destination}
Duration: ${days} days
Budget: ₹${budget.toLocaleString()}
Travel style: ${style} — ${styleGuide[style]}
${notes ? `Special notes: ${notes}` : ''}

Create a complete, realistic day-by-day itinerary. Return ONLY valid JSON matching this exact structure:

{
  "title": "A compelling trip title",
  "summary": "2-3 sentence trip overview",
  "highlights": ["top highlight 1", "top highlight 2", "top highlight 3"],
  "days": [
    {
      "dayNumber": 1,
      "title": "Arrival & First Impressions",
      "blocks": [
        {
          "type": "transport",
          "title": "Airport Transfer",
          "description": "Private transfer to hotel",
          "time_start": "14:00",
          "duration": "45 minutes",
          "location": "Airport → Hotel District"
        },
        {
          "type": "hotel",
          "title": "Hotel Name",
          "description": "Check-in and freshen up",
          "location": "City Center"
        },
        {
          "type": "activity",
          "title": "Evening exploration",
          "description": "Walk the old town streets",
          "time_start": "18:00",
          "duration": "2 hours",
          "location": "Old Town"
        },
        {
          "type": "meal",
          "title": "Dinner at local restaurant",
          "description": "Experience authentic local cuisine",
          "time_start": "20:00",
          "duration": "1.5 hours",
          "location": "Restaurant name, address"
        }
      ]
    }
  ]
}

Block types available: activity, hotel, transport, meal, flight, note
Each day should have 4-6 blocks. Be specific with names, times, and locations.
Return ONLY the JSON object, no markdown, no explanation.`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  // Strip any accidental markdown wrapping
  const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()

  return JSON.parse(clean) as GeneratedItinerary
}
