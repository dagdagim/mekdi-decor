import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get('email');
    const quoteIdParam = searchParams.get('quoteId');
    const bookingNumParam = searchParams.get('bookingNumber') || searchParams.get('id');

    const cookieStore = cookies();
    const userCookie = cookieStore.get('mekdi_user');
    let sessionUser: any = null;
    if (userCookie?.value) {
      try {
        sessionUser = JSON.parse(userCookie.value);
      } catch {}
    }

    const allBookings = await db.getBookings();

    // 1. Admin has access to all bookings
    if (sessionUser?.role === 'ADMIN') {
      let filtered = allBookings;
      if (emailParam) {
        filtered = filtered.filter(
          (b) => b.customerEmail?.toLowerCase() === emailParam.toLowerCase()
        );
      }
      if (quoteIdParam) {
        filtered = filtered.filter((b) => b.quoteId === quoteIdParam);
      }
      return NextResponse.json({
        success: true,
        data: filtered,
        total: filtered.length,
      });
    }

    // 2. Authenticated Customer only receives their own bookings
    if (sessionUser?.email) {
      const customerBookings = allBookings.filter(
        (b) => b.customerEmail?.toLowerCase() === sessionUser.email.toLowerCase()
      );
      return NextResponse.json({
        success: true,
        data: customerBookings,
        total: customerBookings.length,
      });
    }

    // 3. Unauthenticated lookup by specific email
    if (emailParam) {
      const emailBookings = allBookings.filter(
        (b) => b.customerEmail?.toLowerCase() === emailParam.toLowerCase()
      );
      return NextResponse.json({
        success: true,
        data: emailBookings,
        total: emailBookings.length,
      });
    }

    // 4. Unauthenticated lookup by booking number or quoteId
    if (bookingNumParam) {
      const single = allBookings.filter(
        (b) =>
          b.bookingNumber?.toLowerCase() === bookingNumParam.toLowerCase() ||
          b.id?.toLowerCase() === bookingNumParam.toLowerCase()
      );
      return NextResponse.json({
        success: true,
        data: single,
        total: single.length,
      });
    }

    if (quoteIdParam) {
      const quoteMatch = allBookings.filter((b) => b.quoteId === quoteIdParam);
      return NextResponse.json({
        success: true,
        data: quoteMatch,
        total: quoteMatch.length,
      });
    }

    // Privacy protected
    return NextResponse.json({
      success: true,
      data: [],
      total: 0,
      message: 'Private client portal: Please sign in or enter your email to view confidential bookings.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.quoteId && !body.eventId) {
      return NextResponse.json(
        { success: false, error: 'quoteId or eventId is required to create a booking' },
        { status: 400 }
      );
    }

    const bookingNumber = body.bookingNumber || `MD-BK-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newBooking = await db.createBooking({
      id: body.id || `b-${Date.now()}`,
      bookingNumber,
      eventId: body.eventId || `e-${Date.now()}`,
      quoteId: body.quoteId,
      depositAmount: Number(body.depositAmount) || 50000,
      balanceAmount: Number(body.balanceAmount) || 50000,
      depositPaid: Boolean(body.depositPaid),
      balancePaid: Boolean(body.balancePaid),
      balanceDueDate: body.balanceDueDate || '2026-12-15',
      contractSigned: Boolean(body.contractSigned),
      contractSignedAt: body.contractSigned ? new Date().toISOString() : undefined,
      status: body.status || 'DEPOSIT_PENDING',
      progress: body.progress || 25,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Booking created successfully',
        data: newBooking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}
