import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const result = await db.validateCredentials(email, password);

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error || 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = result.user;
    const isVerified = Boolean(user.emailVerifiedAt);

    const response = NextResponse.json({
      success: true,
      isVerified,
      message: isVerified ? 'Signed in successfully!' : 'Please verify your email to unlock all features.',
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isVerified,
      },
    });

    // Set cookie session
    response.cookies.set('mekdi_user', JSON.stringify({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isVerified,
    }), {
      path: '/',
      httpOnly: false, // accessible to client for reactive navbar
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
