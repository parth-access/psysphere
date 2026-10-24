import type { Metadata } from 'next';
import { Brain, Heart, Compass, Eye } from 'lucide-react';
import { Navbar } from '@/features/marketing/ui/Navbar';
import { TeacherProfile } from '@/features/marketing/ui/TeacherProfile';
import { ClosingCta } from '@/features/marketing/ui/ClosingCta';
import { Footer } from '@/features/marketing/ui/Footer';
import { Container } from '@/features/marketing/ui/Container';
import { H1, H2, Body, Eyebrow } from '@/features/marketing/ui/Typography';
import { Scribble } from '@/features/marketing/ui/Doodles';

export const metadata: Metadata = {
  title: 'About | Saarthi Classes',
  description: 'Why Saarthi Classes teaches psychology concept-first, and the teacher behind it, Dravina Gupta.',
};

const principles = [
  { icon: Brain, title: 'Concept first', desc: 'Students meet each theory through an experiment or an everyday example before they learn the definition.', tint: 'bg-mint' },
  { icon: Heart, title: 'A calm classroom', desc: 'Board year brings enough stress. Dravina keeps class calm, so you can ask the “silly” question.', tint: 'bg-peach' },
];

const missionVision = [
  {
    icon: Compass,
    title: 'Our mission',
    desc: 'To simplify psychology, build real understanding, and help Class 11 and 12 students do well in their exams with a calm mind.',
  },
  {
    icon: Eye,
    title: 'Our vision',
    desc: 'To be a learning home for school psychology students in India, nurturing analytical thinkers and future mental health professionals.',
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main id="main">
        <section className="relative overflow-hidden pb-20 pt-36 sm:pt-44">
          <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" aria-hidden="true" />
          <Container className="relative flex max-w-4xl flex-col items-center gap-6 text-center">
            <Eyebrow>Our story</Eyebrow>
            <H1>
              Psychology, taught through{' '}
              <span className="relative inline-block">
                <em>real life.</em>
                <Scribble className="absolute -bottom-2 left-0 h-4 w-full text-gold-500" />
              </span>
            </H1>
            <Body className="max-w-2xl text-[19px]">
              Saarthi Classes teaches school students how the mind works, with examples they recognise from their own
              lives.
            </Body>
          </Container>
        </section>

        <section className="bg-paper-deep py-24 sm:py-28">
          <Container className="grid items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-5">
              <Eyebrow>Why we teach differently</Eyebrow>
              <H2>
                Psychology you can <em>see around you.</em>
              </H2>
              <Body>
                Most students meet psychology as a list of definitions. They memorise “conditioning” or “cognitive
                appraisal” and can’t point to either one in their own lives.
              </Body>
              <Body>
                Dravina Gupta founded Saarthi Classes to teach it the other way round. She starts with a classic
                experiment or a case study, and the definition comes after. Students who understand the idea write
                better answers in boards and CUET-UG.
              </Body>
            </div>
            <div className="flex flex-col gap-5">
              {principles.map(({ icon: Icon, ...p }) => (
                <div key={p.title} className="flex gap-5 rounded-[28px] bg-surface p-7 shadow-soft">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${p.tint} text-forest-800`}>
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="mb-1.5 text-lg font-bold text-ink-900">{p.title}</h3>
                    <p className="text-[15px] leading-relaxed text-ink-500">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-24 sm:py-28">
          <Container className="grid gap-5 md:grid-cols-2">
            {missionVision.map(({ icon: Icon, ...m }, i) => (
              <div
                key={m.title}
                className={`flex flex-col gap-5 rounded-[32px] p-8 sm:p-10 ${i === 0 ? 'bg-forest-900 text-paper' : 'bg-lilac text-ink-900'}`}
              >
                <Icon className={`h-8 w-8 ${i === 0 ? 'text-gold-400' : 'text-forest-800'}`} aria-hidden="true" />
                <h2 className="font-serif text-[40px] leading-none">{m.title}</h2>
                <p className={`text-[17px] leading-relaxed ${i === 0 ? 'text-paper/80' : 'text-ink-700'}`}>{m.desc}</p>
              </div>
            ))}
          </Container>
        </section>

        <TeacherProfile />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
