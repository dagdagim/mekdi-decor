import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const customers = await db.getCustomers();
  return NextResponse.json({
    success: true,
    data: customers,
    total: customers.length,
  });
}
