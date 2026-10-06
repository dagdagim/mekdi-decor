import React from 'react';
import Script from 'next/script';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Mekdi Decor — Telegram Mini App',
  description: 'Bespoke Event & Wedding Decoration Atelier inside Telegram.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function TelegramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Official Telegram Web Apps SDK */}
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <div className="telegram-mini-app min-h-screen bg-cream-50 text-charcoal-900 selection:bg-gold-500 selection:text-burgundy-950 antialiased font-sans">
        {children}
      </div>
    </>
  );
}
