import { Container } from './Container';
import Link from 'next/link';
import { NAVIGATION } from '@/constants/navigation';

export function Footer() {
  return (
    <footer className="bg-brand-charcoal text-white py-16">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Column 1 - Brand info */}
          <div>
            <Link href={NAVIGATION.home} className="inline-block mb-6">
              <span className="font-serif text-2xl font-bold tracking-tight text-white">Saarthi Classes</span>
            </Link>
            <p className="text-white/75 text-sm max-w-sm mb-6 leading-relaxed">
              Saarthi Classes helps Class 11 & Class 12 Psychology students build concepts, score well in boards, and prepare confidently for CUET.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="mailto:classes@saarthilife.com?subject=Inquiry%20about%20Saarthi%20Classes" 
                className="text-white/70 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
              >
                <span>Email: classes@saarthilife.com</span>
              </a>
            </div>
          </div>
          
          {/* Column 2 - Courses */}
          <div>
            <h4 className="font-semibold text-base mb-6 tracking-wide text-white/90 uppercase text-xs">Courses</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/courses/class-11" className="text-white/70 hover:text-white transition-colors">Class 11</Link></li>
              <li><Link href="/courses/class-12" className="text-white/70 hover:text-white transition-colors">Class 12</Link></li>
              <li><Link href="/courses/cuet-ug" className="text-white/70 hover:text-white transition-colors">CUET UG</Link></li>
              <li><Link href="/courses/boards-cuet" className="text-white/70 hover:text-white transition-colors">Boards + CUET</Link></li>
            </ul>
          </div>

          {/* Column 3 - Company */}
          <div>
            <h4 className="font-semibold text-base mb-6 tracking-wide text-white/90 uppercase text-xs">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/about" className="text-white/70 hover:text-white transition-colors">About</Link></li>
              <li><Link href="/contact" className="text-white/70 hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/book-demo" className="text-white/70 hover:text-white transition-colors">Book Demo</Link></li>
              <li><Link href="/sign-in" className="text-white/70 hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>
          
          {/* Column 4 - Legal */}
          <div>
            <h4 className="font-semibold text-base mb-6 tracking-wide text-white/90 uppercase text-xs">Legal</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/privacy-policy" className="text-white/70 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-white/70 hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/refund-policy" className="text-white/70 hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-white/50 text-xs">
          <p>© 2026 Saarthi Classes. All rights reserved.</p>
          <p>Made with ❤️ for Psychology Students</p>
        </div>
      </Container>
    </footer>
  );
}
