import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('mekdi_user');

    if (!userCookie?.value) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const parsed = JSON.parse(userCookie.value);
    const dbUser = await db.findUserByEmail(parsed.email);

    if (!dbUser) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const { password_hash, ...sanitized } = dbUser;

    return NextResponse.json({
      authenticated: true,
      user: {
        id: sanitized.id,
        email: sanitized.email,
        fullName: sanitized.fullName,
        role: sanitized.role,
        isVerified: Boolean(sanitized.emailVerifiedAt),
        avatarUrl: sanitized.avatarUrl,
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
