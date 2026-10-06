import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get('email');
    const reqNumParam = searchParams.get('requestNumber') || searchParams.get('id');

    const cookieStore = cookies();
    const userCookie = cookieStore.get('mekdi_user');
    let sessionUser: any = null;
    if (userCookie?.value) {
      try {
        sessionUser = JSON.parse(userCookie.value);
      } catch {}
    }

    const allRequests = await db.getEventRequests();
    const allBookings = await db.getBookings();

    // Check if an event request has graduated to a confirmed booking with 50% deposit paid
    const isRequestConvertedToPaidBooking = (r: any) => {
      if (r.status === 'CONFIRMED_BOOKING' || r.status === 'CONVERTED' || r.status === 'ARCHIVED') {
        return true;
      }
      return allBookings.some(
        (b) =>
          (b.eventId === r.id ||
            b.id === r.bookingId ||
            b.id === `b-${r.id}` ||
            b.quoteId === `q-${r.id}` ||
            b.bookingNumber === r.bookingId) &&
          b.depositPaid
      );
    };

    // 1. Admin can access all requests
    if (sessionUser?.role === 'ADMIN') {
      let filtered = allRequests;
      if (emailParam) {
        filtered = filtered.filter(
          (r) => r.guestEmail?.toLowerCase() === emailParam.toLowerCase()
        );
      }
      return NextResponse.json({
        success: true,
        data: filtered,
        total: filtered.length,
      });
    }

    // 2. Authenticated Customer only receives active pending requests (excludes ones already paid & moved to bookings)
    if (sessionUser?.email) {
      const customerRequests = allRequests.filter(
        (r) =>
          r.guestEmail?.toLowerCase() === sessionUser.email.toLowerCase() &&
          !isRequestConvertedToPaidBooking(r)
      );
      return NextResponse.json({
        success: true,
        data: customerRequests,
        total: customerRequests.length,
      });
    }

    // 3. Unauthenticated lookup by specific email (excludes requests converted & paid)
    if (emailParam) {
      const emailRequests = allRequests.filter(
        (r) =>
          r.guestEmail?.toLowerCase() === emailParam.toLowerCase() &&
          !isRequestConvertedToPaidBooking(r)
      );
      return NextResponse.json({
        success: true,
        data: emailRequests,
        total: emailRequests.length,
      });
    }

    // 4. Unauthenticated lookup by request number
    if (reqNumParam) {
      const single = allRequests.filter(
        (r) => r.requestNumber === reqNumParam || r.id === reqNumParam
      );
      return NextResponse.json({
        success: true,
        data: single,
        total: single.length,
      });
    }

    // Privacy safeguard: do not return other clients' submissions
    return NextResponse.json({
      success: true,
      data: [],
      total: 0,
      message: 'Private client portal: Please sign in or enter your email to view your requests.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.guestName || !body.guestEmail || !body.guestPhone || !body.eventType || !body.eventDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required event fields (name, email, phone, type, date)' },
        { status: 400 }
      );
    }

    const created = await db.createEventRequest({
      guestName: body.guestName,
      guestEmail: body.guestEmail,
      guestPhone: body.guestPhone,
      eventType: body.eventType,
      eventDate: body.eventDate,
      guestCount: body.guestCount || 100,
      venueType: body.venueType || 'Hotel',
      venueName: body.venueName || '',
      stylePreference: body.stylePreference || 'Luxury',
      colorPalette: body.colorPalette || [],
      selectedServices: body.selectedServices || [],
      budgetRange: body.budgetRange || '',
      specialNotes: body.specialNotes || '',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Event request saved to database successfully',
        data: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Database transaction failed' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = body.id || body.requestNumber;
    if (!id || !body.status) {
      return NextResponse.json(
        { success: false, error: 'ID/requestNumber and status are required' },
        { status: 400 }
      );
    }

    const updated = await db.updateEventRequestStatus(id, body.status);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Event request status updated',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || searchParams.get('requestNumber');
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID or requestNumber query parameter is required' },
        { status: 400 }
      );
    }

    const deleted = await db.deleteEventRequest(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Event request deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
