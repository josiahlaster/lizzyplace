import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

function formatDate(dateStr: string) {
  // input: '2026-08-10' -> output: '20260810'
  return dateStr.replace(/-/g, '')
}

serve(async (req) => {
  const url = new URL(req.url)
  const propertyId = url.searchParams.get('property')

  if (!propertyId || (propertyId !== '5br' && propertyId !== '6br')) {
    return new Response('Invalid property parameter (must be 5br or 6br)', { status: 400 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Query confirmed direct bookings
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, start_date, end_date, created_at')
      .eq('property_id', propertyId)
      .eq('status', 'confirmed')

    if (error) throw error

    // Query manual blocks
    const { data: manualBlocks, error: blockError } = await supabase
      .from('blocked_dates')
      .select('id, date, created_at')
      .eq('property_id', propertyId)
      .eq('source', 'manual')

    if (blockError) throw blockError

    let icalText = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Lizzys Place//Booking Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ].join('\r\n') + '\r\n'

    // Add direct bookings to feed
    if (bookings) {
      for (const booking of bookings) {
        // Format timestamp for DTSTAMP
        const stamp = new Date(booking.created_at).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
        const start = formatDate(booking.start_date)
        const end = formatDate(booking.end_date)

        icalText += [
          'BEGIN:VEVENT',
          `UID:${booking.id}@lizzysplace.com`,
          `DTSTAMP:${stamp}`,
          `DTSTART;VALUE=DATE:${start}`,
          `DTEND;VALUE=DATE:${end}`,
          `SUMMARY:Reserved - Lizzy's Place Direct`,
          'END:VEVENT'
        ].join('\r\n') + '\r\n'
      }
    }

    // Add manual blocks to feed
    if (manualBlocks) {
      // Group consecutive manual blocked dates into single events
      const sortedDates = manualBlocks
        .map(b => ({ date: new Date(b.date), id: b.id, raw: b.date }))
        .sort((a, b) => a.date.getTime() - b.date.getTime())

      let i = 0
      while (i < sortedDates.length) {
        const startRaw = sortedDates[i].raw
        const startObj = sortedDates[i].date
        let endObj = new Date(startObj)
        endObj.setDate(endObj.getDate() + 1)

        let j = i + 1
        while (j < sortedDates.length) {
          const nextDateObj = sortedDates[j].date
          const expectedNext = new Date(sortedDates[j-1].date)
          expectedNext.setDate(expectedNext.getDate() + 1)

          if (nextDateObj.toDateString() === expectedNext.toDateString()) {
            endObj.setDate(endObj.getDate() + 1)
            j++
          } else {
            break
          }
        }

        const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
        const start = formatDate(startRaw)
        const end = endObj.toISOString().slice(0, 10).replace(/-/g, '')

        icalText += [
          'BEGIN:VEVENT',
          `UID:manual-${sortedDates[i].id}@lizzysplace.com`,
          `DTSTAMP:${stamp}`,
          `DTSTART;VALUE=DATE:${start}`,
          `DTEND;VALUE=DATE:${end}`,
          `SUMMARY:Unavailable - Owner Block`,
          'END:VEVENT'
        ].join('\r\n') + '\r\n'

        i = j
      }
    }

    icalText += 'END:VCALENDAR\r\n'

    return new Response(icalText, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="availability-${propertyId}.ics"`
      },
      status: 200,
    })
  } catch (error) {
    return new Response(`Error generating iCal feed: ${error.message}`, { status: 500 })
  }
})
