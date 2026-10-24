import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Newsreader, Caveat } from 'next/font/google';
import './globals.css'; // Global styles
import { SITE } from '@/constants/site';
import { Suspense } from 'react';
import { NavigationProgress } from '@/features/shared/ui/NavigationProgress';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const serif = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-serif',
  display: 'swap',
});

const hand = Caveat({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-hand',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  icons: { icon: SITE.logoUrl, apple: SITE.logoUrl },
  title: 'Saarthi Classes | Psychology for Class 11, 12 & CUET',
  description: 'Live small-batch psychology classes for Class 11, Class 12 and CUET-UG with Dravina Gupta. Start with a free workshop.',
  openGraph: {
    title: 'Saarthi Classes | Psychology for Class 11, 12 & CUET',
    description: 'Free workshops and small live batches with Dravina Gupta.',
    url: 'https://classes.saarthilife.com',
    siteName: 'Saarthi Classes',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saarthi Classes | Psychology for Class 11, 12 & CUET',
    description: 'Free workshops and small live batches with Dravina Gupta.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${hand.variable}`}>
      <body suppressHydrationWarning className="min-h-screen bg-paper text-ink-900 antialiased">
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
