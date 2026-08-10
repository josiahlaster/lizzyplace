import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// iCal URLs provided by host listing settings
const OTA_FEEDS = {
  '5br': {
    airbnb: 'https://www.airbnb.com/calendar/ical/1191526833797890858.ics',
    vrbo: Deno.env.get('VRBO_ICAL_5BR') ?? '',
  },
  '6br': {
    airbnb: 'https://www.airbnb.com/calendar/ical/1414760083961093369.ics',
    vrbo: Deno.env.get('VRBO_ICAL_6BR') ?? '',
  },
}

function parseICal(text: string) {
  const dates: string[] = []
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    .replace(/\n[ \t]/g, '') // unfold
    .split('\n')

  let inEvent = false
  let dtStart: Date | null = null
  let dtEnd: Date | null = null

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true
      dtStart = null
      dtEnd = null
    }
    if (line === 'END:VEVENT') {
      if (dtStart && dtEnd) {
        const cur = new Date(dtStart)
        while (cur < dtEnd) {
          dates.push(cur.toISOString().slice(0, 10))
          cur.setDate(cur.getDate() + 1)
        }
      }
      inEvent = false
    }
    if (!inEvent) continue
    const [key, ...rest] = line.split(':')
    const val = rest.join(':').trim()
    const baseKey = key.split(';')[0]
    if (baseKey === 'DTSTART') dtStart = parseICalDate(val)
    if (baseKey === 'DTEND') dtEnd = parseICalDate(val)
  }
  return dates
}

function parseICalDate(val: string) {
  const clean = val.replace('Z', '')
  const y = clean.slice(0, 4), m = clean.slice(4, 6), d = clean.slice(6, 8)
  return new Date(`${y}-${m}-${d}`)
}

serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Clear old OTA blocks to avoid stale data (but keep manual admin blocks!)
    const { error: deleteError } = await supabase
      .from('blocked_dates')
      .delete()
      .neq('source', 'manual')

    if (deleteError) throw deleteError

    const allBlocks: { property_id: string; date: string; source: string; notes: string }[] = []

    for (const propertyId of ['5br', '6br'] as const) {
      const feeds = OTA_FEEDS[propertyId]

      // Sync Airbnb
      if (feeds.airbnb) {
        console.log(`Syncing Airbnb for ${propertyId}...`)
        const res = await fetch(feeds.airbnb)
        if (res.ok) {
          const text = await res.text()
          const dates = parseICal(text)
          dates.forEach(d => {
            allBlocks.push({
              property_id: propertyId,
              date: d,
              source: 'airbnb',
              notes: 'Imported from Airbnb iCal'
            })
          })
        }
      }

      // Sync VRBO
      if (feeds.vrbo) {
        console.log(`Syncing VRBO for ${propertyId}...`)
        const res = await fetch(feeds.vrbo)
        if (res.ok) {
          const text = await res.text()
          const dates = parseICal(text)
          dates.forEach(d => {
            allBlocks.push({
              property_id: propertyId,
              date: d,
              source: 'vrbo',
              notes: 'Imported from VRBO iCal'
            })
          })
        }
      }
    }

    if (allBlocks.length > 0) {
      const { error: insertError } = await supabase
        .from('blocked_dates')
        .insert(allBlocks)

      if (insertError) throw insertError
    }

    return new Response(JSON.stringify({ success: true, count: allBlocks.length }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
