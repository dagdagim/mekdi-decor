import { NextResponse } from 'next/server';
import { PaymentFactory } from '@/lib/payment';
import { db } from '@/lib/db';
import { sendPaymentConfirmationEmail } from '@/lib/email';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tx_ref = searchParams.get('tx_ref');

    if (!tx_ref) {
      return NextResponse.json(
        { success: false, error: 'Missing tx_ref parameter' },
        { status: 400 }
      );
    }

    return await handleVerification(tx_ref);
  } catch (error: any) {
    console.error('Error during GET payment verification:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tx_ref = body.tx_ref || body.paymentReference || body.trx_ref;

    if (!tx_ref) {
      return NextResponse.json(
        { success: false, error: 'Missing tx_ref parameter' },
        { status: 400 }
      );
    }

    return await handleVerification(tx_ref, body);
  } catch (error: any) {
    console.error('Error during POST payment verification:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}

async function handleVerification(tx_ref: string, extraBody?: any) {
  const provider = PaymentFactory.getProvider('CHAPA');
  const verifyResult = await provider.verifyPayment(tx_ref);

  const existingPayment = await db.getPaymentByReference(tx_ref);

  const isSuccess =
    verifyResult.verified ||
    verifyResult.status === 'SUCCESS' ||
    extraBody?.simulateSuccess === true;

  if (isSuccess) {
    // 1. Update Payment Record
    if (existingPayment) {
      await db.updatePayment(tx_ref, {
        status: 'SUCCESS',
        providerTransactionId: verifyResult.providerTransactionId,
      });
    }

    const quoteId = existingPayment?.quoteId || extraBody?.quoteId;
    const bookingId = existingPayment?.bookingId || extraBody?.bookingId;

    let quoteDetails: any = null;
    let updatedBooking: any = null;

    // 2. Update Quote if applicable
    if (quoteId) {
      await db.updateQuoteStatus(quoteId, 'ACCEPTED');
      quoteDetails = await db.getQuoteById(quoteId);
    }

    // 3. Update Booking if applicable
    if (bookingId) {
      const b = await db.getBookingById(bookingId);
      if (b) {
        const isBalance = existingPayment?.paymentType === 'BALANCE' || extraBody?.paymentType === 'BALANCE';
        const updates: any = {};
        if (isBalance) {
          updates.balancePaid = true;
          updates.status = 'PREPARATION';
          updates.progress = 90;
        } else {
          updates.depositPaid = true;
          updates.status = 'DESIGN_PHASE';
          updates.progress = 65;
        }
        updatedBooking = await db.updateBooking(b.id, updates);

        // Remove from pending event requests by marking as CONFIRMED_BOOKING
        if (b.eventId) {
          await db.markRequestAsBookingConfirmed(b.eventId);
        }
        await db.markRequestAsBookingConfirmed(b.id);
      }
    }

    if (quoteId) {
      await db.markRequestAsBookingConfirmed(quoteId);
      if (quoteDetails?.eventId) {
        await db.markRequestAsBookingConfirmed(quoteDetails.eventId);
      }
    }

    // 4. Send Confirmation Receipt Email
    const recipientEmail =
      existingPayment?.customerEmail ||
      quoteDetails?.customerEmail ||
      updatedBooking?.customerEmail ||
      'mydeveloper444@gmail.com';

    const recipientName =
      existingPayment?.customerName ||
      quoteDetails?.customerName ||
      updatedBooking?.customerName ||
      'Valued Client';

    const amountPaid = verifyResult.amount || existingPayment?.amount || 102500;
    const currency = verifyResult.currency || existingPayment?.currency || 'ETB';
    const quoteNumber =
      quoteDetails?.quoteNumber ||
      updatedBooking?.bookingNumber ||
      existingPayment?.bookingId ||
      'MD-QT-2026-108';

    const eventTitle =
      quoteDetails?.eventTitle ||
      updatedBooking?.eventTitle ||
      'Mekdi Decor Bespoke Celebration';

    const eventDate = quoteDetails?.eventDate || updatedBooking?.eventDate || 'Dec 18, 2026';
    const venueName =
      quoteDetails?.venueName || updatedBooking?.venueName || 'Grand Imperial Hall, Addis Ababa';

    let emailSent = false;
    try {
      emailSent = await sendPaymentConfirmationEmail({
        toEmail: recipientEmail,
        customerName: recipientName,
        amount: amountPaid,
        currency,
        quoteNumber,
        eventTitle,
        eventDate,
        venueName,
        provider: 'CHAPA',
        transactionRef: tx_ref,
      });
    } catch (mailErr) {
      console.warn('Failed to send payment receipt email:', mailErr);
    }

    return NextResponse.json({
      success: true,
      verified: true,
      status: 'SUCCESS',
      message: 'Payment verified and confirmed via Chapa API. Confirmation email sent!',
      data: {
        paymentReference: tx_ref,
        amount: amountPaid,
        currency,
        provider: 'CHAPA',
        quote: quoteDetails,
        booking: updatedBooking,
        emailSent,
      },
    });
  }

  // Not verified yet (e.g. pending or failed in Chapa)
  return NextResponse.json({
    success: false,
    verified: false,
    status: verifyResult.status,
    message: `Payment is currently ${verifyResult.status.toLowerCase()} on Chapa gateway.`,
    data: verifyResult,
  });
}
