import { Container } from './Container';
import { H2, Body } from './Typography';
import Image from 'next/image';

const testimonials = [
  {
    name: 'Aanya Sharma',
    school: 'DPS RK Puram',
    quote: 'The way concepts are broken down is incredible. I went from struggling with the basics to scoring 98 in my pre-boards.',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: 'Rohan Verma',
    school: 'Modern School',
    quote: 'The study material and the weekly tests completely changed my preparation strategy for CUET. Highly recommended!',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: 'Meera Rajput',
    school: 'Springdales',
    quote: 'Not just a coaching class, it’s a complete academic workspace. The notes are the best I have ever seen.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  }
];

export function Testimonials() {
  return (
    <section className="py-24 bg-brand-canvas border-b border-brand-border">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <H2 className="mb-6">Student Success</H2>
          <Body>
            Hear from students who transformed their approach to psychology and achieved their academic goals.
          </Body>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-8 rounded-[28px] border border-brand-border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1 text-brand-accent mb-6">
                {'★★★★★'.split('').map((star, j) => <span key={j} className="text-lg">{star}</span>)}
              </div>
              <p className="font-sans text-brand-text leading-relaxed mb-8">&quot;{t.quote}&quot;</p>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-beige">
                  <Image src={t.image} alt={t.name} width={48} height={48} className="object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h4 className="font-serif font-semibold text-brand-text">{t.name}</h4>
                  <p className="font-sans text-xs text-brand-text-muted">{t.school}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
