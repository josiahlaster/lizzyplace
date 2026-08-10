import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@11.1.0?target=deno"

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Service role to bypass RLS for updates

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Missing signature', { status: 400 })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    let event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const bookingId = session.client_reference_id

      if (bookingId) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // 1. Mark booking as confirmed
        const { data: booking, error: updateError } = await supabase
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('id', bookingId)
          .select()
          .single()

        if (updateError) throw updateError

        console.log(`Successfully confirmed booking: ${bookingId}`)

        // 2. Send transaction confirmation email via Resend if API key is set
        const resendApiKey = Deno.env.get('RESEND_API_KEY')
        if (resendApiKey && booking) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
              from: "Lizzy's Place Stays <stays@resend.dev>", // Or verified domain
              to: [booking.guest_email],
              subject: "Your Stay at Lizzy's Place is Confirmed!",
              html: `
                <h3>Thank you, ${booking.guest_name}!</h3>
                <p>Your booking at <strong>${booking.property_id === '5br' ? "The Classic (5BR Home)" : "The Grand (6BR Home)"}</strong> is confirmed.</p>
                <p><strong>Check-in:</strong> ${booking.start_date}</p>
                <p><strong>Check-out:</strong> ${booking.end_date}</p>
                <p><strong>Total Paid:</strong> $${booking.total_price}</p>
                <p>We look forward to hosting you. Check-in instructions will be sent as your stay approaches.</p>
              `
            })
          })
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
