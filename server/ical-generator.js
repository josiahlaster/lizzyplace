import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateICalFeed(propertyId) {
  let bookings = [];
  try {
    const bookingsPath = path.join(__dirname, 'bookings.json');
    if (fs.existsSync(bookingsPath)) {
      bookings = JSON.parse(fs.readFileSync(bookingsPath, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading local bookings:', err);
  }

  const propertyBookings = bookings.filter(b => b.propertyId === propertyId);

  let ical = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//LizzyPlace//NONSGML v1.0//EN\r\n`;

  const now = new Date();
  const dtstamp = formatDateForICal(now) + 'T' + formatTimeForICal(now) + 'Z';

  for (const b of propertyBookings) {
    const start = b.checkIn.replace(/-/g, '');
    const end = b.checkOut.replace(/-/g, '');
    
    ical += `BEGIN:VEVENT\r\n`;
    ical += `UID:${b.id}@lizzyplace.com\r\n`;
    ical += `DTSTAMP:${dtstamp}\r\n`;
    ical += `DTSTART;VALUE=DATE:${start}\r\n`;
    ical += `DTEND;VALUE=DATE:${end}\r\n`;
    ical += `SUMMARY:LizzyPlace Booking\r\n`;
    ical += `END:VEVENT\r\n`;
  }

  ical += `END:VCALENDAR\r\n`;
  return ical;
}

function formatDateForICal(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function formatTimeForICal(date) {
  const h = String(date.getUTCHours()).padStart(2, '0');
  const m = String(date.getUTCMinutes()).padStart(2, '0');
  const s = String(date.getUTCSeconds()).padStart(2, '0');
  return `${h}${m}${s}`;
}
