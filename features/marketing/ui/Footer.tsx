import Link from 'next/link';
import { Container } from './Container';
import { Logo } from './Logo';

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
    <footer className="bg-ink-900 text-ink-300">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-4">
          <Link href="/" aria-label="Saarthi Classes home">
            <Logo tone="paper" />
          </Link>
          <p className="max-w-xs text-[15px] leading-relaxed">
            Psychology for Class 11, Class 12 and CUET-UG, taught live in small batches by Dravina Gupta. Part of{' '}
            <a href="https://www.saarthilife.com" className="text-paper underline underline-offset-4">Saarthi</a>.
          </p>
        </div>
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.12em] text-marigold-500">{c.title}</h2>
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
      <div className="border-t border-ink-700">
        <Container className="flex flex-wrap justify-between gap-2 py-6 text-[13px]">
          <p>© {new Date().getFullYear()} Saarthi Classes</p>
          <p>classes.saarthilife.com</p>
        </Container>
      </div>
    </footer>
  );
}
