'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Container } from './Container';
import { Button } from './Button';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-brand-border py-4 shadow-sm' : 'bg-transparent py-6'}`}>
      <Container>
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-serif text-2xl font-bold tracking-tight text-brand-text">PsySphere</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#courses" className="text-sm font-medium text-brand-text-muted hover:text-brand-text transition-colors">Courses</Link>
            <Link href="#pricing" className="text-sm font-medium text-brand-text-muted hover:text-brand-text transition-colors">Pricing</Link>
            <Link href="#about" className="text-sm font-medium text-brand-text-muted hover:text-brand-text transition-colors">About</Link>
            <Link href="#contact" className="text-sm font-medium text-brand-text-muted hover:text-brand-text transition-colors">Contact</Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/sign-in" className="hidden sm:block text-sm font-medium text-brand-text-muted hover:text-brand-text transition-colors">Login</Link>
            <Button className="!py-2.5 !px-5 !rounded-xl !text-sm shadow-none hover:shadow-none">Book Demo</Button>
          </div>
        </div>
      </Container>
    </nav>
  );
}
