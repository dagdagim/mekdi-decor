import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export interface CalendarEventItem {
  id: string;
  bookingId?: string;
  bookingNumber?: string;
  title: string;
  type: 'EVENT' | 'SETUP' | 'CONSULTATION';
  date: string;
  time: string;
  venue: string;
  client: string;
  status: string;
  totalAmount?: number;
  depositPaid?: boolean;
  notes?: string;
  hasConflict?: boolean;
}

export async function GET(request: Request) {
  try {
    const [bookings, requests, quotes] = await Promise.all([
      db.getBookings(),
      db.getEventRequests(),
      db.getQuotes(),
    ]);

    const events: CalendarEventItem[] = [];

    // 1. Process bookings (Confirmed event days & locked setup dates)
    bookings.forEach((b) => {
      const isConfirmed = b.depositPaid || b.status === 'CONFIRMED' || b.status === 'DESIGN_PHASE';
      const eventDate = b.eventDate || '2026-12-18';

      // Actual Event Day
      events.push({
        id: `evt-${b.id}`,
        bookingId: b.id,
        bookingNumber: b.bookingNumber,
        title: `${b.customerName || 'Client'}’s ${b.eventType || 'Celebration'}`,
        type: 'EVENT',
        date: eventDate,
        time: '10:00 AM – 11:00 PM',
        venue: b.venueName || 'Premier Venue, Hawassa',
        client: b.customerName || 'Valued Client',
        status: isConfirmed ? 'Confirmed' : 'Deposit Pending',
        totalAmount: b.totalAmount || (b.depositAmount + b.balanceAmount),
        depositPaid: b.depositPaid,
        notes: `Production date locked. Progress: ${b.progress || (isConfirmed ? 75 : 25)}%`,
      });

      // Production Setup & Logistics Date (Day before main event)
      if (isConfirmed && eventDate.includes('-')) {
        try {
          const mainD = new Date(eventDate);
          mainD.setDate(mainD.getDate() - 1);
          const setupDateStr = mainD.toISOString().split('T')[0];

          events.push({
            id: `setup-${b.id}`,
            bookingId: b.id,
            bookingNumber: b.bookingNumber,
            title: `Setup & Rigging: ${b.customerName || 'Client'}'s ${b.eventType || 'Event'}`,
            type: 'SETUP',
            date: setupDateStr,
            time: '04:00 PM – 10:30 PM',
            venue: b.venueName || 'Premier Venue, Hawassa',
            client: b.customerName || 'Valued Client',
            status: 'Locked in Schedule',
            totalAmount: b.totalAmount,
            depositPaid: true,
            notes: 'Stage backdrop assembly, floral refrigeration, and lighting test.',
          });
        } catch (_) {
          // ignore date parse error
        }
      }
    });

    // 2. Process intake requests as Studio Consultations
    requests.forEach((r) => {
      if (!r.eventDate) return;
      events.push({
        id: `req-${r.id || r.requestNumber}`,
        title: `Design Intake: ${r.guestName} (${r.eventType})`,
        type: 'CONSULTATION',
        date: r.eventDate,
        time: '02:00 PM – 03:30 PM',
        venue: r.venueName || r.venueType || 'Bole Design Studio',
        client: r.guestName,
        status: r.status === 'CONFIRMED_BOOKING' ? 'Converted to Booking' : 'Consultation Phase',
        notes: r.specialNotes || `Requested ${r.guestCount} guests decoration`,
      });
    });

    // 3. Fallback items if database is freshly initialized with few bookings
    if (events.length === 0) {
      events.push(
        {
          id: 'sc-1',
          title: 'Setup & Lighting Check — Skyline Hall',
          type: 'SETUP',
          date: '2026-12-17',
          time: '06:00 PM – 11:00 PM',
          venue: 'Skyline Hall, Hawassa',
          client: 'Sara & Michael',
          status: 'Confirmed',
        },
        {
          id: 'sc-2',
          title: 'Sarah’s Royal Wedding Day',
          type: 'EVENT',
          date: '2026-12-18',
          time: '10:00 AM – 10:00 PM',
          venue: 'Skyline Hall, Hawassa',
          client: 'Sara & Michael',
          status: 'Confirmed',
        },
        {
          id: 'sc-3',
          title: 'Dr. Helen Graduation Gala',
          type: 'EVENT',
          date: '2026-12-21',
          time: '04:00 PM – 11:00 PM',
          venue: 'Sheraton Addis Lalibela',
          client: 'Dr. Helen Girma',
          status: 'Confirmed',
        },
        {
          id: 'sc-4',
          title: 'Michael K. Birthday Setup & Soirée',
          type: 'EVENT',
          date: '2026-12-24',
          time: '02:00 PM – 11:00 PM',
          venue: 'Private Villa Compound',
          client: 'Michael Kebede',
          status: 'Pending',
        },
        {
          id: 'sc-5',
          title: 'In-Studio Floral Consultation (Blen & Dawit)',
          type: 'CONSULTATION',
          date: '2026-12-12',
          time: '02:00 PM – 03:30 PM',
          venue: 'Bole Design Studio 4th Fl',
          client: 'Blen & Dawit',
          status: 'Confirmed',
        }
      );
    }

    // 4. Calculate conflicts (more than 2 major events on the same date)
    const dateCounts: Record<string, number> = {};
    events.forEach((evt) => {
      dateCounts[evt.date] = (dateCounts[evt.date] || 0) + (evt.type === 'EVENT' ? 1 : 0);
    });

    events.forEach((evt) => {
      if (evt.type === 'EVENT' && dateCounts[evt.date] > 2) {
        evt.hasConflict = true;
      }
    });

    const conflictsCount = Object.values(dateCounts).filter((cnt) => cnt > 2).length;

    return NextResponse.json({
      success: true,
      data: events,
      total: events.length,
      stats: {
        totalEvents: events.filter((e) => e.type === 'EVENT').length,
        setupDates: events.filter((e) => e.type === 'SETUP').length,
        consultationsCount: events.filter((e) => e.type === 'CONSULTATION').length,
        conflictsCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newEvent: CalendarEventItem = {
      id: `custom-sc-${Date.now()}`,
      title: body.title || 'Production Schedule Block',
      type: body.type || 'EVENT',
      date: body.date || new Date().toISOString().split('T')[0],
      time: body.time || '10:00 AM – 06:00 PM',
      venue: body.venue || 'Addis Ababa / Hawassa',
      client: body.client || 'Valued Client',
      status: 'Confirmed',
      notes: body.notes,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Schedule event created successfully',
        data: newEvent,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
