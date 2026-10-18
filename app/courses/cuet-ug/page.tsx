import { Navbar } from '@/features/marketing/ui/Navbar';
import { Footer } from '@/features/marketing/ui/Footer';
import { Container } from '@/features/marketing/ui/Container';
import { H1, H2, H3, Body } from '@/features/marketing/ui/Typography';
import { Button } from '@/features/marketing/ui/Button';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, Award, ShieldCheck, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function CuetUgCoursePage() {
  return (
    <main className="min-h-screen bg-brand-canvas flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-36 pb-20 bg-white border-b border-brand-border">
        <Container>
          <div className="max-w-4xl mx-auto">
            <Link 
              href="/courses" 
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-text-muted hover:text-brand-text mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Link>
            
            <div className="inline-block py-1 px-3 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold tracking-widest uppercase mb-6">
              CUET-UG • College Admission
            </div>
            
            <H1 className="mb-6">CUET-UG Psychology</H1>
            
            <p className="font-sans text-xl text-brand-text mb-8 leading-relaxed">
              Targeted preparation for India&apos;s premier psychology departments. Master MCQ speed drills, assertion-reason techniques, and university-admissions strategies.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-brand-canvas border border-brand-border mb-8">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-brand-primary shrink-0" />
                <div>
                  <span className="block text-xs text-brand-text-muted uppercase tracking-wider font-semibold">Format</span>
                  <span className="text-sm font-medium text-brand-text">Intensive Crash Program</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-brand-primary shrink-0" />
                <div>
                  <span className="block text-xs text-brand-text-muted uppercase tracking-wider font-semibold">Syllabus</span>
                  <span className="text-sm font-medium text-brand-text">Class 12 NCERT (All 9 Chapters)</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-brand-primary shrink-0" />
                <div>
                  <span className="block text-xs text-brand-text-muted uppercase tracking-wider font-semibold">Aim</span>
                  <span className="text-sm font-medium text-brand-text">Admission in Top Colleges</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button href="/workshops" className="!px-8 !py-4">
                Join a Free Workshop
              </Button>
              <Button href="/contact" variant="secondary" className="!px-8 !py-4">
                Contact Teacher
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* What You'll Learn Section */}
      <section className="py-20 bg-brand-canvas border-b border-brand-border">
        <Container>
          <div className="max-w-4xl mx-auto">
            <H2 className="mb-10">What You&apos;ll Learn</H2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white p-8 rounded-2xl border border-brand-border">
                <h3 className="font-serif text-lg font-semibold text-brand-text mb-4">Core Chapters Covered</h3>
                <ul className="space-y-3">
                  {[
                    'Variations in Psychological Attributes',
                    'Self and Personality',
                    'Meeting Life Challenges',
                    'Psychological Disorders',
                    'Therapeutic Approaches',
                    'Attitude and Social Cognition',
                    'Social Influence and Group Processes',
                    'Psychology and Life (Full Chapter)',
                    'Developing Psychological Skills (Full Chapter)'
                  ].map((chapter, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-brand-text">
                      <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                      <span>{chapter}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-brand-border">
                  <h4 className="font-serif font-semibold text-brand-text mb-2 text-base">MCQ Mastery & Elimination</h4>
                  <p className="text-sm text-brand-text-muted leading-relaxed">
                    Learn rapid-elimination rules, mapping keywords in assertion-reasoning questions, matching columns under pressure, and decoding tricky case studies.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-brand-border">
                  <h4 className="font-serif font-semibold text-brand-text mb-2 text-base">High-Yield Revisions</h4>
                  <p className="text-sm text-brand-text-muted leading-relaxed">
                    Focus on the most frequently tested concepts, psychologist names, historical dates, diagnostic classification details, and mental scales.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-white border-b border-brand-border">
        <Container>
          <div className="max-w-4xl mx-auto">
            <H2 className="mb-4 text-center">Program Features</H2>
            <p className="text-center text-brand-text-muted mb-12 max-w-xl mx-auto">
              Intense, targeted tools built to maximize speeds and secure 100 percentile ranks.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'MCQ-Focused Drills', desc: 'Live sessions practicing high-speed quizzes and assertion-reason formats.' },
                { title: 'Full Length Simulators', desc: 'CBT (Computer-Based Test) simulation environments to practice exact CUET conditions.' },
                { title: 'Fact Formula Sheets', desc: 'Rapid memory checklists mapping psychologists, dates, definitions, and theories.' },
                { title: 'Complete Chapter Coverage', desc: 'Detailed classes on chapters omitted from high school boards but present in CUET.' },
                { title: 'Daily Speed Targets', desc: 'Meticulous homework tasks targeted at answer speeds under 40 seconds.' },
                { title: 'Admissions & University Advice', desc: 'Candid mentorship regarding college lists, course selections, and cutoffs.' },
              ].map((feat, i) => (
                <div key={i} className="p-6 rounded-2xl border border-brand-border bg-brand-canvas">
                  <h3 className="font-serif text-base font-semibold text-brand-text mb-2">{feat.title}</h3>
                  <p className="text-xs text-brand-text-muted leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Ideal For */}
      <section className="py-20 bg-brand-canvas border-b border-brand-border">
        <Container>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <H2 className="mb-6">Who This Is Ideal For</H2>
              <p className="text-brand-text mb-6 leading-relaxed">
                Tailored for ambitious Class 12 high school students who are looking to secure admissions in Delhi University (LSR, Jesus & Mary, IPCW), BHU, Christ, or JAMIA, and want to master psychology MCQs.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-sm font-semibold text-brand-text">CUET Syllabus Mapping</span>
                    <span className="block text-xs text-brand-text-muted">Includes chapters deleted from CBSE (e.g. Chapter 8 and 9) but crucial for CUET.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-sm font-semibold text-brand-text">Expected Outcome</span>
                    <span className="block text-xs text-brand-text-muted">High 100 percentile readiness, stress-free objective thinking, and excellent conceptual recall.</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-brand-border">
              <h3 className="font-serif text-lg font-semibold text-brand-text mb-4">CUET Success Pillars:</h3>
              <ul className="space-y-4 text-sm text-brand-text">
                <li className="flex gap-3">
                  <span className="font-bold text-brand-primary">01.</span>
                  <span>Practice over 1,500+ high-quality curated MCQs matching current testing agency patterns.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-brand-primary">02.</span>
                  <span>Learn how to identify subtle question traps and trick distractors in objective papers.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-brand-primary">03.</span>
                  <span>Gain clear strategies to manage the short duration of the real CBT exam effortlessly.</span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white border-b border-brand-border">
        <Container>
          <div className="max-w-3xl mx-auto">
            <H2 className="mb-10 text-center">Frequently Asked Questions</H2>
            <div className="space-y-6">
              {[
                { q: "Does this course cover chapters omitted from school boards?", a: "Yes. CUET includes the complete Class 12 NCERT syllabus including Chapters 8 (Psychology & Life) and 9 (Developing Psychological Skills) which are usually omitted in school boards. We cover these chapters comprehensively." },
                { q: "Will there be full computer-based tests?", a: "Yes. Students practice on our mock portal that mimics the actual testing interface to ensure complete familiarity with CBT conditions." },
                { q: "Do you assist with college selections?", a: "Yes. Dravina Gupta provides customized counseling sessions explaining course options, eligibility criterion, and college priorities." },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-brand-canvas border border-brand-border">
                  <h4 className="font-sans text-sm font-semibold text-brand-text mb-2 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-brand-primary shrink-0" />
                    {item.q}
                  </h4>
                  <p className="text-xs text-brand-text-muted leading-relaxed pl-6">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-charcoal text-white text-center">
        <Container>
          <div className="max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">Secure Your Dream College Seat</h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">
              Book a complimentary demo session with Dravina Gupta and see how we make competitive preparation simple and high-scoring.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/workshops" className="!px-8">
                Join a Free Workshop
              </Button>
              <Button href="/contact" variant="secondary" className="!px-8 border-white/20 text-white hover:bg-white/10">
                Contact Now
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
