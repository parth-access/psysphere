import { Navbar } from '@/features/marketing/ui/Navbar';
import { Footer } from '@/features/marketing/ui/Footer';
import { Container } from '@/features/marketing/ui/Container';
import { H1, H2, H3, Body } from '@/features/marketing/ui/Typography';
import { Button } from '@/features/marketing/ui/Button';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, Award, ShieldCheck, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function Class11CoursePage() {
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
              Class 11 • Academic Foundation
            </div>
            
            <H1 className="mb-6">Class 11 Psychology</H1>
            
            <p className="font-sans text-xl text-brand-text mb-8 leading-relaxed">
              Build a rock-solid foundation in human behaviour, cognitive processes, and sensory systems. Designed especially for students taking Psychology for the first time in high school.
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
                  <span className="text-sm font-medium text-brand-text">Full CBSE / School Coverage</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-brand-primary shrink-0" />
                <div>
                  <span className="block text-xs text-brand-text-muted uppercase tracking-wider font-semibold">Approach</span>
                  <span className="text-sm font-medium text-brand-text">Concept-Driven & Interactive</span>
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
                  {['What is Psychology?', 'Methods of Inquiry in Psychology', 'The Bases of Human Behaviour', 'Human Development', 'Sensory, Attentional and Perceptual Processes', 'Learning & Conditioning', 'Human Memory Systems', 'Thinking & Problem Solving', 'Motivation and Emotion'].map((chapter, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-brand-text">
                      <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                      <span>{chapter}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-brand-border">
                  <h4 className="font-serif font-semibold text-brand-text mb-2 text-base">Concept Building</h4>
                  <p className="text-sm text-brand-text-muted leading-relaxed">
                    We break down abstract theories using real-world experiments and human behaviour examples that students can observe in daily life, ensuring they never need to rely on rote learning.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-brand-border">
                  <h4 className="font-serif font-semibold text-brand-text mb-2 text-base">Exam Preparation & Subjective Strategy</h4>
                  <p className="text-sm text-brand-text-muted leading-relaxed">
                    Learn how to structuredly draft subjective questions, understand mark division, and build active recall strategies to score exceptionally well in school assessments.
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
              A comprehensive toolkit for every student to thrive under Dravina Gupta&apos;s personalized care.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Interactive Classes', desc: 'Live sessions filled with interactive case studies, group activities, and discussion-based learning.' },
                { title: 'Curated Notes', desc: 'Sparsely laid out, beautiful study booklets that summarize heavy chapters into easily digestible blueprints.' },
                { title: 'Regular Tests', desc: 'Weekly chapter-wise tests and subjective checks to evaluate readiness and answer structure.' },
                { title: 'Personalized Assignments', desc: 'Curated home tasks that reinforce active learning and boost memory retention.' },
                { title: 'Mindful Revision', desc: 'Strategic micro-revision loops designed for a stress-free and cohesive learning cycle.' },
                { title: 'Doubt Support', desc: 'Friendly, student-first support where doubts are answered supportively directly by Dravina.' },
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
                This course is meticulously calibrated for high-school students starting Class 11 with Psychology as an elective, or anyone desiring a visual and deep mental model of human psychology.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-sm font-semibold text-brand-text">No Prerequisites</span>
                    <span className="block text-xs text-brand-text-muted">No prior psychology background is required. We build from zero.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-sm font-semibold text-brand-text">Expected Outcome</span>
                    <span className="block text-xs text-brand-text-muted">95%+ mastery in high-school terms, strong conceptual clarity, and confident analytical thinking.</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-brand-border">
              <h3 className="font-serif text-lg font-semibold text-brand-text mb-4">Are you ready to:</h3>
              <ul className="space-y-4 text-sm text-brand-text">
                <li className="flex gap-3">
                  <span className="font-bold text-brand-primary">01.</span>
                  <span>Develop a genuine love for human behaviour instead of just rote-memorizing definitions?</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-brand-primary">02.</span>
                  <span>Write subjective answers elegantly with precise psychology terminology?</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-brand-primary">03.</span>
                  <span>Set up a beautiful board exam springboard in Class 11?</span>
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
                { q: "Is prior knowledge of psychology needed?", a: "No, prior knowledge is not required. Class 11 is where high schools introduce psychology, so we build all concepts from the very basics." },
                { q: "How are classes conducted?", a: "Classes are highly interactive, engaging-first, and conducted online using state-of-the-art tools to ensure students stay focused and conceptual." },
                { q: "Are study materials and worksheets provided?", a: "Yes. Every student receives curated notes, chapter-wise question banks, objective worksheets, and revision cards directly designed by Dravina Gupta." },
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
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">Start Your Journey in Psychology</h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">
              Join a free live workshop with Dravina Gupta and experience our interactive, compassionate teaching approach firsthand.
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
