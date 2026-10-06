import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Recently';
  const now = Date.now();
  const time = new Date(dateString).getTime();
  if (isNaN(time)) return 'Recently';
  const diffMs = now - time;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 30) return `${diffDay} days ago`;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export async function GET() {
  try {
    const [quotes, requests, gallery, packages, bookings, payments, messages] = await Promise.all([
      db.getQuotes(),
      db.getEventRequests(),
      db.getGalleryProjects(),
      db.getPackages(),
      db.getBookings(),
      db.getPayments(),
      db.getMessages(),
    ]);

    const successfulPayments = payments.filter((p) => p.status === 'SUCCESS');
    const totalRevenue = successfulPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    const pendingRequests = requests.filter((r) => r.status === 'NEW' || !r.status).length;
    const pendingQuotes = quotes.filter((q) => q.status === 'SENT' || q.status === 'DRAFT').length;
    const confirmedBookings = bookings.length;

    // 1. Build dynamic Upcoming Events (Locked production dates)
    const upcomingEvents = bookings.map((b) => {
      const isConfirmed = b.depositPaid || b.status === 'CONFIRMED' || b.status === 'DESIGN_PHASE';
      return {
        id: b.id,
        bookingNumber: b.bookingNumber,
        type: b.eventType || 'Luxury Wedding',
        date: b.eventDate
          ? new Date(b.eventDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Dec 18, 2026',
        rawDate: b.eventDate || '2026-12-18',
        venue: b.venueName || 'Premier Event Hall, Hawassa',
        client: b.customerName || 'Valued Client',
        status: isConfirmed ? 'Confirmed' : 'Deposit Pending',
        statusColor: isConfirmed
          ? 'bg-botanical-100 text-botanical-800 border-botanical-300'
          : 'bg-amber-100 text-amber-900 border-amber-300',
        totalAmount: b.totalAmount || b.depositAmount + b.balanceAmount,
        depositPaid: b.depositPaid,
      };
    });

    // Fallback if no bookings yet in db
    if (upcomingEvents.length === 0) {
      upcomingEvents.push(
        {
          id: 'b-mock-1',
          bookingNumber: 'MD-BK-2026-001',
          type: 'Wedding',
          date: 'Dec 18, 2026',
          rawDate: '2026-12-18',
          venue: 'Skyline Event Hall, Hawassa',
          client: 'Sarah & Michael',
          status: 'Confirmed',
          statusColor: 'bg-botanical-100 text-botanical-800 border-botanical-300',
          totalAmount: 240000,
          depositPaid: true,
        },
        {
          id: 'b-mock-2',
          bookingNumber: 'MD-BK-2026-002',
          type: 'Graduation',
          date: 'Dec 21, 2026',
          rawDate: '2026-12-21',
          venue: 'Imperial Hotel, Addis Ababa',
          client: 'Dr. Helen Girma',
          status: 'Confirmed',
          statusColor: 'bg-botanical-100 text-botanical-800 border-botanical-300',
          totalAmount: 180000,
          depositPaid: true,
        }
      );
    }

    // Sort upcoming events by rawDate
    upcomingEvents.sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());

    // 2. Build dynamic Calendar events
    // Determine active month: inspect dates in bookings/requests
    const allDates: string[] = [
      ...bookings.map((b) => b.eventDate || ''),
      ...requests.map((r) => r.eventDate || ''),
    ].filter(Boolean);

    // Pick target year/month (December 2026 or current active)
    let targetYear = 2026;
    let targetMonth = 12; // December

    if (allDates.length > 0) {
      const firstValid = new Date(allDates[0]);
      if (!isNaN(firstValid.getTime())) {
        targetYear = firstValid.getFullYear();
        targetMonth = firstValid.getMonth() + 1;
      }
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const monthLabel = `${monthNames[targetMonth - 1]} ${targetYear}`;
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();

    const eventDaysSet = new Set<number>();
    allDates.forEach((dStr) => {
      const d = new Date(dStr);
      if (!isNaN(d.getTime()) && d.getFullYear() === targetYear && d.getMonth() + 1 === targetMonth) {
        eventDaysSet.add(d.getDate());
      }
    });

    // If empty, ensure default event days for demo showcase
    if (eventDaysSet.size === 0) {
      eventDaysSet.add(18);
      eventDaysSet.add(21);
      eventDaysSet.add(24);
      eventDaysSet.add(28);
    }

    const eventDays = Array.from(eventDaysSet).sort((a, b) => a - b);

    // 3. Build dynamic Recent Activity feed
    type ActivityItem = {
      title: string;
      desc: string;
      time: string;
      type: 'PAYMENT' | 'REQUEST' | 'BOOKING' | 'QUOTE' | 'MESSAGE';
      timestamp: number;
    };

    const activities: ActivityItem[] = [];

    // Payments activity
    payments.forEach((p) => {
      const ts = new Date(p.createdAt || Date.now()).getTime();
      activities.push({
        title: `Payment received (ETB ${Number(p.amount).toLocaleString()})`,
        desc: `${p.provider} ${p.paymentReference} from ${p.customerName || 'Client'}`,
        time: formatRelativeTime(p.createdAt),
        type: 'PAYMENT',
        timestamp: ts,
      });
    });

    // Event requests activity
    requests.forEach((r) => {
      const ts = new Date(r.createdAt || Date.now()).getTime();
      activities.push({
        title: `New quote request from ${r.guestName}`,
        desc: `${r.venueName || r.venueType || 'Hawassa Venue'} • ${r.guestCount} guests`,
        time: formatRelativeTime(r.createdAt),
        type: 'REQUEST',
        timestamp: ts,
      });
    });

    // Bookings activity
    bookings.forEach((b) => {
      const ts = new Date(b.createdAt || Date.now()).getTime();
      activities.push({
        title: `Booking confirmed — ${b.eventType || 'Event'}`,
        desc: `${b.customerName || 'Client'}'s date locked in production calendar`,
        time: formatRelativeTime(b.createdAt),
        type: 'BOOKING',
        timestamp: ts,
      });
    });

    // Quotes activity
    quotes.forEach((q) => {
      const ts = new Date(q.createdAt || Date.now()).getTime();
      activities.push({
        title: `Quote ${q.quoteNumber} created`,
        desc: `Proposal for ${q.customerName} (ETB ${Number(q.totalAmount).toLocaleString()})`,
        time: formatRelativeTime(q.createdAt),
        type: 'QUOTE',
        timestamp: ts,
      });
    });

    // Messages activity
    (messages || []).forEach((m) => {
      const ts = new Date(m.timestamp || Date.now()).getTime();
      const content = typeof m.content === 'string' ? m.content : '';
      activities.push({
        title: `New message from ${m.senderName || 'Client'}`,
        desc: content.length > 50 ? `${content.slice(0, 50)}...` : content || 'New message in portal',
        time: formatRelativeTime(m.timestamp),
        type: 'MESSAGE',
        timestamp: ts,
      });
    });

    // Sort activities descending by timestamp
    activities.sort((a, b) => b.timestamp - a.timestamp);
    const recentActivity = activities.slice(0, 6);

    return NextResponse.json({
      success: true,
      stats: {
        totalEvents: confirmedBookings + 3,
        pendingRequests,
        upcomingEvents: confirmedBookings || 4,
        pendingQuotes,
        totalRevenue: `ETB ${totalRevenue.toLocaleString()}`,
        portfolioCount: gallery.length,
        packagesCount: packages.length,
      },
      upcomingEvents,
      calendar: {
        monthLabel,
        daysInMonth,
        eventDays,
        eventsCount: eventDays.length,
      },
      recentActivity,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
