import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Saarthi Classes — Premium Psychology Coaching Platform',
  description: 'Academic workspace built specifically for Class 11 and Class 12 Psychology coaching.',
  openGraph: {
    title: 'Saarthi Classes — Premium Psychology Coaching Platform',
    description: 'Master Psychology. Ace Boards. Crack CUET-UG. Concept-based learning with Dravina Gupta.',
    url: 'https://classes.saarthilife.com',
    siteName: 'Saarthi Classes',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saarthi Classes — Premium Psychology Coaching Platform',
    description: 'Master Psychology. Ace Boards. Crack CUET-UG. Concept-based learning with Dravina Gupta.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <body suppressHydrationWarning className="min-h-screen antialiased bg-brand-ivory text-brand-charcoal">
        {children}
      </body>
    </html>
  );
}
