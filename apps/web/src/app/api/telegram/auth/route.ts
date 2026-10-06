import { NextResponse } from 'next/server';
import { validateTelegramInitData } from '@/lib/telegram/auth';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { initData, email, phone } = body;

    if (!initData) {
      return NextResponse.json(
        { success: false, error: 'Telegram initData string is required' },
        { status: 400 }
      );
    }

    // 1. Cryptographically validate initData server-side
    const validation = validateTelegramInitData(initData);
    if (!validation.valid || !validation.user) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Invalid or expired Telegram authentication data' },
        { status: 401 }
      );
    }

    const tgUser = validation.user;

    // 2. Find or link or create customer in the existing database
    const { user, customer } = await db.findOrCreateTelegramCustomer({
      telegramUserId: tgUser.id,
      telegramUsername: tgUser.username,
      telegramFirstName: tgUser.first_name,
      telegramLastName: tgUser.last_name,
      telegramPhotoUrl: tgUser.photo_url,
      telegramLanguageCode: tgUser.language_code,
      email: email,
      phone: phone,
    });

    // 3. Issue session token
    const token = crypto.randomBytes(32).toString('hex');
    const sessionData = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      telegramUserId: String(tgUser.id),
      telegramUsername: tgUser.username,
      isVerified: Boolean(user.emailVerifiedAt),
    };

    const response = NextResponse.json({
      success: true,
      message: 'Authenticated via Telegram successfully',
      data: {
        user: sessionData,
        customer,
        startParam: validation.startParam,
      },
      token,
    });

    // 4. Set standard session cookie (consistent with existing web app auth)
    response.cookies.set('mekdi_user', JSON.stringify(sessionData), {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 14, // 14 days
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('[API /api/telegram/auth] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Telegram authentication failed' },
      { status: 500 }
    );
  }
}
