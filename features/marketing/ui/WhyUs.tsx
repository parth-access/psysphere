import { Container } from './Container';
import { H2, Body } from './Typography';
import { BookOpen, Brain, CheckCircle, FileText, Target, Users } from 'lucide-react';

const features = [
  { icon: Users, title: 'Expert Faculty', desc: 'Learn directly from educators with 10+ years of psychology teaching experience.' },
  { icon: Brain, title: 'Concept-Based Learning', desc: 'No rote memorization. We build a deep understanding of psychological principles.' },
  { icon: CheckCircle, title: 'Weekly Tests', desc: 'Regular assessments to track progress and identify areas for improvement.' },
  { icon: BookOpen, title: 'Study Material', desc: 'Premium, curated notes and practice booklets designed for board exams.' },
  { icon: Target, title: 'CUET Preparation', desc: 'Integrated coaching for CUET-UG alongside your Class 11 and 12 syllabus.' },
  { icon: FileText, title: 'Parent Support', desc: 'Transparent tracking and regular updates on your child\'s academic progress.' },
];

export function WhyUs() {
  return (
    <section className="py-24 bg-brand-canvas" id="about">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <H2 className="mb-6">Why Choose PsySphere?</H2>
          <Body>
            We don&apos;t just teach psychology; we prepare students for academic excellence
            and real-world application through a structured, supportive environment.
          </Body>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-brand-border shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-6">
                <feature.icon className="h-7 w-7 text-brand-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-brand-text mb-3">{feature.title}</h3>
              <p className="font-sans text-brand-text-muted leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
