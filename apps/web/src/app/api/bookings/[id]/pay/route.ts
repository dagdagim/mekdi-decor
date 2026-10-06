import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendPaymentConfirmationEmail } from '@/lib/email';
import { PaymentMethod } from '@/lib/types';
import { PaymentFactory } from '@/lib/payment';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await db.getBookingById(params.id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const provider: PaymentMethod = body.provider || 'CHAPA';
    const paymentType: 'DEPOSIT' | 'BALANCE' | 'FULL' =
      body.paymentType || (!booking.depositPaid ? 'DEPOSIT' : 'BALANCE');

    const paymentAmount =
      Number(body.amount) ||
      (paymentType === 'DEPOSIT' ? booking.depositAmount : booking.balanceAmount);

    const isChapa = provider === 'CHAPA';

    if (isChapa) {
      const host =
        request.headers.get('x-forwarded-host') ||
        request.headers.get('host') ||
        'localhost:3002';
      const proto =
        request.headers.get('x-forwarded-proto') ||
        (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
      const dynamicOrigin = `${proto}://${host}`;

      const appUrl =
        body.origin ||
        dynamicOrigin ||
        process.env.NEXT_PUBLIC_APP_URL ||
        'http://localhost:3002';

      const returnUrl =
        body.returnUrl ||
        `${appUrl}/payments/callback?bookingId=${encodeURIComponent(booking.id)}&type=${paymentType}`;

      const chapaProvider = PaymentFactory.getProvider('CHAPA');

      const initResult = await chapaProvider.initializePayment({
        bookingId: booking.id,
        customerId: booking.customerEmail || 'c-001',
        customerName: booking.customerName || 'Valued Client',
        customerEmail: booking.customerEmail || 'mydeveloper444@gmail.com',
        customerPhone: body.phone || booking.customerPhone || '0911234567',
        amount: paymentAmount,
        currency: booking.currency || 'ETB',
        description: `${paymentType === 'DEPOSIT' ? '50% Deposit' : 'Remaining Balance'} for ${booking.eventTitle}`,
        returnUrl,
      });

      // Save pending transaction
      const payment = await db.createPayment({
        id: `pay-${Date.now()}`,
        paymentReference: initResult.paymentReference,
        bookingId: booking.bookingNumber || booking.id,
        customerId: booking.customerEmail || 'c-001',
        customerName: booking.customerName || 'Valued Client',
        customerEmail: booking.customerEmail,
        customerPhone: body.phone || booking.customerPhone,
        checkoutUrl: initResult.checkoutUrl,
        amount: paymentAmount,
        currency: booking.currency || 'ETB',
        provider: 'CHAPA',
        status: 'PENDING',
        paymentType,
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        isChapa: true,
        checkoutUrl: initResult.checkoutUrl,
        paymentReference: initResult.paymentReference,
        payment,
        message: 'Chapa checkout initialized. Proceed to secure gateway.',
      });
    }

    // Direct / Offline Provider (Telebirr USSD simulation, CBE Birr transfer)
    const txRef = `${provider}-TX-${Math.floor(100000 + Math.random() * 900000)}`;

    // 1. Record payment in database
    const payment = await db.createPayment({
      id: `pay-${Date.now()}`,
      paymentReference: txRef,
      bookingId: booking.bookingNumber || booking.id,
      customerId: booking.customerEmail || 'c-001',
      customerName: booking.customerName || 'Valued Client',
      amount: paymentAmount,
      currency: booking.currency || 'ETB',
      provider,
      status: 'SUCCESS',
      paymentType,
      providerTransactionId: `${provider.toLowerCase()}_live_${Date.now()}`,
      createdAt: new Date().toISOString(),
    });

    // 2. Update booking states
    const updates: any = {};
    if (paymentType === 'DEPOSIT') {
      updates.depositPaid = true;
      updates.status = 'DESIGN_PHASE';
      updates.progress = 65;
    } else if (paymentType === 'BALANCE') {
      updates.balancePaid = true;
      updates.status = 'PREPARATION';
      updates.progress = 90;
    } else if (paymentType === 'FULL') {
      updates.depositPaid = true;
      updates.balancePaid = true;
      updates.status = 'PREPARATION';
      updates.progress = 95;
    }

    const updatedBooking = await db.updateBooking(booking.id, updates);

    // 3. Send Payment Confirmation Receipt Email
    let emailSent = false;
    if (booking.customerEmail && booking.customerEmail.includes('@')) {
      try {
        emailSent = await sendPaymentConfirmationEmail({
          toEmail: booking.customerEmail,
          customerName: booking.customerName || 'Valued Client',
          amount: paymentAmount,
          currency: booking.currency || 'ETB',
          quoteNumber: booking.bookingNumber,
          eventTitle: booking.eventTitle || 'Bespoke Celebration Decoration',
          eventDate: booking.eventDate,
          venueName: booking.venueName,
          provider,
          transactionRef: txRef,
        });
      } catch (emailErr) {
        console.warn('Payment receipt email warning:', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${paymentType === 'DEPOSIT' ? '50% Deposit' : 'Remaining Balance'} confirmed! Receipt sent to ${booking.customerEmail}`,
      data: updatedBooking,
      payment,
      emailSent,
    });
  } catch (error: any) {
    console.error('Error processing booking payment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment processing failed' },
      { status: 500 }
    );
  }
}

function initResultRef() {
  return `MD-TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
}
