import type { Metadata } from 'next';
import { CourseDetail } from '@/features/marketing/ui/CourseDetail';

export const metadata: Metadata = {
  title: 'Boards + CUET Psychology | Saarthi Classes',
  description: 'One combined Class 12 psychology track for CBSE boards and CUET-UG, taught live by Dravina Gupta.',
};

export default function BoardsCuetCoursePage() {
  return (
    <CourseDetail
      mark="2×"
      tint="bg-peach"
      eyebrow="Class 12 · Boards + CUET"
      title="Boards + CUET, together"
      intro="You learn each chapter once and practise it two ways: board-style written answers and CUET-style MCQs. One plan and one set of material cover both exams."
      facts={[
        { label: 'Duration', value: 'Full academic year' },
        { label: 'Syllabus', value: 'Full Class 12 NCERT' },
        { label: 'Focus', value: 'Boards + MCQs' },
        { label: 'Format', value: 'Live, small batch' },
      ]}
      chapters={[
        'Variations in Psychological Attributes',
        'Self and Personality',
        'Meeting Life Challenges',
        'Psychological Disorders',
        'Therapeutic Approaches',
        'Attitude and Social Cognition',
        'Social Influence and Group Processes',
        'Psychology and Life',
        'Developing Psychological Skills',
      ]}
      chaptersNote="Board chapters plus the extra chapters CUET tests."
      focus={[
        { title: 'One concept, two formats', desc: 'Dravina teaches each topic once. You then practise it as a written answer and as MCQs.' },
        { title: 'Syllabus mapping', desc: 'A single plan that shows what each exam needs from every chapter.' },
      ]}
      included={[
        { title: 'Unified study plan', desc: 'Boards and CUET on one timeline, so you revise each chapter once.' },
        { title: 'Dual mock tests', desc: 'Written board papers alternating with timed MCQ tests.' },
        { title: 'Combined material', desc: 'Notes with board keywords and CUET quick-revision points.' },
        { title: 'Answer feedback', desc: 'Dravina marks your board-style answers and writes notes on each.' },
        { title: 'Priority support', desc: 'Dravina answers your doubts herself.' },
        { title: 'College guidance', desc: 'Help with college lists and the CUET application cycle.' },
      ]}
      idealFor={[
        'You are writing Class 12 boards and CUET in the same year.',
        'You want one plan that covers both exams.',
        'You would like guidance through college admissions too.',
      ]}
      faqs={[
        { q: 'How does the combined track save time?', a: 'You learn each chapter once, then practise written answers followed by MCQs. You skip the second round of revision for CUET.' },
        { q: 'Are the CUET-only chapters covered?', a: 'Yes. Psychology and Life and Developing Psychological Skills are taught in full.' },
        { q: 'Is college guidance included?', a: 'Yes. You get guidance on drafting a college list and the admissions process.' },
      ]}
      joinHref="/join?class=class_12&track=cuet"
      feesHref="/pricing?class=class12&package=cuet"
    />
  );
}
