import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import Stripe from 'stripe';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchBlockedDates } from './ical-parser.js';
import { generateICalFeed } from './ical-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

const PROPERTY_NAMES = {
  '5br': 'The Classic · 5-Bedroom Home',
  '6br': 'The Grand · 6-Bedroom Home'
};

// Webhook must be raw
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata;
    
    const booking = {
      id: crypto.randomUUID(),
      propertyId: metadata.propertyId,
      checkIn: metadata.checkIn,
      checkOut: metadata.checkOut,
      guestName: metadata.guestName,
      guestEmail: metadata.guestEmail,
      guestPhone: metadata.guestPhone,
      numGuests: parseInt(metadata.numGuests, 10),
      stripeSessionId: session.id,
      amountPaid: session.amount_total / 100,
      createdAt: new Date().toISOString()
    };

    // Save to bookings.json
    try {
      const bookingsPath = path.join(__dirname, 'bookings.json');
      let bookings = [];
      if (fs.existsSync(bookingsPath)) {
        bookings = JSON.parse(fs.readFileSync(bookingsPath, 'utf8'));
      }
      bookings.push(booking);
      fs.writeFileSync(bookingsPath, JSON.stringify(bookings, null, 2));
    } catch (err) {
      console.error('Error saving booking:', err);
    }

    const propName = PROPERTY_NAMES[booking.propertyId] || booking.propertyId;

    // Send Guest Email
    try {
      await resend.emails.send({
        from: 'LizzyPlace <noreply@lizzyplace.com>',
        to: booking.guestEmail,
        subject: 'Booking Confirmation - LizzyPlace',
        html: `<h1>Booking Confirmed!</h1>
               <p>Hi ${booking.guestName},</p>
               <p>Your booking for <strong>${propName}</strong> is confirmed.</p>
               <ul>
                 <li>Check-in: ${booking.checkIn}</li>
                 <li>Check-out: ${booking.checkOut}</li>
                 <li>Guests: ${booking.numGuests}</li>
                 <li>Amount Paid: $${booking.amountPaid.toFixed(2)}</li>
               </ul>
               <p>We look forward to hosting you!</p>`
      });
    } catch (err) {
      console.error('Error sending guest email:', err);
    }

    // Send Owner Email
    try {
      await resend.emails.send({
        from: 'LizzyPlace Notifications <noreply@lizzyplace.com>',
        to: process.env.OWNER_EMAIL,
        subject: `New Booking: ${propName}`,
        html: `<h1>New Booking Received</h1>
               <p><strong>Property:</strong> ${propName}</p>
               <p><strong>Guest:</strong> ${booking.guestName} (${booking.guestEmail}, ${booking.guestPhone})</p>
               <p><strong>Dates:</strong> ${booking.checkIn} to ${booking.checkOut}</p>
               <p><strong>Guests:</strong> ${booking.numGuests}</p>
               <p><strong>Total Paid:</strong> $${booking.amountPaid.toFixed(2)}</p>`
      });
    } catch (err) {
      console.error('Error sending owner email:', err);
    }
  }

  res.json({ received: true });
});

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.get('/api/availability/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    if (!PROPERTY_NAMES[propertyId]) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }
    const blockedDatesSet = await fetchBlockedDates(propertyId);
    res.json({
      blockedDates: Array.from(blockedDatesSet),
      pricePerNight: parseInt(process.env.PRICE_PER_NIGHT, 10) || 500
    });
  } catch (err) {
    console.error('Error fetching availability:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut, guestName, guestEmail, guestPhone, numGuests } = req.body;
    
    if (!PROPERTY_NAMES[propertyId]) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ error: 'Check-out must be after check-in' });
    }

    const blockedDatesSet = await fetchBlockedDates(propertyId);
    
    // Check for overlap
    let conflict = false;
    const tempDate = new Date(checkInDate);
    tempDate.setUTCHours(12,0,0,0);
    const endDate = new Date(checkOutDate);
    endDate.setUTCHours(12,0,0,0);
    
    while(tempDate < endDate) {
      const iso = tempDate.toISOString().split('T')[0];
      if (blockedDatesSet.has(iso)) {
        conflict = true;
        break;
      }
      tempDate.setUTCDate(tempDate.getUTCDate() + 1);
    }

    if (conflict) {
      return res.status(400).json({ error: 'Dates are not available' });
    }

    // Calc nights
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const pricePerNight = parseInt(process.env.PRICE_PER_NIGHT, 10) || 500;
    const totalAmount = nights * pricePerNight * 100; // in cents
    
    const propName = PROPERTY_NAMES[propertyId];

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: guestEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Stay at ${propName}`,
              description: `${checkIn} to ${checkOut} (${nights} nights, ${numGuests} guests)`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        propertyId,
        checkIn,
        checkOut,
        guestName,
        guestEmail,
        guestPhone,
        numGuests: numGuests.toString()
      },
      success_url: `${process.env.FRONTEND_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/booking/cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/calendar/:propertyId.ics', (req, res) => {
  const { propertyId } = req.params;
  if (!PROPERTY_NAMES[propertyId]) {
    return res.status(400).send('Invalid property ID');
  }
  
  const ical = generateICalFeed(propertyId);
  res.set('Content-Type', 'text/calendar; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="${propertyId}.ics"`);
  res.send(ical);
});

app.get('/api/booking-status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    let matchingBooking = null;
    try {
      const bookingsPath = path.join(__dirname, 'bookings.json');
      if (fs.existsSync(bookingsPath)) {
        const bookings = JSON.parse(fs.readFileSync(bookingsPath, 'utf8'));
        matchingBooking = bookings.find(b => b.stripeSessionId === sessionId) || null;
      }
    } catch (err) {
      console.error('Error reading local bookings:', err);
    }

    res.json({
      status: session.payment_status,
      booking: matchingBooking
    });
  } catch (err) {
    console.error('Error retrieving session:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
