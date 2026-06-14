import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { ItineraryDay, Trip } from '@/lib/types'

const BRAND = '#0058be'
const INK = '#0b1c30'

const styles = StyleSheet.create({
  page: { paddingTop: 48, paddingBottom: 56, paddingHorizontal: 48, fontSize: 11, color: '#1a2330', fontFamily: 'Helvetica' },
  agency: { fontSize: 9, letterSpacing: 2, color: BRAND, textTransform: 'uppercase', fontFamily: 'Helvetica-Bold', marginBottom: 8 },
  title: { fontSize: 26, fontFamily: 'Helvetica-Bold', color: INK, marginBottom: 8 },
  meta: { flexDirection: 'row', gap: 14, marginBottom: 4, fontSize: 10, color: '#5b6675' },
  rule: { borderBottomWidth: 1, borderBottomColor: '#e3e8f0', marginVertical: 20 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 14 },
  dayNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: BRAND, color: '#fff', fontSize: 11, fontFamily: 'Helvetica-Bold', textAlign: 'center', paddingTop: 5, marginRight: 10 },
  dayTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: INK },
  block: { flexDirection: 'row', marginBottom: 9, paddingLeft: 32 },
  blockTime: { width: 52, fontSize: 9, color: BRAND, fontFamily: 'Helvetica-Bold', paddingTop: 1 },
  blockBody: { flex: 1 },
  blockTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: INK },
  blockType: { fontSize: 8, color: '#9aa4b2', textTransform: 'uppercase', letterSpacing: 1 },
  blockDesc: { fontSize: 10, color: '#5b6675', marginTop: 2, lineHeight: 1.4 },
  blockLoc: { fontSize: 9, color: '#8590a0', marginTop: 2 },
  footer: { position: 'absolute', bottom: 28, left: 48, right: 48, fontSize: 8, color: '#9aa4b2', textAlign: 'center', borderTopWidth: 1, borderTopColor: '#e3e8f0', paddingTop: 10 },
})

function fmtDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function buildTripPdf({ trip, days, agencyName }: {
  trip: Trip
  days: ItineraryDay[]
  agencyName?: string
}) {
  const dateRange = [fmtDate(trip.start_date), fmtDate(trip.end_date)].filter(Boolean).join(' – ')

  return (
    <Document title={trip.title} author={agencyName || 'TripLens'}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.agency}>{agencyName || 'Your Travel Agency'}</Text>
        <Text style={styles.title}>{trip.title}</Text>
        <View style={styles.meta}>
          <Text>{trip.destination}</Text>
          {dateRange ? <Text>· {dateRange}</Text> : null}
          {trip.client_name ? <Text>· {trip.client_name}</Text> : null}
        </View>
        <View style={styles.rule} />

        {days.length === 0 ? (
          <Text style={{ color: '#9aa4b2' }}>Itinerary coming soon.</Text>
        ) : (
          days.map(day => {
            const blocks = (day.blocks ?? []).slice().sort((a, b) => a.position - b.position)
            return (
              <View key={day.id} wrap={false}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayNum}>{day.day_number}</Text>
                  <Text style={styles.dayTitle}>{day.title}</Text>
                </View>
                {blocks.map(b => (
                  <View key={b.id} style={styles.block}>
                    <Text style={styles.blockTime}>{b.time_start || ''}</Text>
                    <View style={styles.blockBody}>
                      <Text style={styles.blockType}>{b.type}</Text>
                      <Text style={styles.blockTitle}>{b.title}</Text>
                      {b.description ? <Text style={styles.blockDesc}>{b.description}</Text> : null}
                      {b.location ? <Text style={styles.blockLoc}>{b.location}</Text> : null}
                    </View>
                  </View>
                ))}
              </View>
            )
          })
        )}

        <Text style={styles.footer} fixed>
          Curated by {agencyName || 'your travel agency'} · Powered by TripLens
        </Text>
      </Page>
    </Document>
  )
}
