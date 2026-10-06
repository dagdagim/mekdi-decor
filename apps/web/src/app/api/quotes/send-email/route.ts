import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendQuoteOfferEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quoteId, toEmail } = body;

    if (!quoteId && !toEmail) {
      return NextResponse.json(
        { success: false, error: 'quoteId or customer toEmail is required to send quote email' },
        { status: 400 }
      );
    }

    let quote = null;
    if (quoteId) {
      quote = await db.getQuoteById(quoteId);
    }
    if (!quote && toEmail) {
      const allQuotes = await db.getQuotes();
      quote = allQuotes.find(
        (q) => q.customerEmail?.toLowerCase() === toEmail.toLowerCase()
      ) || null;
    }

    if (!quote) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found in database' },
        { status: 404 }
      );
    }

    const recipient = toEmail || quote.customerEmail;
    if (!recipient || !recipient.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid recipient email address is required' },
        { status: 400 }
      );
    }

    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const origin =
      request.headers.get('origin') ||
      (host ? `${protocol}://${host}` : '') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3002';

    const quotePaymentUrl = `${origin}/quotes/${quote.id}`;

    const sent = await sendQuoteOfferEmail({
      toEmail: recipient,
      customerName: quote.customerName || 'Valued Client',
      quoteNumber: quote.quoteNumber || 'MKD-QT-2026',
      quoteId: quote.id,
      eventTitle: quote.eventTitle || 'Celebration Decoration',
      eventType: quote.eventType || 'Event',
      eventDate: quote.eventDate || '',
      venueName: quote.venueName || '',
      guestCount: quote.guestCount || 0,
      totalAmount: quote.totalAmount || 0,
      depositPercentage: quote.depositPercentage || 50,
      currency: quote.currency || 'ETB',
      validityDate: quote.validityDate,
      quotePaymentUrl,
    });

    if (!sent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to deliver quote email. Please verify SMTP configuration or recipient address.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Quotation and official payment link dispatched to ${recipient}`,
      recipient,
      quoteNumber: quote.quoteNumber,
      paymentUrl: quotePaymentUrl,
    });
  } catch (error: any) {
    console.error('Error in send-email route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
