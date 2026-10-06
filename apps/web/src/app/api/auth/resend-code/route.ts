import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required.' },
        { status: 400 }
      );
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email.' },
        { status: 404 }
      );
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json(
        { success: true, message: 'This email is already verified. You can log in directly.' }
      );
    }

    const newCode = await db.regenerateVerificationCode(email);
    if (!newCode) {
      return NextResponse.json(
        { success: false, error: 'Could not generate verification code.' },
        { status: 500 }
      );
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
    const verifyUrl = `${origin}/verify-email?code=${newCode}&email=${encodeURIComponent(user.email)}`;

    await sendVerificationEmail({
      toEmail: user.email,
      fullName: user.fullName,
      verificationCode: newCode,
      verificationUrl: verifyUrl,
    });

    return NextResponse.json({
      success: true,
      message: 'A new verification code has been dispatched to your email address.',
    });
  } catch (error: any) {
    console.error('Resend code API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to resend code' },
      { status: 500 }
    );
  }
}
