import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Mekdi Decor — Making Moments Unforgettable | Premium Event & Wedding Decoration',
  description:
    'Ethiopia’s premier event decoration atelier. Specializing in luxury weddings, grand graduation galas, romantic engagements, floral stages, and venue transformations in Addis Ababa, Hawassa, Bishoftu, and Adama.',
  keywords: [
    'Mekdi Decor',
    'Ethiopian wedding decoration',
    'Event decoration Addis Ababa',
    'Luxury stage decoration',
    'Floral design Ethiopia',
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
