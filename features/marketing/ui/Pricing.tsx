'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container } from './Container';
import { H2, Body } from './Typography';
import { Button } from './Button';
import { Check } from 'lucide-react';
import { pricing, CoursePricing, PricingTier } from '@/constants/pricing';
import Link from 'next/link';
import { NAVIGATION } from '@/constants/navigation';

function PricingContent() {
  const searchParams = useSearchParams();
  const [activeClass, setActiveClass] = useState<'class11' | 'class12'>('class11');
  const [activeType, setActiveType] = useState<'standard' | 'cuet'>('standard');
  
  useEffect(() => {
    const classParam = searchParams.get('class');
    const packageParam = searchParams.get('package');
    
    if (classParam === 'class11' || classParam === 'class12') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveClass(classParam);
    }
    if (packageParam === 'standard' || packageParam === 'cuet') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveType(packageParam);
    }
  }, [searchParams]);

  const currentPricing = pricing[activeClass][activeType] || [];

  return (
    <section className="py-24 bg-brand-canvas" id="pricing">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <H2 className="mb-6">Transparent Fee Structure</H2>
          <Body>
            Invest in your child&apos;s academic future. No hidden fees, no surprise charges.
            Choose the plan that fits your preparation goals.
          </Body>
        </div>
        
        {/* Class Toggles */}
        <div className="flex flex-col items-center gap-6 mb-16">
          <div className="inline-flex p-1.5 bg-brand-border/50 rounded-2xl border border-brand-border">
            <button
              onClick={() => setActiveClass('class11')}
              className={`px-8 py-3 rounded-xl font-medium text-sm transition-all ${
                activeClass === 'class11' 
                  ? 'bg-white text-brand-text shadow-sm' 
                  : 'text-brand-text-muted hover:text-brand-text hover:bg-white/50'
              }`}
            >
              Class XI
            </button>
            <button
              onClick={() => setActiveClass('class12')}
              className={`px-8 py-3 rounded-xl font-medium text-sm transition-all ${
                activeClass === 'class12' 
                  ? 'bg-white text-brand-text shadow-sm' 
                  : 'text-brand-text-muted hover:text-brand-text hover:bg-white/50'
              }`}
            >
              Class XII
            </button>
          </div>
          
          {/* Sub Type Toggles */}
          <div className="inline-flex p-1 bg-white rounded-xl border border-brand-border shadow-sm">
            <button
              onClick={() => setActiveType('standard')}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeType === 'standard' 
                  ? 'bg-brand-canvas text-brand-text border border-brand-border shadow-sm' 
                  : 'text-brand-text-muted hover:text-brand-text'
              }`}
            >
              Standard (Boards)
            </button>
            <button
              onClick={() => setActiveType('cuet')}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                activeType === 'cuet' 
                  ? 'bg-brand-canvas text-brand-text border border-brand-border shadow-sm' 
                  : 'text-brand-text-muted hover:text-brand-text'
              }`}
            >
              Standard + CUET
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-accent/20 text-brand-accent">
                Recommended
              </span>
            </button>
          </div>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          {currentPricing.map((tier) => (
            <div 
              key={tier.id}
              className={`relative bg-white rounded-[28px] border transition-all duration-300 flex flex-col h-full ${
                tier.bestValue 
                  ? 'border-brand-accent shadow-[0_20px_40px_rgba(201,162,39,0.15)] md:-translate-y-4' 
                  : tier.popular
                    ? 'border-brand-primary shadow-[0_20px_40px_rgba(109,91,208,0.1)] md:-translate-y-2'
                    : 'border-brand-border shadow-sm hover:shadow-md'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span className="bg-brand-primary text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}
              {tier.bestValue && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span className="bg-brand-accent text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                    Best Value
                  </span>
                </div>
              )}
              
              <div className="p-8 pb-6 border-b border-brand-border flex-1">
                <h3 className="font-serif text-xl font-semibold text-brand-text mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-4 h-9 overflow-hidden relative">
                  <span 
                    key={tier.price} 
                    className="text-3xl font-bold tracking-tight text-brand-text animate-slide-up absolute"
                  >
                    ₹{tier.price.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-brand-text-muted font-medium mb-1">
                  {tier.classes} Live Classes
                </div>
                {tier.save ? (
                  <div className="text-sm font-semibold text-brand-success h-5 overflow-hidden relative">
                    <span key={tier.save} className="animate-slide-up absolute">
                      Save ₹{tier.save.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <div className="h-5"></div>
                )}
              </div>
              
              <div className="p-8 pt-6">
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className={`h-5 w-5 shrink-0 ${tier.bestValue ? 'text-brand-accent' : tier.popular ? 'text-brand-primary' : 'text-brand-primary/60'}`} />
                      <span className="font-sans text-sm text-brand-text font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  href={`${NAVIGATION.bookDemo}?class=${activeClass}&package=${activeType}&duration=${tier.id}&price=${tier.price}`}
                  variant={tier.bestValue || tier.popular ? 'primary' : 'outline'} 
                  className={`w-full ${tier.bestValue ? 'bg-brand-text hover:bg-brand-text-muted shadow-none' : ''}`}
                >
                  Enroll Now
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-20 text-center max-w-lg mx-auto bg-white p-8 rounded-3xl border border-brand-border shadow-sm">
          <h4 className="font-serif text-2xl font-semibold mb-3">Still confused?</h4>
          <p className="text-brand-text-muted mb-6">Let us help you choose the right plan for your academic goals.</p>
          <Button href={NAVIGATION.bookDemo} variant="secondary" className="w-full sm:w-auto">
            Book a FREE counselling session
          </Button>
        </div>
      </Container>
    </section>
  );
}

export function Pricing() {
  return (
    <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading pricing...</div>}>
      <PricingContent />
    </Suspense>
  );
}
