import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@11.1.0?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // This function creates and updates bookings, so it must use a server-only key.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SECRET_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const { propertyId, startDate, endDate, guestName, guestEmail, guestPhone, totalAmount } = await req.json()
    const now = new Date()
    const nowIso = now.toISOString()
    const holdExpiresAt = new Date(now.getTime() + 30 * 60 * 1000).toISOString()

    // Release expired checkout holds before checking for conflicts.
    await supabaseClient
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('status', 'pending')
      .lt('expires_at', nowIso)

    // Prevent overlapping confirmed bookings and active checkout holds.
    const { data: overlappingBookings, error: conflictError } = await supabaseClient
      .from('bookings')
      .select('id, status, expires_at')
      .eq('property_id', propertyId)
      .in('status', ['pending', 'confirmed'])
      .lt('start_date', endDate)
      .gt('end_date', startDate)

    if (conflictError) throw conflictError

    const hasConflict = overlappingBookings?.some((existingBooking) => (
      existingBooking.status === 'confirmed' ||
      !existingBooking.expires_at ||
      new Date(existingBooking.expires_at) > now
    ))

    if (hasConflict) {
      return new Response(JSON.stringify({ error: 'Dates are not available' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 409,
      })
    }

    // 1. Create a 30-minute pending booking hold in the database
    const { data: booking, error: dbError } = await supabaseClient
      .from('bookings')
      .insert({
        property_id: propertyId,
        start_date: startDate,
        end_date: endDate,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        total_price: totalAmount,
        status: 'pending',
        expires_at: holdExpiresAt
      })
      .select()
      .single()

    if (dbError) throw dbError

    // 2. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Stay at ${propertyId === '5br' ? "The Classic (5BR Home)" : "The Grand (6BR Home)"}`,
              description: `Dates: ${startDate} to ${endDate}`,
            },
            unit_amount: Math.round(totalAmount * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/booking/success?booking_id=${booking.id}`,
      cancel_url: `${req.headers.get('origin')}/booking/cancel?booking_id=${booking.id}`,
      client_reference_id: booking.id,
      metadata: {
        bookingId: booking.id,
      },
    })

    // 3. Update the pending booking with the Stripe Session ID
    const { error: sessionUpdateError } = await supabaseClient
      .from('bookings')
      .update({ stripe_session_id: session.id })
      .eq('id', booking.id)

    if (sessionUpdateError) throw sessionUpdateError

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
