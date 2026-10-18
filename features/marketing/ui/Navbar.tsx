'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Container } from './Container';
import { Button } from './Button';
import { Logo } from './Logo';
import { NAVIGATION } from '@/constants/navigation';

const navLinks = [
  { label: 'Workshops', href: NAVIGATION.workshops },
  { label: 'Courses', href: NAVIGATION.courses },
  { label: 'Fees', href: NAVIGATION.pricing },
  { label: 'About', href: NAVIGATION.about },
  { label: 'Contact', href: NAVIGATION.contact },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors ${
        scrolled || open ? 'border-line bg-paper/95 backdrop-blur' : 'border-transparent bg-paper'
      }`}
    >
      <Container>
        <nav aria-label="Main" className="flex h-[72px] items-center justify-between gap-4">
          <Link href={NAVIGATION.home} aria-label="Saarthi Classes home">
            <Logo />
          </Link>

          <ul className="hidden items-center gap-7 md:flex">
            {navLinks.map((l) => {
              const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? 'page' : undefined}
                    className={`text-[15px] font-medium transition-colors ${active ? 'text-ink-900 underline decoration-marigold-500 decoration-2 underline-offset-8' : 'text-ink-500 hover:text-ink-900'}`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="hidden items-center gap-5 md:flex">
            <Link href="/sign-in" className="text-[15px] font-medium text-ink-500 hover:text-ink-900">
              Log in
            </Link>
            <Button href={NAVIGATION.workshops} className="!min-h-11 !px-5">
              Free workshop
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-ink-900 hover:bg-ink-100 md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </Container>

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-paper md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-xl px-3 py-3 text-lg font-medium text-ink-900 hover:bg-ink-100">
                {l.label}
              </Link>
            ))}
            <Link href="/sign-in" className="rounded-xl px-3 py-3 text-lg font-medium text-ink-500 hover:bg-ink-100">
              Log in
            </Link>
            <Button href={NAVIGATION.workshops} className="mt-2 w-full">
              Join a free workshop
            </Button>
          </Container>
        </div>
      )}
    </header>
  );
}
