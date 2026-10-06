import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await db.findUserByEmail(email);
    if (existing) {
      if (existing.emailVerifiedAt) {
        return NextResponse.json(
          { success: false, error: 'An account with this email address already exists. Please sign in.' },
          { status: 409 }
        );
      }
      // If unverified, regenerate verification code and resend email
      const newCode = await db.regenerateVerificationCode(email);
      if (newCode) {
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
        const verifyUrl = `${origin}/verify-email?code=${newCode}&email=${encodeURIComponent(existing.email)}`;
        await sendVerificationEmail({
          toEmail: existing.email,
          fullName: existing.fullName,
          verificationCode: newCode,
          verificationUrl: verifyUrl,
        });
        return NextResponse.json({
          success: true,
          message: 'An unverified account exists. A fresh verification email has been sent!',
          data: { email: existing.email, fullName: existing.fullName, isVerified: false },
        });
      }
    }

    // Create fresh user account
    const { user, verificationCode } = await db.createUser({
      email,
      password,
      fullName,
      phone,
      role: 'CUSTOMER',
    });

    // Send verification email via Gmail SMTP
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
    const verifyUrl = `${origin}/verify-email?code=${verificationCode}&email=${encodeURIComponent(user.email)}`;

    const emailSent = await sendVerificationEmail({
      toEmail: user.email,
      fullName: user.fullName,
      verificationCode,
      verificationUrl: verifyUrl,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully! Please check your email for the verification code.',
        data: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          emailSent,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create user account' },
      { status: 500 }
    );
  }
}
