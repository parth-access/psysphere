import { Container } from './Container';
import Link from 'next/link';
import { NAVIGATION } from '@/constants/navigation';

export function Footer() {
  return (
    <footer className="bg-brand-charcoal text-white py-16">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link href={NAVIGATION.home} className="inline-block mb-6">
              <span className="font-serif text-2xl font-bold tracking-tight text-white">PsySphere</span>
            </Link>
            <p className="text-white/70 max-w-sm mb-8 leading-relaxed">
              Premium Psychology coaching platform for Class 11 & 12. 
              Helping students master the subject and crack CUET-UG.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                Instagram
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                WhatsApp
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                Email
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-6">Navigation</h4>
            <ul className="space-y-4">
              <li><Link href={NAVIGATION.courses} className="text-white/70 hover:text-white transition-colors">Courses</Link></li>
              <li><Link href={NAVIGATION.pricing} className="text-white/70 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href={NAVIGATION.about} className="text-white/70 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href={NAVIGATION.contact} className="text-white/70 hover:text-white transition-colors">Contact</Link></li>
              <li><Link href={NAVIGATION.bookDemo} className="text-white/70 hover:text-white transition-colors">Book a Demo</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-white/70 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-16 pt-8 text-center text-white/50 text-sm">
          <p>© {new Date().getFullYear()} PsySphere. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
