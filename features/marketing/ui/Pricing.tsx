'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';
import { Container } from './Container';
import { H2, Body, Eyebrow } from './Typography';
import { Button } from './Button';
import { pricing } from '@/constants/pricing';
import { NAVIGATION } from '@/constants/navigation';

type ClassKey = 'class11' | 'class12';
type Track = 'standard' | 'cuet';
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex gap-1 rounded-full border border-line bg-surface p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-10 rounded-full px-5 text-[14px] font-bold transition-colors ${
            value === o.value ? 'bg-forest-800 text-paper' : 'text-ink-700 hover:bg-ink-100'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function PricingContent() {
  const sp = useSearchParams();
  const [cls, setCls] = useState<ClassKey>('class11');
  const [track, setTrack] = useState<Track>('standard');

  useEffect(() => {
    const c = sp.get('class');
    const p = sp.get('package') ?? sp.get('track');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (c === 'class11' || c === 'class12') setCls(c);
    if (p === 'standard' || p === 'cuet') setTrack(p);
  }, [sp]);

  const tiers = pricing[cls][track] ?? [];
  const classLevel = cls === 'class11' ? 'class_11' : 'class_12';

  return (
    <section id="pricing" className="relative overflow-hidden bg-paper-deep py-24 sm:py-32">
      <Container>
        <div className="mb-12 flex flex-wrap items-end justify-between gap-8">
          <div className="flex max-w-xl flex-col gap-4">
            <Eyebrow>Fees</Eyebrow>
            <H2>
              Fees, <em>listed upfront.</em>
            </H2>
            <Body>Every plan includes live classes, study material and doubt support. Longer plans cost less per class.</Body>
          </div>
          <div className="flex flex-wrap gap-3">
            <Segmented
              label="Class"
              value={cls}
              onChange={setCls}
              options={[
                { value: 'class11', label: 'Class 11' },
                { value: 'class12', label: 'Class 12' },
              ]}
            />
            <Segmented
              label="Course"
              value={track}
              onChange={setTrack}
              options={[
                { value: 'standard', label: 'Boards' },
                { value: 'cuet', label: '+ CUET' },
              ]}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((t) => {
            const featured = t.popular;
            const perClass = Math.round(t.price / t.classes);
            return (
              <div
                key={t.id}
                className={`relative flex flex-col gap-5 rounded-[32px] p-7 ${
                  featured ? 'bg-forest-900 text-paper shadow-lift lg:-my-3 lg:py-10' : 'border border-line bg-surface text-ink-900'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[15px] font-bold uppercase tracking-[0.12em]">{t.name}</h3>
                  {featured && (
                    <span className="rounded-full bg-gold-500 px-3 py-1 text-[12px] font-bold text-ink-900">Most popular</span>
                  )}
                  {t.bestValue && !featured && (
                    <span className="rounded-full bg-mint px-3 py-1 text-[12px] font-bold text-forest-900">Best value</span>
                  )}
                </div>
                <div>
                  <p className="font-serif text-[44px] leading-none xl:text-[52px]">{inr(t.price)}</p>
                  <p className={`mt-2 text-sm ${featured ? 'text-paper/70' : 'text-ink-500'}`}>
                    {t.classes} classes · about {inr(perClass)} per class
                  </p>
                </div>
                {t.save ? (
                  <p className={`w-fit rounded-full px-3 py-1 text-[13px] font-bold ${featured ? 'bg-paper/10 text-gold-400' : 'bg-forest-50 text-forest-800'}`}>
                    You save {inr(t.save)}
                  </p>
                ) : null}
                <ul className={`flex flex-col gap-3 border-t pt-5 text-[15px] ${featured ? 'border-paper/15 text-paper/85' : 'border-line text-ink-700'}`}>
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? 'text-gold-400' : 'text-forest-700'}`} strokeWidth={3} aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  href={`${NAVIGATION.join}?class=${classLevel}&track=${track}&plan=${t.id}`}
                  variant={featured ? 'accent' : 'outline'}
                  className="mt-auto w-full"
                >
                  Choose {t.name.toLowerCase()}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-[15px] text-ink-500">
          Not sure yet?{' '}
          <a href={NAVIGATION.workshops} className="font-bold text-forest-800 underline decoration-gold-500 decoration-2 underline-offset-4">
            Try a free workshop first
          </a>
          .
        </p>
      </Container>
    </section>
  );
}

export function Pricing() {
  return (
    <Suspense fallback={<div className="h-[720px] bg-paper-deep" />}>
      <PricingContent />
    </Suspense>
  );
}
