import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from './Container';
import { H2, Body, Eyebrow } from './Typography';

const courses = [
  { title: 'Class 11', description: 'Build foundations: full NCERT coverage, one concept at a time.', points: ['NCERT coverage', 'Concept building', 'Regular tests'], route: '/courses/class-11' },
  { title: 'Class 12', description: 'Board focus: answer-writing practice and full mock exams.', points: ['Board focus', 'Answer writing', 'Mock exams'], route: '/courses/class-12' },
  { title: 'CUET-UG', description: 'MCQ strategy, timing and guidance on psychology colleges.', points: ['MCQ strategy', 'Time management', 'College guidance'], route: '/courses/cuet-ug' },
  { title: 'Boards + CUET', description: 'One combined track that prepares you for both exams.', points: ['Syllabus mapping', 'Dual mock tests', 'Priority support'], route: '/courses/boards-cuet', featured: true },
];

export function Courses() {
  return (
    <section id="courses" className="py-20 sm:py-24">
      <Container>
        <div className="mb-10 max-w-xl">
          <Eyebrow className="mb-3">Courses</Eyebrow>
          <H2 className="mb-3">Choose your course</H2>
          <Body>All courses follow the CBSE psychology syllabus and are taught live by Dravina.</Body>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((c) => (
            <Link
              key={c.route}
              href={c.route}
              className={`group flex flex-col gap-4 rounded-2xl p-7 transition-colors ${
                c.featured ? 'bg-ink-900 text-paper hover:bg-ink-700' : 'border border-line bg-surface hover:border-ink-300'
              }`}
            >
              <h3 className="font-serif text-2xl font-semibold">{c.title}</h3>
              <p className={`text-[15px] leading-relaxed ${c.featured ? 'text-ink-300' : 'text-ink-500'}`}>{c.description}</p>
              <ul className={`flex flex-col gap-1.5 text-[15px] ${c.featured ? 'text-paper' : 'text-ink-900'}`}>
                {c.points.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-marigold-500" aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[15px] font-semibold">
                View course <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
