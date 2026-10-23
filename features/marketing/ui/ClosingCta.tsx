import { ArrowRight } from 'lucide-react';
import { Container } from './Container';
import { Button } from './Button';
import { Psi, Sparkle } from './Doodles';
import { whatsappUrl } from '@/constants/site';

export function ClosingCta() {
  return (
    <section className="pb-24 sm:pb-32">
      <Container>
        <div className="relative overflow-hidden rounded-[40px] bg-forest-900 px-7 py-16 text-paper sm:px-14 sm:py-20">
          <Psi className="pointer-events-none absolute -bottom-10 -right-6 h-80 w-72 text-paper/[0.06]" />
          <Sparkle className="absolute right-[38%] top-10 hidden h-6 w-6 text-gold-500 sm:block" />
          <div className="relative flex max-w-2xl flex-col gap-6">
            <h2 className="font-serif text-[44px] leading-[1] sm:text-[64px]">
              Try one class <em className="text-gold-400">before you decide.</em>
            </h2>
            <p className="max-w-lg text-[18px] leading-relaxed text-paper/75">
              Join a free live workshop with Dravina. Bring your questions, and a parent if you like.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button href="/workshops" variant="accent" className="!min-h-14 !px-7 text-base">
                See free workshops <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                variant="ghost"
                className="!min-h-14 !px-7 text-base !text-paper hover:!bg-paper/10"
              >
                Chat on WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
