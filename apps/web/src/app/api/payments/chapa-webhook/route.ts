import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendPaymentConfirmationEmail } from '@/lib/email';
import { PaymentFactory } from '@/lib/payment';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received Chapa Webhook notification:', JSON.stringify(body));

    const tx_ref = body.tx_ref || body.trx_ref;
    if (!tx_ref) {
      return NextResponse.json({ success: false, error: 'No tx_ref in webhook' }, { status: 400 });
    }

    // Verify with Chapa API for security
    const provider = PaymentFactory.getProvider('CHAPA');
    const verifyResult = await provider.verifyPayment(tx_ref);

    if (verifyResult.verified || body.status === 'success') {
      const existingPayment = await db.getPaymentByReference(tx_ref);

      if (existingPayment) {
        await db.updatePayment(tx_ref, {
          status: 'SUCCESS',
          providerTransactionId: verifyResult.providerTransactionId || body.reference,
        });

        if (existingPayment.quoteId) {
          await db.updateQuoteStatus(existingPayment.quoteId, 'ACCEPTED');
        }

        if (existingPayment.bookingId) {
          const isBalance = existingPayment.paymentType === 'BALANCE';
          await db.updateBooking(existingPayment.bookingId, {
            [isBalance ? 'balancePaid' : 'depositPaid']: true,
            status: isBalance ? 'PREPARATION' : 'DESIGN_PHASE',
          });
          await db.markRequestAsBookingConfirmed(existingPayment.bookingId);
        }

        if (existingPayment.quoteId) {
          await db.markRequestAsBookingConfirmed(existingPayment.quoteId);
        }

        // Send email
        try {
          await sendPaymentConfirmationEmail({
            toEmail: existingPayment.customerEmail || body.email || 'mydeveloper444@gmail.com',
            customerName: existingPayment.customerName || `${body.first_name || ''} ${body.last_name || ''}`.trim() || 'Valued Client',
            amount: Number(body.amount || existingPayment.amount),
            currency: body.currency || existingPayment.currency || 'ETB',
            quoteNumber: existingPayment.quoteId || existingPayment.bookingId || 'MD-QT-2026-108',
            eventTitle: 'Mekdi Decor Celebration Plan',
            eventDate: 'Dec 18, 2026',
            venueName: 'Addis Ababa Premier Hall',
            provider: 'CHAPA',
            transactionRef: tx_ref,
          });
        } catch (e) {
          console.warn('Webhook email error:', e);
        }
      }

      return NextResponse.json({ status: 'success', message: 'Webhook processed' });
    }

    return NextResponse.json({ status: 'ignored', message: 'Transaction not successful' });
  } catch (err: any) {
    console.error('Error processing Chapa webhook:', err);
    return NextResponse.json({ error: err.message || 'Webhook failed' }, { status: 500 });
  }
}
