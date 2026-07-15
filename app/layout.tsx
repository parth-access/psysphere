import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
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
  title: 'PsySphere — Premium Psychology Coaching Platform',
  description: 'Academic workspace built specifically for Class 11 and Class 12 Psychology coaching institutes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}>
        <body suppressHydrationWarning className="min-h-screen antialiased bg-brand-ivory text-brand-charcoal">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
