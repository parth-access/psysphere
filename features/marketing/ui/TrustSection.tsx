import { Container } from './Container';

const stats = [
  { value: '100+', label: 'Students Mentored' },
  { value: '95%', label: 'Board Success' },
  { value: 'Weekly', label: 'Performance Reports' },
  { value: 'Small', label: 'Batch Sizes' },
];

export function TrustSection() {
  return (
    <section className="py-16 bg-white border-y border-brand-border">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center divide-x divide-brand-border">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col space-y-2 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <span className="font-serif text-3xl md:text-4xl font-semibold text-brand-primary">
                {stat.value}
              </span>
              <span className="font-sans text-sm font-medium text-brand-text-muted uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
