import type { Metadata } from 'next';
import { CourseDetail } from '@/features/marketing/ui/CourseDetail';

export const metadata: Metadata = {
  title: 'CUET-UG Psychology | Saarthi Classes',
  description: 'CUET-UG psychology preparation with Dravina Gupta: MCQ strategy, timing and college guidance.',
};

export default function CuetCoursePage() {
  return (
    <CourseDetail
      mark="UG"
      tint="bg-lilac"
      eyebrow="CUET-UG · College admission"
      title="CUET-UG Psychology"
      intro="Psychology for the entrance exam. You work on MCQ technique and speed, cover the chapters many schools skip, and get guidance on choosing colleges."
      facts={[
        { label: 'For', value: 'Class 12 students' },
        { label: 'Syllabus', value: 'Full Class 12 NCERT' },
        { label: 'Focus', value: 'MCQs + timing' },
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
      chaptersNote="Includes the two chapters CUET tests that many schools leave out for boards."
      focus={[
        { title: 'MCQ technique', desc: 'Spotting traps, eliminating distractors and handling assertion–reason questions.' },
        { title: 'Speed with accuracy', desc: 'Timed practice to get you through the paper inside the time limit.' },
      ]}
      included={[
        { title: 'Live MCQ sessions', desc: 'Practice in the question formats CUET uses.' },
        { title: 'Mock tests', desc: 'Timed CUET-style tests, which the class goes through together.' },
        { title: 'Quick-revision sheets', desc: 'Psychologists, theories and key terms on one page.' },
        { title: 'Full chapter coverage', desc: 'All nine CUET chapters, including the two schools skip.' },
        { title: 'College guidance', desc: 'Help thinking through courses, colleges and cut-offs.' },
        { title: 'Weekly parent report', desc: 'We email attendance and scores each Sunday.' },
      ]}
      idealFor={[
        'You want to study psychology at university.',
        'You are aiming for colleges like LSR, JMC, IPCW, Jamia, BHU or Christ.',
        'You understand the content but need MCQ speed.',
      ]}
      faqs={[
        { q: 'Are the chapters skipped in boards covered?', a: 'Yes. CUET draws on the complete Class 12 NCERT book, and Dravina teaches Psychology and Life and Developing Psychological Skills in full.' },
        { q: 'Is there help with choosing colleges?', a: 'Yes. Dravina talks students through course options, eligibility and how to prioritise colleges.' },
        { q: 'Should I take this with boards?', a: 'If you are also writing Class 12 boards, the Boards + CUET track covers both in one plan.' },
      ]}
      joinHref="/join?class=class_12&track=cuet"
      feesHref="/pricing?class=class12&package=cuet"
    />
  );
}
