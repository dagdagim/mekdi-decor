import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { MessageItem } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId') || undefined;

  const messages = await db.getMessages(eventId);

  return NextResponse.json({
    success: true,
    data: messages,
    total: messages.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      eventId: body.eventId || 'e-108',
      senderName: body.senderName || 'Client',
      senderRole: body.senderRole || 'CUSTOMER',
      content: body.content,
      quoteReferenceId: body.quoteReferenceId,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    const saved = await db.createMessage(newMsg);

    return NextResponse.json(
      {
        success: true,
        data: saved,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save message' }, { status: 500 });
  }
}
