import { Container } from './Container';
import { H1, Body } from './Typography';
import { Button } from './Button';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          <div className="max-w-2xl animate-slide-up" style={{ animationDelay: '100ms' }}>
            <span className="inline-block py-1 px-3 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold tracking-widest uppercase mb-6">
              Premium Psychology Coaching
            </span>
            <H1 className="mb-6">
              Master Psychology.<br />
              Ace Boards.<br />
              Crack CUET-UG.
            </H1>
            <Body className="mb-10 text-lg md:text-xl">
              Personalized Psychology coaching for Classes XI & XII.<br />
              Small batches. Weekly tests. Expert mentorship.
            </Body>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="!px-8 !py-4 !text-base">
                Book Free Demo
              </Button>
              <Button variant="secondary" className="!px-8 !py-4 !text-base">
                View Fee Plans
              </Button>
            </div>
          </div>
          
          <div className="relative lg:h-[600px] w-full flex items-center justify-center animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-transparent rounded-[40px] transform rotate-3 scale-105" />
            <div className="relative w-full aspect-[4/5] max-w-md mx-auto rounded-[32px] overflow-hidden shadow-2xl border-8 border-white">
              <Image 
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop"
                alt="Students studying psychology in a premium classroom" 
                fill
                className="object-cover"
                priority
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Floating Trust Badge */}
            <div className="absolute -bottom-6 -left-6 md:bottom-12 md:-left-12 bg-white p-4 rounded-2xl shadow-xl border border-brand-border flex items-center gap-4 animate-fade-in" style={{ animationDelay: '800ms' }}>
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-brand-beige overflow-hidden">
                    <Image 
                      src={`https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=100&auto=format&fit=crop&sig=${i}`}
                      alt="Student"
                      width={40}
                      height={40}
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center text-brand-accent mb-0.5">
                  {'★★★★★'.split('').map((star, i) => <span key={i} className="text-sm">{star}</span>)}
                </div>
                <p className="text-xs font-medium text-brand-text">Trusted by 500+ Parents</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
