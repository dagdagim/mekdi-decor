import crypto from 'crypto';

export interface TelegramWebAppUser {
  id: number | string;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface ParsedTelegramInitData {
  query_id?: string;
  user?: TelegramWebAppUser;
  receiver?: any;
  chat?: any;
  chat_type?: string;
  chat_instance?: string;
  start_param?: string;
  auth_date: number;
  hash: string;
}

export interface TelegramAuthValidationResult {
  valid: boolean;
  user?: TelegramWebAppUser;
  startParam?: string;
  authDate?: number;
  error?: string;
}

/**
 * Validates Telegram WebApp initData string using HMAC-SHA256 signature verification.
 * Follows official Telegram WebApp documentation:
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 *
 * @param initData Raw initData string received from window.Telegram.WebApp.initData
 * @param botToken Telegram Bot Token (server-side ONLY)
 * @param maxAgeSeconds Max allowable age in seconds (defaults to 24 hours = 86400s)
 */
export function validateTelegramInitData(
  initData: string,
  botToken?: string,
  maxAgeSeconds: number = 86400
): TelegramAuthValidationResult {
  if (!initData || typeof initData !== 'string') {
    return { valid: false, error: 'Empty or invalid initData string' };
  }

  const token = botToken || process.env.TELEGRAM_BOT_TOKEN;

  // Development bypass ONLY if no token configured yet and in non-production
  if (!token) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[TELEGRAM AUTH] WARNING: TELEGRAM_BOT_TOKEN not configured in development. Allowing test mode parse.'
      );
      try {
        const searchParams = new URLSearchParams(initData);
        const userJson = searchParams.get('user');
        const user = userJson ? JSON.parse(userJson) : undefined;
        return {
          valid: true,
          user,
          startParam: searchParams.get('start_param') || undefined,
          authDate: Number(searchParams.get('auth_date')) || Date.now(),
        };
      } catch (err: any) {
        return { valid: false, error: `Dev parse failed: ${err.message}` };
      }
    }
    return { valid: false, error: 'Server configuration error: TELEGRAM_BOT_TOKEN is missing' };
  }

  try {
    const searchParams = new URLSearchParams(initData);
    const hash = searchParams.get('hash');

    if (!hash) {
      return { valid: false, error: 'Missing hash parameter in initData' };
    }

    // 1. Sort all key-value pairs alphabetically, excluding 'hash'
    const pairs: string[] = [];
    searchParams.forEach((val, key) => {
      if (key !== 'hash') {
        pairs.push(`${key}=${val}`);
      }
    });
    pairs.sort();
    const dataCheckString = pairs.join('\n');

    // 2. Compute secret key = HMAC-SHA256(botToken, "WebAppData")
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(token)
      .digest();

    // 3. Compute hash = HMAC-SHA256(dataCheckString, secretKey)
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // 4. Constant-time comparison
    const hashBuf = Buffer.from(hash, 'hex');
    const calcBuf = Buffer.from(calculatedHash, 'hex');

    if (hashBuf.length !== calcBuf.length || !crypto.timingSafeEqual(hashBuf, calcBuf)) {
      return { valid: false, error: 'Invalid HMAC signature — data tampering detected' };
    }

    // 5. Check auth_date for replay expiration
    const authDate = Number(searchParams.get('auth_date'));
    if (!authDate) {
      return { valid: false, error: 'Missing auth_date in initData' };
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (nowSeconds - authDate > maxAgeSeconds) {
      return { valid: false, error: 'Telegram authentication session expired' };
    }

    // 6. Parse user payload
    const userJson = searchParams.get('user');
    let user: TelegramWebAppUser | undefined;
    if (userJson) {
      try {
        user = JSON.parse(userJson);
      } catch {
        return { valid: false, error: 'Malformed user JSON in initData' };
      }
    }

    const startParam = searchParams.get('start_param') || undefined;

    return {
      valid: true,
      user,
      startParam,
      authDate,
    };
  } catch (error: any) {
    return {
      valid: false,
      error: `Validation exception: ${error.message}`,
    };
  }
}
