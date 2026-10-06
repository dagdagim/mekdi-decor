import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and verification code are required.' },
        { status: 400 }
      );
    }

    const result = await db.verifyUserEmail(email, code);

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error || 'Invalid or expired verification code.' },
        { status: 400 }
      );
    }

    const user = result.user;
    const response = NextResponse.json({
      success: true,
      message: 'Email verified successfully! Welcome to Mekdi Decor.',
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isVerified: true,
      },
    });

    // Update session cookie
    response.cookies.set('mekdi_user', JSON.stringify({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isVerified: true,
    }), {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('Verify API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Verification failed.' },
      { status: 500 }
    );
  }
}
