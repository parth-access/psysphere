import type { Metadata } from 'next';
import { Hanken_Grotesk, Fraunces } from 'next/font/google';
import './globals.css'; // Global styles

const sans = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const serif = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Saarthi Classes — Psychology for Class 11, 12 & CUET',
  description: 'Academic workspace built specifically for Class 11 and Class 12 Psychology coaching.',
  openGraph: {
    title: 'Saarthi Classes — Psychology for Class 11, 12 & CUET',
    description: 'Free workshops and small live batches with Dravina Gupta.',
    url: 'https://classes.saarthilife.com',
    siteName: 'Saarthi Classes',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saarthi Classes — Psychology for Class 11, 12 & CUET',
    description: 'Free workshops and small live batches with Dravina Gupta.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body suppressHydrationWarning className="min-h-screen antialiased bg-brand-ivory text-brand-charcoal">
        {children}
      </body>
    </html>
  );
}
