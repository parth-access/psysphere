'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container } from './Container';
import { Button } from './Button';
import { NAVIGATION, ANCHORS } from '@/constants/navigation';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: 'Courses', href: isHome ? ANCHORS.courses : NAVIGATION.courses },
    { label: 'Pricing', href: isHome ? ANCHORS.pricing : NAVIGATION.pricing },
    { label: 'About', href: isHome ? ANCHORS.about : NAVIGATION.about },
    { label: 'Contact', href: isHome ? ANCHORS.contact : NAVIGATION.contact },
  ];

  return (
    <header>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isOpen ? 'bg-white/95 backdrop-blur-md border-b border-brand-border py-4 shadow-sm' : 'bg-transparent py-6'}`}>
        <Container>
          <div className="flex items-center justify-between">
            <Link href={NAVIGATION.home} className="flex items-center space-x-2 relative z-50">
              <span className="font-serif text-2xl font-bold tracking-tight text-brand-text">PsySphere</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (isHome && link.href.startsWith('/#') && pathname === '/');
                return (
                  <Link 
                    key={link.label} 
                    href={link.href} 
                    className={`text-sm font-medium transition-colors ${
                      isActive 
                        ? 'text-brand-primary' 
                        : 'text-brand-text-muted hover:text-brand-text'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            
            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/sign-in" className="text-sm font-medium text-brand-text-muted hover:text-brand-text transition-colors">Login</Link>
              <Button href={NAVIGATION.bookDemo} className="!py-2.5 !px-5 !rounded-xl !text-sm shadow-none hover:shadow-none">
                Book Demo
              </Button>
            </div>

            {/* Mobile / Tablet Controls */}
            <div className="flex md:hidden items-center gap-3">
              <Button href={NAVIGATION.bookDemo} className="!py-1.5 !px-3.5 !rounded-lg !text-xs shadow-none hover:shadow-none">
                Book Demo
              </Button>
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-brand-text hover:text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 rounded-lg relative z-50"
                aria-label={isOpen ? "Close Menu" : "Open Menu"}
                aria-expanded={isOpen}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </Container>

        {/* Mobile / Tablet Drawer Menu */}
        <div 
          className={`absolute top-full left-0 right-0 bg-white border-b border-brand-border shadow-lg transition-all duration-300 ease-in-out md:hidden ${
            isOpen 
              ? 'opacity-100 translate-y-0 pointer-events-auto visible' 
              : 'opacity-0 -translate-y-4 pointer-events-none invisible'
          }`}
        >
          <Container className="py-8 space-y-6">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-base font-medium text-brand-text-muted hover:text-brand-text transition-colors py-1"
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-brand-border my-2" />
              <Link 
                href="/sign-in" 
                onClick={() => setIsOpen(false)}
                className="text-base font-medium text-brand-text-muted hover:text-brand-text transition-colors py-1"
              >
                Login to Student Portal
              </Link>
            </div>
          </Container>
        </div>
      </nav>
    </header>
  );
}
