import { Container } from './Container';
import { H2, H3, Body } from './Typography';
import { Button } from './Button';
import Image from 'next/image';
import Link from 'next/link';


export function TeacherProfile() {
  return (
    <section className="py-24 bg-white border-b border-brand-border" id="faculty">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:mx-0 rounded-3xl overflow-hidden shadow-xl border border-brand-border">
             <Image 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop"
                alt="Dravina Gupta - Psychology Educator"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
             />
          </div>
          <div>
            <div className="inline-block py-1 px-3 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold tracking-widest uppercase mb-6">
              Founder & Lead Educator
            </div>
            <H2 className="mb-2">Dravina Gupta</H2>
            <div className="flex flex-wrap gap-3 mb-6 text-sm text-brand-text font-medium">
              <span>Founder of Saarthi</span>
              <span className="text-brand-border">•</span>
              <span>Psychology Educator</span>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-brand-text leading-relaxed">
                I teach psychology because it is the most beautiful subject to understand ourselves and others. 
                My focus is on making difficult theories simple and conceptual, rather than encouraging rote learning. 
                Through a compassionate, approachable, and student-first method, I support Class 11, Class 12, 
                and CUET-UG aspirants to build genuine love for the subject and succeed confidently in their board exams.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-brand-border">
              <div>
                <div className="font-serif text-3xl font-semibold text-brand-primary mb-1">2 Years</div>
                <div className="font-sans text-sm text-brand-text-muted">Teaching Experience</div>
              </div>
              <div>
                <div className="font-serif text-3xl font-semibold text-brand-primary mb-1">Saarthi</div>
                <div className="font-sans text-sm text-brand-text-muted">Interactive Classroom</div>
              </div>
            </div>
            
            <H3 className="mb-3">Teaching Philosophy</H3>
            <p className="font-sans text-sm leading-relaxed text-brand-text italic mb-4">
              &quot;I believe education should feel supportive and conceptual. Learning is not a chore—it should be 
              engaging and simple. When students learn with a calm mind, difficult concepts naturally click, 
              guiding them to outstanding grades in school and beyond.&quot;
            </p>

            <div className="mb-6">
              <span className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Credentials & Background</span>
              <p className="text-xs text-stone-600 font-medium">Psychology Graduate, Founder of Saarthi</p>
            </div>

            <div className="pt-6 border-t border-brand-border">
              <Button href="/contact">
                Connect with Dravina
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
