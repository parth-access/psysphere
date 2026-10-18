import { Container } from './Container';
import { Button } from './Button';

export function ClosingCta() {
  return (
    <section className="bg-ink-900 text-paper">
      <Container className="flex flex-wrap items-center justify-between gap-6 py-16">
        <div className="max-w-xl">
          <h2 className="mb-2 font-serif text-3xl font-semibold leading-tight sm:text-4xl">Try one class before you decide.</h2>
          <p className="text-ink-300">A free live workshop with Dravina. Parents are welcome to sit in.</p>
        </div>
        <Button href="/workshops" variant="accent">
          See free workshops
        </Button>
      </Container>
    </section>
  );
}
