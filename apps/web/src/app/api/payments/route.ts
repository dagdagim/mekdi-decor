import { NextResponse } from 'next/server';
import { PaymentFactory } from '@/lib/payment';
import { PaymentMethod } from '@/lib/types';
import { db } from '@/lib/db';
import { sendPaymentConfirmationEmail } from '@/lib/email';

export async function GET() {
  const payments = await db.getPayments();
  return NextResponse.json({
    success: true,
    data: payments,
    total: payments.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const method: PaymentMethod = body.provider || 'CHAPA';
    const provider = PaymentFactory.getProvider(method);

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

    const result = await provider.initializePayment({
      bookingId: body.bookingId || 'MD-BK-2026-056',
      customerId: body.customerId || body.customerEmail || 'c-001',
      customerName: body.customerName || 'Sara Tekle',
      customerEmail: body.customerEmail || 'mydeveloper444@gmail.com',
      customerPhone: body.customerPhone || '0911234567',
      amount: Number(body.amount) || 102500,
      currency: body.currency || 'ETB',
      description: body.description || '50% Deposit for Luxury Event Decoration',
      returnUrl:
        body.returnUrl ||
        `${appUrl}/payments/callback?quoteId=${body.quoteId || ''}&bookingId=${body.bookingId || ''}`,
    });

    const isChapa = method === 'CHAPA';

    // Record transaction in database
    const paymentRecord = await db.createPayment({
      id: `pay-${Date.now()}`,
      paymentReference: result.paymentReference,
      bookingId: body.bookingId || 'MD-BK-2026-056',
      customerId: body.customerId || body.customerEmail || 'c-001',
      customerName: body.customerName || 'Valued Client',
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      quoteId: body.quoteId,
      checkoutUrl: result.checkoutUrl,
      amount: Number(body.amount) || 102500,
      currency: body.currency || 'ETB',
      provider: method,
      status: isChapa ? 'PENDING' : 'SUCCESS',
      paymentType: body.paymentType || 'DEPOSIT',
      providerTransactionId: isChapa ? '' : `tx_${Date.now()}`,
      createdAt: new Date().toISOString(),
    });

    // If offline method (e.g. CBE Birr transfer) or instant Telebirr demo
    if (!isChapa) {
      if (body.quoteId) {
        await db.updateQuoteStatus(body.quoteId, 'ACCEPTED');
      }

      // Send official receipt email via Gmail SMTP
      try {
        await sendPaymentConfirmationEmail({
          toEmail: body.customerEmail || 'mydeveloper444@gmail.com',
          customerName: body.customerName || 'Valued Client',
          amount: Number(body.amount) || 102500,
          currency: body.currency || 'ETB',
          quoteNumber: body.quoteId || 'MD-QT-2026-108',
          eventTitle: body.description || 'Bespoke Celebration Plan',
          eventDate: 'Dec 18, 2026',
          venueName: 'Addis Ababa Premier Hall',
          provider: method,
          transactionRef: result.paymentReference || paymentRecord.id,
        });
      } catch (mailErr) {
        console.warn('Payment receipt email warning:', mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: isChapa
        ? 'Chapa payment session initiated. Redirecting to checkout...'
        : 'Payment processed successfully.',
      checkoutUrl: result.checkoutUrl,
      paymentReference: result.paymentReference,
      provider: method,
      status: paymentRecord.status,
      data: result,
      payment: paymentRecord,
    });
  } catch (error: any) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment initialization failed' },
      { status: 500 }
    );
  }
}
