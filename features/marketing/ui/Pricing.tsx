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
    <div role="radiogroup" aria-label={label} className="inline-flex gap-1 rounded-xl bg-paper-deep p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-11 rounded-[9px] px-4 text-[15px] font-semibold transition-colors ${
            value === o.value ? 'bg-ink-900 text-paper' : 'text-ink-900 hover:bg-surface'
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
    <section id="pricing" className="border-y border-line bg-surface py-20 sm:py-24">
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <Eyebrow className="mb-3">Fees</Eyebrow>
            <H2 className="mb-3">Fees, upfront</H2>
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((t) => {
            const featured = t.popular;
            return (
              <div
                key={t.id}
                className={`relative flex flex-col gap-4 rounded-2xl p-7 ${featured ? 'border-2 border-ink-900' : 'border border-line'}`}
              >
                {featured && (
                  <span className="absolute -top-3.5 left-6 rounded-full bg-marigold-500 px-3 py-1 text-[13px] font-semibold text-ink-900">
                    Most popular
                  </span>
                )}
                {t.bestValue && !featured && (
                  <span className="absolute -top-3.5 left-6 rounded-full bg-ink-900 px-3 py-1 text-[13px] font-semibold text-paper">
                    Best value
                  </span>
                )}
                <h3 className="font-semibold text-ink-900">{t.name}</h3>
                <p className="font-serif text-4xl font-semibold text-ink-900">{inr(t.price)}</p>
                <p className={`text-sm font-semibold ${t.save ? 'text-sage-600' : 'text-ink-500'}`}>
                  {t.classes} classes{t.save ? ` · save ${inr(t.save)}` : ''}
                </p>
                <ul className="flex flex-col gap-2.5 text-[15px] text-ink-500">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  href={`${NAVIGATION.join}?class=${classLevel}&track=${track}&plan=${t.id}`}
                  variant={featured ? 'primary' : 'outline'}
                  className="mt-auto w-full"
                >
                  Choose {t.name.toLowerCase()}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-[15px] text-ink-500">
          Not sure yet?{' '}
          <a href={NAVIGATION.workshops} className="font-semibold text-ink-900 underline underline-offset-4">
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
    <Suspense fallback={<div className="h-[640px] bg-surface" />}>
      <PricingContent />
    </Suspense>
  );
}
