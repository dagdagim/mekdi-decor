import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Quote } from '@/lib/types';
import { sendQuoteOfferEmail } from '@/lib/email';

export async function GET() {
  try {
    const quotes = await db.getQuotes();
    return NextResponse.json({
      success: true,
      data: quotes,
      total: quotes.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : [];
    const subtotal = items.reduce((acc: number, item: any) => acc + (Number(item.subtotal) || (Number(item.quantity || 1) * Number(item.unitPrice || 0))), 0);
    const transportCost = Number(body.transportCost) || 0;
    const installationCost = Number(body.installationCost) || 0;
    const discountAmount = Number(body.discountAmount) || 0;
    const totalAmount = body.totalAmount ? Number(body.totalAmount) : (subtotal + transportCost + installationCost - discountAmount);

    const quoteId = body.id || `q-${Date.now()}`;
    const quoteNumber = body.quoteNumber || `MD-QT-2026-${Math.floor(100 + Math.random() * 900)}`;

    const formattedItems = items.map((it: any, idx: number) => ({
      id: it.id || `qi-${quoteId}-${idx + 1}`,
      quoteId: quoteId,
      itemTitle: it.itemTitle || 'Custom Decor Item',
      itemDescription: it.itemDescription || '',
      quantity: Number(it.quantity) || 1,
      unitPrice: Number(it.unitPrice) || 0,
      subtotal: Number(it.subtotal) || ((Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)),
      displayOrder: it.displayOrder || idx + 1,
    }));

    const created: Quote = {
      id: quoteId,
      quoteNumber,
      eventId: body.eventId || `e-${Date.now()}`,
      customerId: body.customerId || 'c-001',
      customerName: body.customerName || 'Private Client',
      customerEmail: body.customerEmail || 'client@example.com',
      customerPhone: body.customerPhone || '+251 911 000 000',
      eventTitle: body.eventTitle || 'Bespoke Event Decoration',
      eventType: body.eventType || 'Wedding',
      eventDate: body.eventDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      venueName: body.venueName || 'Grand Ballroom',
      guestCount: Number(body.guestCount) || 150,
      decorationStyle: body.decorationStyle || 'Luxury',
      title: body.title || `${body.eventTitle || 'Event'} Decoration Proposal`,
      status: body.status || 'SENT',
      validityDate: body.validityDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      depositPercentage: Number(body.depositPercentage) || 50,
      items: formattedItems,
      subtotal,
      transportCost,
      installationCost,
      discountAmount,
      taxAmount: 0,
      totalAmount,
      currency: body.currency || 'ETB',
      termsAndConditions:
        body.termsAndConditions ||
        '1. 50% deposit secures the reserved date in Mekdi Decor production calendar.\n2. Final balance due 7 calendar days before event date.\n3. Setup begins 12 hours prior to guest arrival.',
      notes: body.notes || undefined,
      createdAt: new Date().toISOString(),
    };

    const saved = await db.createQuote(created);

    // Send Quote Offer Email with Payment Link to Customer
    let emailSent = false;
    if (saved.customerEmail && saved.customerEmail.includes('@')) {
      try {
        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const origin =
          request.headers.get('origin') ||
          (host ? `${protocol}://${host}` : '') ||
          process.env.NEXT_PUBLIC_APP_URL ||
          'http://localhost:3002';
        const quotePaymentUrl = `${origin}/quotes/${saved.id}`;

        emailSent = await sendQuoteOfferEmail({
          toEmail: saved.customerEmail,
          customerName: saved.customerName || 'Valued Client',
          quoteNumber: saved.quoteNumber,
          quoteId: saved.id,
          eventTitle: saved.eventTitle,
          eventType: saved.eventType,
          eventDate: saved.eventDate,
          venueName: saved.venueName,
          guestCount: saved.guestCount,
          totalAmount: saved.totalAmount,
          depositPercentage: saved.depositPercentage || 50,
          currency: saved.currency || 'ETB',
          validityDate: saved.validityDate,
          quotePaymentUrl,
        });
      } catch (emailErr) {
        console.warn('Quote offer email warning:', emailErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: emailSent
          ? `Quote generated and official payment invoice dispatched to ${saved.customerEmail}`
          : 'Quote created successfully',
        data: saved,
        emailSent,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create quote' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const id = body.id || body.quoteNumber;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Quote ID or Quote Number is required' },
        { status: 400 }
      );
    }

    if (body.status) {
      await db.updateQuoteStatus(id, body.status);
    }

    const updated = await db.updateQuote(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Quote updated successfully',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || searchParams.get('quoteNumber');
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Quote ID query parameter is required' },
        { status: 400 }
      );
    }

    const deleted = await db.deleteQuote(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Quote deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
