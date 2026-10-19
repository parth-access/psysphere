import { Navbar } from '@/features/marketing/ui/Navbar';
import { Footer } from '@/features/marketing/ui/Footer';
import { Container } from '@/features/marketing/ui/Container';
import { H1, H2, H3, Body } from '@/features/marketing/ui/Typography';
import { Button } from '@/features/marketing/ui/Button';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, Award, ShieldCheck, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function Class12CoursePage() {
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
              Class 12 • Board Preparation
            </div>
            
            <H1 className="mb-6">Class 12 Psychology</H1>
            
            <p className="font-sans text-xl text-brand-text mb-8 leading-relaxed">
              Master the board exam syllabus, build exquisite answer-writing structures, and achieve academic excellence. Tailored specifically for Class 12 students aiming for 95%+ in boards.
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
                  <span className="text-sm font-medium text-brand-text">Complete Board Alignment</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-brand-primary shrink-0" />
                <div>
                  <span className="block text-xs text-brand-text-muted uppercase tracking-wider font-semibold">Goal</span>
                  <span className="text-sm font-medium text-brand-text">95%+ in Boards</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button href="/workshops" className="!px-8 !py-4">
                Join a Free Workshop
              </Button>
              <Button href="/join?class=class_12&track=standard" variant="outline" className="!px-8 !py-4">
                Join this course
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
                  {['Variations in Psychological Attributes', 'Self and Personality', 'Meeting Life Challenges', 'Psychological Disorders', 'Therapeutic Approaches', 'Attitude and Social Cognition', 'Social Influence and Group Processes'].map((chapter, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-brand-text">
                      <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                      <span>{chapter}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-brand-border">
                  <h4 className="font-serif font-semibold text-brand-text mb-2 text-base">Answer Writing Mastery</h4>
                  <p className="text-sm text-brand-text-muted leading-relaxed">
                    We practice how to formulate structured, high-scoring answers. Learn precise keyword placement, psychological definitions, and bullet-point formatting to meet board checkers&apos; standards.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-brand-border">
                  <h4 className="font-serif font-semibold text-brand-text mb-2 text-base">Mock Reviews & Board Blueprints</h4>
                  <p className="text-sm text-brand-text-muted leading-relaxed">
                    Gain exposure to board paper trends, past-year analyses, and strict timeline-based mock examinations with personalized, rigorous feedback.
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
            <H2 className="mb-4 text-center">What’s included</H2>
            <p className="text-center text-brand-text-muted mb-12 max-w-xl mx-auto">
              Strategic support designed to maximize board scoring potential while keeping pressure levels low.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Interactive Sessions', desc: 'Engage-first live classes where dry chapters turn into fascinating, relatable discussions.' },
                { title: 'Editorial Notes', desc: 'Our premium board booklets contain concise blueprints, definitions, and keyword highlights.' },
                { title: 'Weekly Assessment', desc: 'Chapter-wise tests mirroring board formats to build confidence and muscle memory.' },
                { title: 'Exhaustive Test Series', desc: 'Pre-board mock tests timed carefully to help students master stress and time management.' },
                { title: 'Daily Doubt Clearing', desc: 'Immediate student support to ensure no concept remains fuzzy or unmastered.' },
                { title: 'Micro-Revision Cards', desc: 'Handy summaries of key clinical terms and diagnostic criteria for fast memory recall.' },
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
                Specifically structured for Class 12 students taking CBSE or equivalent high school psychology, who want to secure 95%+ marks, improve subjective answer writing, and establish strong conceptual foundations.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-sm font-semibold text-brand-text">Exhaustive Alignment</span>
                    <span className="block text-xs text-brand-text-muted">Perfect alignment with NCERT, CBSE evaluation blueprints, and board-marking keys.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-sm font-semibold text-brand-text">Expected Outcome</span>
                    <span className="block text-xs text-brand-text-muted">Mastery of clinical and personality concepts, beautiful presentation, and a confident score of 95%+.</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-brand-border">
              <h3 className="font-serif text-lg font-semibold text-brand-text mb-4">Board Prep Excellence:</h3>
              <ul className="space-y-4 text-sm text-brand-text">
                <li className="flex gap-3">
                  <span className="font-bold text-brand-primary">01.</span>
                  <span>Learn the exact phrasing and technical keywords board checkers actively search for.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-brand-primary">02.</span>
                  <span>Practice structured paper solving to finish your board papers comfortably with time to review.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-brand-primary">03.</span>
                  <span>Experience compassionate learning that dissolves pre-exam anxiety and stress.</span>
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
                { q: "Is this course aligned with the latest CBSE syllabus?", a: "Yes. The course is fully updated and in perfect alignment with the latest CBSE guidelines, NCERT textbook, and board exam marking pattern." },
                { q: "Does the teacher review answers individually?", a: "Absolutely. Every test and assignment undergoes meticulous individual review by Dravina Gupta. Students receive detailed feedback on their answer structures, presentation, and content." },
                { q: "What if a student misses a class?", a: "Recorded backups of classes are securely available, ensuring no student lags behind in their preparation." },
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
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">Ace Your Board Exams with Confidence</h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">
              Join a free live workshop with Dravina Gupta and experience our board-focused interactive methodology.
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
