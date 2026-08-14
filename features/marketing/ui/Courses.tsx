import { Container } from './Container';
import { H2, Body } from './Typography';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';


const courses = [
  {
    id: 'class-11',
    title: 'Class 11',
    description: 'Build a strong foundation in Psychology. Perfect for students starting their journey.',
    features: ['NCERT Coverage', 'Concept Building', 'Regular Assessments'],
    pricingQuery: '?class=class11&package=standard',
    route: '/courses/class-11',
  },
  {
    id: 'class-12',
    title: 'Class 12',
    description: 'Intensive board preparation with strategic study blueprints.',
    features: ['Board Focus', 'Answer Writing', 'Mock Exams'],
    highlight: true,
    pricingQuery: '?class=class12&package=standard',
    route: '/courses/class-12',
  },
  {
    id: 'cuet-ug',
    title: 'CUET-UG Crash',
    description: 'Targeted preparation for India\'s top psychology colleges.',
    features: ['MCQ Strategy', 'Time Management', 'University Guidance'],
    pricingQuery: '?class=class12&package=cuet',
    route: '/courses/cuet-ug',
  },
  {
    id: 'integrated',
    title: 'Board + CUET',
    description: 'The ultimate dual-preparation strategy for ambitious students.',
    features: ['Syllabus Mapping', 'Dual Mock Tests', 'Priority Support'],
    pricingQuery: '?class=class12&package=cuet',
    route: '/courses/boards-cuet',
  },
];

export function Courses() {
  return (
    <section className="py-24 bg-white border-b border-brand-border" id="courses">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <H2 className="mb-6">Academic Courses</H2>
          <Body>
            Structured curriculum designed to maximize retention, conceptual clarity,
            and exam performance.
          </Body>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, i) => (
            <div 
              key={course.id} 
              className={`p-8 rounded-3xl border flex flex-col h-full transition-all duration-300 hover:-translate-y-1 ${
                course.highlight 
                  ? 'bg-brand-primary text-white border-brand-primary shadow-xl shadow-brand-primary/20' 
                  : 'bg-brand-canvas border-brand-border hover:shadow-lg'
              }`}
            >
              <h3 className={`font-serif text-2xl font-semibold mb-3 ${course.highlight ? 'text-white' : 'text-brand-text'}`}>
                {course.title}
              </h3>
              <p className={`font-sans text-sm mb-8 leading-relaxed ${course.highlight ? 'text-white/80' : 'text-brand-text-muted'}`}>
                {course.description}
              </p>
              
              <div className="mt-auto space-y-4 mb-8">
                {course.features.map((feature, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <Check className={`h-5 w-5 shrink-0 ${course.highlight ? 'text-white' : 'text-brand-primary'}`} />
                    <span className={`font-sans text-sm font-medium ${course.highlight ? 'text-white/90' : 'text-brand-text'}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
              
              <Link 
                href={course.route}
                className={`inline-flex items-center justify-between w-full p-4 rounded-2xl font-medium text-sm transition-colors ${
                  course.highlight
                    ? 'bg-white text-brand-primary hover:bg-brand-canvas'
                    : 'bg-white text-brand-text border border-brand-border hover:border-brand-primary hover:text-brand-primary'
                }`}
              >
                View Details
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
