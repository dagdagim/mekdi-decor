import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const services = await db.getServices();
  return NextResponse.json({
    success: true,
    data: services,
    total: services.length,
  });
}
