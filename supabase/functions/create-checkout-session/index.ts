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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const { propertyId, startDate, endDate, guestName, guestEmail, guestPhone, totalAmount } = await req.json()

    // 1. Create a pending booking in the database
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
        status: 'pending'
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
    await supabaseClient
      .from('bookings')
      .update({ stripe_session_id: session.id })
      .eq('id', booking.id)

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
