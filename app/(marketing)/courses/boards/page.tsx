import { Navbar } from '@/features/marketing/ui/Navbar';
import { Footer } from '@/features/marketing/ui/Footer';
import { Container } from '@/features/marketing/ui/Container';
import { H1, H2, H3, Body } from '@/features/marketing/ui/Typography';
import { Button } from '@/features/marketing/ui/Button';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, Award, ShieldCheck, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function BoardsCuetCoursePage() {
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
              Class 12 • Dual Preparation Program
            </div>
            
            <H1 className="mb-6">Boards + CUET Integrated</H1>
            
            <p className="font-sans text-xl text-brand-text mb-8 leading-relaxed">
              The definitive high-school strategy. Synchronize descriptive board answer-writing with objective MCQ speed tactics, covering the entire spectrum with single-source material.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-brand-canvas border border-brand-border mb-8">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-brand-primary shrink-0" />
                <div>
                  <span className="block text-xs text-brand-text-muted uppercase tracking-wider font-semibold">Duration</span>
                  <span className="text-sm font-medium text-brand-text">Full Academic Year</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-brand-primary shrink-0" />
                <div>
                  <span className="block text-xs text-brand-text-muted uppercase tracking-wider font-semibold">Syllabus</span>
                  <span className="text-sm font-medium text-brand-text">Boards + 100% CUET Modules</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-brand-primary shrink-0" />
                <div>
                  <span className="block text-xs text-brand-text-muted uppercase tracking-wider font-semibold">Dual Target</span>
                  <span className="text-sm font-medium text-brand-text">95% in Boards & College Seat</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button href="/book-demo" className="!px-8 !py-4">
                Book Free Demo
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
                    'Variations in Psychological Attributes (Theory & MCQs)',
                    'Self and Personality (In-depth analysis & speed cases)',
                    'Meeting Life Challenges (Stress models & definitions)',
                    'Psychological Disorders (Clinical DSM/ICD classification)',
                    'Therapeutic Approaches (Techniques & match columns)',
                    'Attitude and Social Cognition (Attribution & social MCQs)',
                    'Social Influence and Group Processes (Group dynamics)',
                    'Psychology & Life (CUET only chapter)',
                    'Developing Psychological Skills (CUET only chapter)'
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
                  <h4 className="font-serif font-semibold text-brand-text mb-2 text-base">The Dual Advantage</h4>
                  <p className="text-sm text-brand-text-muted leading-relaxed">
                    Rather than studying separately, we use a single, comprehensive, conceptual reading flow. Understanding the depth of concepts answers both boards&apos; 6-mark questions and CUET&apos;s tricky assertion-reasoning items.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-brand-border">
                  <h4 className="font-serif font-semibold text-brand-text mb-2 text-base">Perfect Syllabus Mapping</h4>
                  <p className="text-sm text-brand-text-muted leading-relaxed">
                    Seamlessly transition from school exams to competitive entrance test modes with structured weekly checks mapping to both examination boards.
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
              A holistic ecosystem providing comprehensive prep for school excellence and college admissions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Unified Study Plans', desc: 'Saves time by studying boards and competitive levels synchronously.' },
                { title: 'Double Mock Testing', desc: 'Assessments alternating between descriptive subjective answers and online objective tests.' },
                { title: 'Integrated Study Material', desc: 'Visual booklets containing precise board marking metrics and CUET MCQ guidelines.' },
                { title: 'Exhaustive CBT Portal', desc: 'Complete access to our computer-based exam simulator matching the latest testing criteria.' },
                { title: 'Direct Mentor Access', desc: 'Get direct supportive guidance and prompt doubts resolved by Dravina Gupta.' },
                { title: 'Revision Maps', desc: 'Beautiful, curated flowcharts and charts summarizing clinical and diagnostic chapters.' },
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
                Designed for Class 12 students aiming for high percentages in their high school board evaluations and a 100 percentile in CUET to secure their admission in prestigious universities.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-sm font-semibold text-brand-text">Double-Pronged Strategy</span>
                    <span className="block text-xs text-brand-text-muted">Eliminates study repetition, maximizing prep time and reducing cognitive stress.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-sm font-semibold text-brand-text">Expected Outcome</span>
                    <span className="block text-xs text-brand-text-muted">95%+ in school boards, supreme confidence in objective MCQ testing, and college selection guidance.</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-brand-border">
              <h3 className="font-serif text-lg font-semibold text-brand-text mb-4">Integrated Mastery:</h3>
              <ul className="space-y-4 text-sm text-brand-text">
                <li className="flex gap-3">
                  <span className="font-bold text-brand-primary">01.</span>
                  <span>Eliminate double efforts and build deep clinical and diagnostic foundations.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-brand-primary">02.</span>
                  <span>Tackle clinical definitions with precise descriptions while developing MCQ speed.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-brand-primary">03.</span>
                  <span>Enjoy supportive mentoring that ensures both boards and competitive entrances are handled seamlessly.</span>
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
                { q: "How does the integrated approach save time?", a: "Instead of revising the same chapter once for boards and once for CUET, we learn the concept deeply at one stretch. Then, we practice subjective answers followed by MCQ speed tests. This saves up to 40% of standard study time." },
                { q: "Are deleted chapters of boards covered?", a: "Yes. Chapters like Chapter 8 and 9 which are not in the board syllabus but tested in CUET are covered thoroughly in our classes." },
                { q: "Is counseling included?", a: "Yes. Integrated students receive guidance throughout their college list drafting, CUET application filling, and university admissions cycle." },
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
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">Elevate Your Academic Potential</h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">
              Book a complimentary demo session with Dravina Gupta and experience our integrated, board-and-CUET methodology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/book-demo" className="!px-8">
                Book Free Demo
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
