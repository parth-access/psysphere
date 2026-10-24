import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Container } from './Container';
import { H2, Body, Eyebrow } from './Typography';

const courses = [
  { mark: '11', title: 'Class 11', description: 'Build foundations: full NCERT coverage, one concept at a time.', points: ['NCERT coverage', 'Concept building', 'Regular tests'], route: '/courses/class-11', tint: 'bg-mint' },
  { mark: '12', title: 'Class 12', description: 'Board focus: answer-writing practice and full mock exams.', points: ['Board focus', 'Answer writing', 'Mock exams'], route: '/courses/class-12', tint: 'bg-sky' },
  { mark: 'UG', title: 'CUET-UG', description: 'MCQ strategy, timing and guidance on psychology colleges.', points: ['MCQ strategy', 'Time management', 'College guidance'], route: '/courses/cuet-ug', tint: 'bg-lilac' },
  { mark: '2×', title: 'Boards + CUET', description: 'One combined track that prepares you for both exams.', points: ['Syllabus mapping', 'Dual mock tests', 'Priority support'], route: '/courses/boards-cuet', featured: true },
];

export function Courses() {
  return (
    <section id="courses" className="py-24 sm:py-32">
      <Container>
        <div className="mb-14 flex max-w-xl flex-col gap-4">
          <Eyebrow>Courses</Eyebrow>
          <H2>
            Pick your <em>path.</em>
          </H2>
          <Body>Dravina teaches each course live, following the CBSE psychology syllabus.</Body>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((c) => (
            <Link
              key={c.route}
              href={c.route}
              className={`group relative flex min-h-[320px] flex-col sm:min-h-[420px] gap-4 overflow-hidden rounded-[32px] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${
                c.featured ? 'bg-forest-900 text-paper' : `${c.tint} text-ink-900`
              }`}
            >
              <div className="flex items-start justify-between">
                <span className={`font-serif text-[72px] leading-[0.85] ${c.featured ? 'text-gold-400' : 'text-forest-800'}`}>{c.mark}</span>
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full transition-transform group-hover:rotate-45 ${
                    c.featured ? 'bg-gold-500 text-ink-900' : 'bg-surface text-ink-900'
                  }`}
                >
                  <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              {c.featured && (
                <span className="w-fit rounded-full bg-paper/10 px-3 py-1 text-[12px] font-bold uppercase tracking-wider text-gold-400">
                  Most complete
                </span>
              )}
              <h3 className="mt-auto font-serif text-[32px] leading-none">{c.title}</h3>
              <p className={`text-[15px] leading-relaxed ${c.featured ? 'text-paper/75' : 'text-ink-700'}`}>{c.description}</p>
              <ul className="flex flex-wrap gap-1.5">
                {c.points.map((p) => (
                  <li
                    key={p}
                    className={`rounded-full px-3 py-1 text-[13px] font-semibold ${c.featured ? 'bg-paper/10 text-paper' : 'bg-surface/70 text-ink-900'}`}
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
