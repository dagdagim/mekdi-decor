// ==============================================================================
// MEKDI DECOR — TELEGRAM BOT API & NOTIFICATION SERVICE
// "Making Moments Unforgettable"
// Bot Handle: @MekdiDecor_bot
// ==============================================================================

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

export interface TelegramInlineKeyboardButton {
  text: string;
  url?: string;
  web_app?: { url: string };
  callback_data?: string;
}

export interface TelegramInlineKeyboardMarkup {
  inline_keyboard: TelegramInlineKeyboardButton[][];
}

export interface SendMessageOptions {
  parse_mode?: 'Markdown' | 'HTML';
  reply_markup?: TelegramInlineKeyboardMarkup | any;
  disable_web_page_preview?: boolean;
}

export class TelegramBotService {
  private static getBotToken(): string | undefined {
    return process.env.TELEGRAM_BOT_TOKEN;
  }

  public static getMiniAppUrl(param?: string): string {
    let baseUrl = process.env.TELEGRAM_MINI_APP_URL || 'https://mekdi-decor.vercel.app/telegram';
    if (!baseUrl.startsWith('https://')) {
      baseUrl = 'https://mekdi-decor.vercel.app/telegram';
    }

    try {
      const url = new URL(baseUrl);
      if (param) {
        url.searchParams.set('startapp', param);
      }
      return url.toString();
    } catch {
      return param ? `https://mekdi-decor.vercel.app/telegram?startapp=${param}` : 'https://mekdi-decor.vercel.app/telegram';
    }
  }

  /**
   * Send a message to a Telegram chat or user
   */
  public static async sendMessage(
    chatId: string | number,
    text: string,
    options: SendMessageOptions = {}
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    const token = this.getBotToken();
    if (!token) {
      console.warn('[TELEGRAM BOT] sendMessage skipped: TELEGRAM_BOT_TOKEN not configured');
      return { success: false, error: 'TELEGRAM_BOT_TOKEN not configured' };
    }

    try {
      const payload: any = {
        chat_id: chatId,
        text,
        disable_web_page_preview: options.disable_web_page_preview ?? false,
      };
      if (options.parse_mode) payload.parse_mode = options.parse_mode;
      if (options.reply_markup) payload.reply_markup = options.reply_markup;

      const response = await fetch(`${TELEGRAM_API_BASE}${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!data.ok) {
        console.error('[TELEGRAM BOT] API error:', data.description, 'Payload:', JSON.stringify(payload));

        // Robust fallback: if message with keyboard or markdown failed, retry sending plain text
        try {
          const fallbackRes = await fetch(`${TELEGRAM_API_BASE}${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: text.replace(/[*_`\[\]]/g, ''),
            }),
          });
          const fbData = await fallbackRes.json();
          if (fbData.ok) return { success: true, result: fbData.result };
        } catch {}

        return { success: false, error: data.description };
      }

      return { success: true, result: data.result };
    } catch (err: any) {
      console.error('[TELEGRAM BOT] Network error:', err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Send a branded notification with optional action button linking directly to the Mini App
   */
  public static async sendNotification(
    chatId: string | number,
    notification: {
      title: string;
      body: string;
      buttonText?: string;
      buttonPathOrUrl?: string;
      deepLinkParam?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const text = `*${notification.title}*\n\n${notification.body}`;

    let replyMarkup: TelegramInlineKeyboardMarkup | undefined;

    if (notification.buttonText) {
      let miniAppUrl = this.getMiniAppUrl(notification.deepLinkParam);
      if (notification.buttonPathOrUrl) {
        if (notification.buttonPathOrUrl.startsWith('http')) {
          miniAppUrl = notification.buttonPathOrUrl;
        } else {
          const base = this.getMiniAppUrl();
          const separator = base.includes('?') ? '&' : '?';
          miniAppUrl = `${base}${separator}route=${encodeURIComponent(notification.buttonPathOrUrl)}`;
        }
      }

      replyMarkup = {
        inline_keyboard: [
          [
            {
              text: notification.buttonText,
              web_app: { url: miniAppUrl },
            },
          ],
        ],
      };
    }

    return this.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      reply_markup: replyMarkup,
    });
  }

  /**
   * Welcome message with Mini App WebApp Button for /start command
   */
  public static async sendWelcomeMessage(
    chatId: string | number,
    startParam?: string
  ): Promise<{ success: boolean; error?: string }> {
    const miniAppUrl = this.getMiniAppUrl(startParam);

    const welcomeText = `🌸 *MEKDI DECOR*
_Making Moments Unforgettable._

Plan your event, explore our work, manage your booking and connect with our team.`;

    const keyboard: TelegramInlineKeyboardMarkup = {
      inline_keyboard: [
        [
          {
            text: '✨ OPEN MEKDI DECOR',
            web_app: { url: miniAppUrl },
          },
        ],
        [
          {
            text: '💎 Explore Portfolio',
            web_app: { url: this.getMiniAppUrl('gallery') },
          },
          {
            text: '📅 Plan My Event',
            web_app: { url: this.getMiniAppUrl('plan') },
          },
        ],
        [
          {
            text: '📞 Contact Concierge',
            callback_data: 'cmd_contact',
          },
        ],
      ],
    };

    return this.sendMessage(chatId, welcomeText, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    });
  }
}
