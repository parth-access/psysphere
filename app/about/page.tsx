import { Navbar } from '@/features/marketing/ui/Navbar';
import { TeacherProfile } from '@/features/marketing/ui/TeacherProfile';
import { Footer } from '@/features/marketing/ui/Footer';
import { Container } from '@/features/marketing/ui/Container';
import { H1, H2, Body } from '@/features/marketing/ui/Typography';
import { Brain, Heart, Compass, Eye } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-brand-canvas flex flex-col">
      <Navbar />
      
      {/* Editorial Header */}
      <section className="pt-36 pb-20 bg-white border-b border-brand-border">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block py-1 px-3 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold tracking-widest uppercase mb-6">
              Our Story
            </div>
            <H1 className="mb-6">About PsySphere</H1>
            <p className="font-sans text-xl text-brand-text leading-relaxed">
              We believe psychology is not just a syllabus—it is the language of life. PsySphere is dedicated to changing how high school students study and understand the human mind.
            </p>
          </div>
        </Container>
      </section>

      {/* Philosophy Callout */}
      <section className="py-20 bg-brand-canvas border-b border-brand-border">
        <Container>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <H2 className="mb-6">Why Psychology Deserves Better Learning</H2>
              <p className="text-brand-text mb-4 leading-relaxed text-sm">
                Too often, psychology is reduced to heavy definitions and dry rote memorization. Students memorize terms like &quot;conditioning&quot; or &quot;cognitive appraisal&quot; without observing them in action.
              </p>
              <p className="text-brand-text leading-relaxed text-sm">
                At PsySphere, founded by Dravina Gupta, we do things differently. We map every theory to real human experiences, classic experiments, and case studies. This turns a complex syllabus into an engaging exploration, naturally leading to excellent marks in boards and CUET-UG.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-brand-border space-y-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 bg-brand-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Brain className="h-5 w-5 text-brand-primary" />
                </div>
                <div>
                  <h4 className="font-serif font-semibold text-brand-text mb-1 text-sm">Concept First</h4>
                  <p className="text-xs text-brand-text-muted leading-relaxed">Build strong visual models and understand underlying mechanisms deeply.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 bg-brand-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Heart className="h-5 w-5 text-brand-primary" />
                </div>
                <div>
                  <h4 className="font-serif font-semibold text-brand-text mb-1 text-sm">Compassionate Support</h4>
                  <p className="text-xs text-brand-text-muted leading-relaxed">Dissolve academic stress and anxiety with supportive, student-first teaching.</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white border-b border-brand-border">
        <Container>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-brand-canvas border border-brand-border">
              <div className="h-12 w-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Compass className="h-6 w-6 text-brand-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-brand-text mb-4">Our Mission</h3>
              <p className="text-sm text-brand-text-muted leading-relaxed">
                To simplify psychology, inspire conceptual understanding, and equip Class 11 and 12 students with the tools to master their academics and perform brilliantly in exams with calm, relaxed minds.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-brand-canvas border border-brand-border">
              <div className="h-12 w-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Eye className="h-6 w-6 text-brand-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-brand-text mb-4">Our Vision</h3>
              <p className="text-sm text-brand-text-muted leading-relaxed">
                To become the premier learning home for high-school psychology students in India, nurturing analytical minds, critical thinkers, and future mental health professionals.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Teacher Profile Section embedded */}
      <TeacherProfile />

      <Footer />
    </main>
  );
}
