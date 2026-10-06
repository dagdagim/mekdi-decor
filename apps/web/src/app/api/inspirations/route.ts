import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId') || 'c-001';

  const inspirations = await db.getSavedInspirations(customerId);
  return NextResponse.json({
    success: true,
    data: inspirations,
    total: inspirations.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const projectId = body.projectId || body.galleryItemId;
    const customerId = body.customerId || 'c-001';

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'Project ID or Gallery Item ID required' }, { status: 400 });
    }

    const isSaved = await db.toggleInspiration(projectId, customerId);

    return NextResponse.json({
      success: true,
      isSaved,
      message: isSaved ? 'Project added to your inspiration board' : 'Project removed from inspiration board',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update inspirations' }, { status: 500 });
  }
}
