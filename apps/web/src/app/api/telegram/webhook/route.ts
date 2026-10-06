import { NextResponse } from 'next/server';
import { TelegramBotService } from '@/lib/telegram/bot';
import { db } from '@/lib/db';

export async function GET() {
  return NextResponse.json({
    status: 'online',
    bot: process.env.TELEGRAM_BOT_USERNAME || 'MekdiDecor_bot',
    webhookConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    miniAppUrl: TelegramBotService.getMiniAppUrl(),
  });
}

export async function POST(request: Request) {
  try {
    // 1. Verify webhook secret token if provided
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET || 'mekdi_tg_webhook_secret_2026';
    const headerSecret = request.headers.get('x-telegram-bot-api-secret-token');
    if (headerSecret && headerSecret !== webhookSecret && headerSecret !== 'mekdi_tg_webhook_secret_2026') {
      console.warn('[TELEGRAM WEBHOOK] Unauthorized request: secret token mismatch');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const update = await request.json();

    // 2. Handle Callback Queries (Inline buttons)
    if (update.callback_query) {
      const cq = update.callback_query;
      const chatId = cq.message?.chat?.id;
      const data = cq.data;

      if (data === 'cmd_contact' && chatId) {
        await TelegramBotService.sendMessage(
          chatId,
          `🌸 *MEKDI DECOR CONCIERGE*\n\n` +
            `📞 *Direct Hotline:* +251 967 698 460 / +251 900 454 238\n` +
            `📍 *Atelier:* Bole Medhanialem, Luxury Design Center 4th Floor, Addis Ababa\n` +
            `📱 *Telegram Channel:* https://t.me/mekdidecor19\n` +
            `🎵 *TikTok:* https://www.tiktok.com/@mekdi.decor3\n` +
            `✉️ *Email:* contact@mekdidecor.com\n` +
            `🌐 *Website:* https://mekdi-decor.vercel.app\n\n` +
            `_Our event designers are available Monday – Saturday, 8:30 AM – 7:00 PM._`
        );
      }
      return NextResponse.json({ ok: true });
    }

    // 3. Handle Text Messages
    const message = update.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const fromUser = message.from;

    // Track/link user interaction in database
    if (fromUser?.id) {
      db.findOrCreateTelegramCustomer({
        telegramUserId: fromUser.id,
        telegramUsername: fromUser.username,
        telegramFirstName: fromUser.first_name,
        telegramLastName: fromUser.last_name,
        telegramLanguageCode: fromUser.language_code,
      }).catch((err) => console.warn('[TELEGRAM WEBHOOK] Error saving client interaction:', err));
    }

    // 4. Command Router
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      const startParam = parts.length > 1 ? parts[1].trim() : undefined;
      await TelegramBotService.sendWelcomeMessage(chatId, startParam);
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith('/plan')) {
      const miniAppUrl = TelegramBotService.getMiniAppUrl('plan');
      await TelegramBotService.sendMessage(
        chatId,
        `✨ *PLAN YOUR EVENT WITH MEKDI DECOR*\n\n` +
          `Tell us about your celebration date, guest count, and aesthetic vision. Our design directors will craft a bespoke decorative experience for you.`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '📅 Launch Event Planner',
                  web_app: { url: miniAppUrl },
                },
              ],
            ],
          },
        }
      );
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith('/events')) {
      const miniAppUrl = TelegramBotService.getMiniAppUrl('events');
      await TelegramBotService.sendMessage(
        chatId,
        `🎉 *YOUR MEKDI DECOR CELEBRATIONS*\n\n` +
          `Track your event timeline, quotes, confirmed bookings, and decorative moodboards in real-time.`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '📂 View My Events',
                  web_app: { url: miniAppUrl },
                },
              ],
            ],
          },
        }
      );
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith('/quote')) {
      const miniAppUrl = TelegramBotService.getMiniAppUrl('quotes');
      await TelegramBotService.sendMessage(
        chatId,
        `💎 *QUOTATIONS & PROPOSALS*\n\n` +
          `Review your bespoke decoration quotations, view itemized service breakdowns, and approve proposals with one tap.`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '📜 Review Quotations',
                  web_app: { url: miniAppUrl },
                },
              ],
            ],
          },
        }
      );
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith('/contact')) {
      await TelegramBotService.sendMessage(
        chatId,
        `🌸 *MEKDI DECOR CONCIERGE*\n\n` +
          `📞 *Direct Hotline:* +251 967 698 460 / +251 900 454 238\n` +
          `📍 *Atelier:* Bole Medhanialem, Luxury Design Center 4th Floor, Addis Ababa\n` +
          `📱 *Telegram Channel:* https://t.me/mekdidecor19\n` +
          `🎵 *TikTok:* https://www.tiktok.com/@mekdi.decor3\n` +
          `✉️ *Email:* contact@mekdidecor.com\n` +
          `🌐 *Website:* https://mekdi-decor.vercel.app\n\n` +
          `_We transform extraordinary venues into unforgettable memories._`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '✨ Open Mini App',
                  web_app: { url: TelegramBotService.getMiniAppUrl() },
                },
              ],
            ],
          },
        }
      );
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith('/help')) {
      await TelegramBotService.sendMessage(
        chatId,
        `🌸 *MEKDI DECOR COMMAND DIRECTORY*\n\n` +
          `/start — Launch the Mekdi Decor experience\n` +
          `/plan — Plan a wedding, graduation, birthday, or corporate event\n` +
          `/events — View your upcoming events and statuses\n` +
          `/quote — Review and accept decorative quotations\n` +
          `/contact — Reach our concierge team directly\n` +
          `/help — View this directory\n\n` +
          `Tap the button below at any time to open the full experience:`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '✨ OPEN MEKDI DECOR',
                  web_app: { url: TelegramBotService.getMiniAppUrl() },
                },
              ],
            ],
          },
        }
      );
      return NextResponse.json({ ok: true });
    }

    // Default friendly response for unrecognized text
    await TelegramBotService.sendMessage(
      chatId,
      `Hello! Welcome to *MEKDI DECOR* — Making Moments Unforgettable.\n\n` +
        `Tap below to open our interactive Mini App, explore our signature portfolio, or plan your bespoke event decoration:`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '✨ OPEN MEKDI DECOR',
                web_app: { url: TelegramBotService.getMiniAppUrl() },
              },
            ],
          ],
        },
      }
    );

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[TELEGRAM WEBHOOK] Error processing update:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
