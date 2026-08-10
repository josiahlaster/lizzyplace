import { supabase } from './supabaseClient'

export async function fetchBlockedDates(propertyId) {
  const blockedSet = new Set()

  try {
    // 1. Fetch blocked dates from iCal sync and manual blocks
    const { data: otaBlocks, error: otaError } = await supabase
      .from('blocked_dates')
      .select('date')
      .eq('property_id', propertyId)

    if (otaError) throw otaError
    otaBlocks?.forEach(b => blockedSet.add(b.date))

    // 2. Fetch active direct bookings
    const { data: directBookings, error: dbError } = await supabase
      .from('bookings')
      .select('start_date, end_date')
      .eq('property_id', propertyId)
      .eq('status', 'confirmed')

    if (dbError) throw dbError

    directBookings?.forEach(booking => {
      const cur = new Date(booking.start_date)
      const end = new Date(booking.end_date)
      while (cur < end) {
        blockedSet.add(cur.toISOString().slice(0, 10))
        cur.setDate(cur.getDate() + 1)
      }
    })
  } catch (err) {
    console.error(`Failed to fetch blocked dates for ${propertyId}:`, err)
  }

  return blockedSet
}
