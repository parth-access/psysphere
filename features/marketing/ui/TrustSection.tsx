import { Container } from './Container';

/** Honest, checkable facts about how classes run. Add student numbers here only once verified. */
const facts = [
  { value: 'Small', label: 'batches, so every student is noticed' },
  { value: 'Weekly', label: 'tests, reviewed together in class' },
  { value: 'Parents', label: 'get a progress report every week' },
  { value: 'CBSE + CUET', label: 'mapped to one syllabus plan' },
];

export function TrustSection() {
  return (
    <section aria-label="How classes run" className="border-y border-line bg-surface">
      <Container className="grid grid-cols-2 gap-x-6 gap-y-8 py-10 lg:grid-cols-4">
        {facts.map((f) => (
          <div key={f.value}>
            <p className="font-serif text-[28px] font-semibold text-ink-900">{f.value}</p>
            <p className="text-sm text-ink-500">{f.label}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}
