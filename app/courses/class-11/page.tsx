import type { Metadata } from 'next';
import { CourseDetail } from '@/features/marketing/ui/CourseDetail';

export const metadata: Metadata = {
  title: 'Class 11 Psychology | Saarthi Classes',
  description: 'Live Class 11 psychology classes with Dravina Gupta. Full NCERT coverage, built from the basics.',
};

export default function Class11CoursePage() {
  return (
    <CourseDetail
      mark="11"
      tint="bg-mint"
      eyebrow="Class 11 · Foundations"
      title="Class 11 Psychology"
      intro="Your first year of psychology, starting from zero. Dravina explains behaviour, memory and learning with examples from daily life, and you carry those ideas into Class 12."
      facts={[
        { label: 'Duration', value: 'Full academic year' },
        { label: 'Syllabus', value: 'CBSE / NCERT' },
        { label: 'Prior knowledge', value: 'None needed' },
        { label: 'Format', value: 'Live, small batch' },
      ]}
      chapters={[
        'What is Psychology?',
        'Methods of Enquiry in Psychology',
        'The Bases of Human Behaviour',
        'Human Development',
        'Sensory, Attentional and Perceptual Processes',
        'Learning',
        'Human Memory',
        'Thinking',
        'Motivation and Emotion',
      ]}
      chaptersNote="Every NCERT chapter, one concept at a time."
      focus={[
        { title: 'Concept building', desc: 'Dravina breaks each abstract theory into an experiment or an example you can spot in daily life, so you remember it without cramming.' },
        { title: 'Answer writing from day one', desc: 'How to structure a school-exam answer, where the marks are, and the keywords that matter.' },
      ]}
      included={[
        { title: 'Live classes', desc: 'Small batches with discussion and case studies.' },
        { title: 'Study material', desc: 'Short notes for each long chapter.' },
        { title: 'Weekly tests', desc: 'A short chapter test, which the class goes through together next time.' },
        { title: 'Answer feedback', desc: 'Dravina marks your answers and writes notes on structure.' },
        { title: 'Doubt support', desc: 'Ask your doubts in class or after it.' },
        { title: 'Weekly parent report', desc: 'We email attendance and scores each Sunday.' },
      ]}
      idealFor={[
        'You are taking psychology for the first time.',
        'You want to understand the ideas behind the definitions.',
        'You want a strong base before Class 12 boards.',
      ]}
      faqs={[
        { q: 'Do I need any prior knowledge?', a: 'No. Schools introduce psychology in Class 11, so the course starts from the basics.' },
        { q: 'How are classes run?', a: 'Dravina teaches small batches live online and leaves time for questions in each class.' },
        { q: 'Is study material included?', a: 'Yes. Every plan includes study material and doubt support.' },
      ]}
      joinHref="/join?class=class_11&track=standard"
      feesHref="/pricing?class=class11&package=standard"
    />
  );
}
