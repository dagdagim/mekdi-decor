import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const quote = await db.getQuoteById(params.id);

  if (!quote) {
    return NextResponse.json(
      { success: false, error: 'Quotation not found in database' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: quote,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await db.updateQuoteStatus(params.id, body.status);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      );
    }

    if (updated) {
      // Proactively notify Telegram user if linked
      try {
        const { TelegramBotService } = await import('@/lib/telegram/bot');
        const customer = (await db.getCustomers()).find(
          (c) => c.id === updated.customerId || c.email?.toLowerCase() === updated.customerEmail?.toLowerCase()
        );
        if (customer?.telegramUserId) {
          const actionText =
            body.status === 'ACCEPTED'
              ? '✨ Quote Accepted! Your decorative vision is confirmed.'
              : body.status === 'REVISION_REQUESTED'
              ? '📝 Change request received for your quote.'
              : `Quote status updated: ${body.status}`;

          TelegramBotService.sendNotification(customer.telegramUserId, {
            title: '🌸 MEKDI DECOR QUOTE UPDATE',
            body: `${actionText}\n\nQuote: ${updated.quoteNumber}\nTotal: ${Number(updated.totalAmount).toLocaleString()} ETB`,
            buttonText: 'VIEW QUOTE DETAILS',
            deepLinkParam: `quote_${updated.id}`,
          }).catch(() => {});
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update quote' }, { status: 500 });
  }
}
