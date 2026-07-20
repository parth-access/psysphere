import { Container } from './Container';
import { H2, H3, Body } from './Typography';
import { Button } from './Button';
import Image from 'next/image';
import Link from 'next/link';
import { ANCHORS } from '@/constants/navigation';

export function TeacherProfile() {
  return (
    <section className="py-24 bg-white border-b border-brand-border" id="faculty">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:mx-0 rounded-3xl overflow-hidden shadow-xl border border-brand-border">
             <Image 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop"
                alt="Teacher Profile"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
             />
          </div>
          <div>
            <div className="inline-block py-1 px-3 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold tracking-widest uppercase mb-6">
              Lead Educator
            </div>
            <H2 className="mb-2">Dr. Aristha Sen</H2>
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="font-serif font-medium text-brand-text">M.A. Psychology</span>
              <span className="text-brand-border">•</span>
              <span className="font-serif font-medium text-brand-text">PhD (Clinical Psych)</span>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-10 pb-10 border-b border-brand-border">
              <div>
                <div className="font-serif text-3xl font-semibold text-brand-primary mb-1">10+</div>
                <div className="font-sans text-sm text-brand-text-muted">Years Experience</div>
              </div>
              <div>
                <div className="font-serif text-3xl font-semibold text-brand-primary mb-1">500+</div>
                <div className="font-sans text-sm text-brand-text-muted">Students Mentored</div>
              </div>
            </div>
            
            <H3 className="mb-4">Teaching Philosophy</H3>
            <Body className="italic">
              &quot;Psychology is not about memorizing definitions; it&apos;s about understanding the human condition. 
              My goal is to make complex psychological concepts accessible, relatable, and applicable, 
              ensuring my students don&apos;t just pass exams, but develop a genuine passion for the subject.&quot;
            </Body>
            <div className="mt-8 pt-8 border-t border-brand-border">
              <Button href={ANCHORS.contact}>
                Meet Your Mentor
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
