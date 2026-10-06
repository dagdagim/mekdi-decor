import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Mekdi Decor — Making Moments Unforgettable | Premium Event & Wedding Decoration',
  description:
    'Ethiopia’s premier event decoration atelier based at Trufat Werku Tower in Hawassa. Specializing in luxury weddings, grand graduation galas, romantic engagements, floral stages, and bespoke venue transformations in Hawassa, Shashemene, and nationwide destination events.',
  keywords: [
    'Mekdi Decor',
    'Event decoration Hawassa',
    'Event decoration Shashemene',
    'Hawassa wedding decor',
    'Trufat Werku Tower',
    'Ethiopian wedding decoration',
    'Luxury stage decoration',
    'Floral design Hawassa',
    'Graduation party decor',
    'Melse decoration',
    'Wedding planner Ethiopia',
  ],
  authors: [{ name: 'Mekdi Decor Atelier' }],
  openGraph: {
    title: 'Mekdi Decor — Making Moments Unforgettable',
    description: 'Transforming spaces into breathtaking celebrations across Ethiopia.',
    url: 'https://mekdidecor.com',
    siteName: 'Mekdi Decor',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Mekdi Decor Royal Floral Stage',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mekdi Decor — Making Moments Unforgettable',
    description: 'Bespoke event and wedding decoration atelier.',
    images: ['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="bg-cream-50 text-charcoal-900 antialiased flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
