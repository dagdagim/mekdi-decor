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

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update quote' }, { status: 500 });
  }
}
