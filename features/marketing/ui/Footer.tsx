import Link from 'next/link';
import { Container } from './Container';
import { Logo } from './Logo';
import { WhatsAppButton } from './WhatsAppButton';
import { SITE, whatsappUrl } from '@/constants/site';

const columns = [
  {
    title: 'Courses',
    links: [
      { label: 'Class 11', href: '/courses/class-11' },
      { label: 'Class 12', href: '/courses/class-12' },
      { label: 'CUET-UG', href: '/courses/cuet-ug' },
      { label: 'Boards + CUET', href: '/courses/boards-cuet' },
    ],
  },
  {
    title: 'Saarthi Classes',
    links: [
      { label: 'Free workshops', href: '/workshops' },
      { label: 'Join a batch', href: '/join' },
      { label: 'About Dravina', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Student log in', href: '/sign-in' },
    ],
  },
  {
    title: 'Policies',
    links: [
      { label: 'Privacy', href: '/privacy-policy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Refunds', href: '/refund-policy' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="overflow-hidden bg-forest-950 text-paper/70">
      <Container className="grid gap-12 pb-12 pt-20 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-4">
          <Link href="/" aria-label="Saarthi Classes home">
            <Logo tone="paper" />
          </Link>
          <p className="max-w-xs text-[15px] leading-relaxed">
            Psychology for Class 11, Class 12 and CUET-UG, taught live in small batches by Dravina Gupta. Part of{' '}
            <a href={SITE.parent.url} className="text-paper underline underline-offset-4">Saarthi</a>.
          </p>
          <address className="flex flex-col gap-1.5 text-[15px] not-italic">
            <a href={`mailto:${SITE.email}`} className="hover:text-paper">{SITE.email}</a>
            <a href={`tel:+${SITE.phoneDigits}`} className="hover:text-paper">{SITE.phone}</a>
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="hover:text-paper">WhatsApp</a>
            <span>{SITE.address}</span>
          </address>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-[15px]" aria-label="Social media">
            {SITE.social.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-paper underline-offset-4 hover:underline">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.12em] text-gold-400">{c.title}</h2>
            <ul className="flex flex-col gap-3 text-[15px]">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-paper">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <div aria-hidden="true" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="select-none whitespace-nowrap font-serif text-[22vw] leading-[0.8] text-paper/[0.06] lg:text-[240px]">Saarthi</p>
      </div>
      <div className="border-t border-paper/10">
        <Container className="flex flex-wrap justify-between gap-2 py-6 text-[13px]">
          <p>© {new Date().getFullYear()} Saarthi Classes</p>
          <p>
            A part of <a href={SITE.parent.url} className="underline underline-offset-4 hover:text-paper">Saarthi</a>
          </p>
        </Container>
      </div>
      <WhatsAppButton />
    </footer>
  );
}
