import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function fetchBlockedDates(propertyId) {
  // 1. fetch Airbnb iCal feed
  const icalUrl = propertyId === '5br' ? process.env.ICAL_URL_5BR : process.env.ICAL_URL_6BR;
  const blockedDates = new Set();
  
  if (icalUrl) {
    try {
      const response = await fetch(icalUrl);
      if (response.ok) {
        const text = await response.text();
        // unfold lines
        const unfolded = text.replace(/\r\n[ \t]/g, '');
        const lines = unfolded.split('\r\n');
        
        let inEvent = false;
        let start = null;
        let end = null;
        
        for (const line of lines) {
          if (line === 'BEGIN:VEVENT') inEvent = true;
          else if (line === 'END:VEVENT') {
            inEvent = false;
            if (start && end) {
              addDateRange(blockedDates, start, end);
            }
            start = null;
            end = null;
          } else if (inEvent) {
            if (line.startsWith('DTSTART')) {
              start = extractDate(line);
            } else if (line.startsWith('DTEND')) {
              end = extractDate(line);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching iCal:', err);
    }
  }

  // 2. Local bookings
  try {
    const bookingsPath = path.join(__dirname, 'bookings.json');
    if (fs.existsSync(bookingsPath)) {
      const bookings = JSON.parse(fs.readFileSync(bookingsPath, 'utf8'));
      for (const b of bookings) {
        if (b.propertyId === propertyId) {
          addDateRange(blockedDates, b.checkIn, b.checkOut);
        }
      }
    }
  } catch (err) {
    console.error('Error reading local bookings:', err);
  }

  return blockedDates;
}

function extractDate(line) {
  // Extracts date as YYYY-MM-DD string
  // DTSTART;VALUE=DATE:20240101
  // DTSTART:20240101T150000Z
  const match = line.match(/:(\d{4})(\d{2})(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return null;
}

function addDateRange(set, startStr, endStr) {
  // Start and end are 'YYYY-MM-DD'
  const start = new Date(startStr);
  const end = new Date(endStr);
  
  // To avoid timezone issues, set time to noon
  start.setUTCHours(12, 0, 0, 0);
  end.setUTCHours(12, 0, 0, 0);
  
  for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
    const iso = d.toISOString().split('T')[0];
    set.add(iso);
  }
}
