import type { Metadata } from 'next';
import { CourseDetail } from '@/features/marketing/ui/CourseDetail';

export const metadata: Metadata = {
  title: 'Class 12 Psychology | Saarthi Classes',
  description: 'Live Class 12 psychology board preparation with Dravina Gupta: concepts, answer-writing and mock exams.',
};

export default function Class12CoursePage() {
  return (
    <CourseDetail
      mark="12"
      tint="bg-sky"
      eyebrow="Class 12 · Board preparation"
      title="Class 12 Psychology"
      intro="A calm board year. You build clear concepts, practise answers the way CBSE marks them, and sit full mock papers until the real exam feels familiar."
      facts={[
        { label: 'Duration', value: 'Full academic year' },
        { label: 'Syllabus', value: 'CBSE / NCERT' },
        { label: 'Focus', value: 'Boards' },
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
      ]}
      chaptersNote="The board chapters, taught against the CBSE marking pattern."
      focus={[
        { title: 'Answer-writing that scores', desc: 'You practise the structure, phrasing and keywords examiners look for each week.' },
        { title: 'Mock papers and review', desc: 'You sit full timed papers in board format, then go through them in class to see what to fix.' },
      ]}
      included={[
        { title: 'Live classes', desc: 'Discussions that make the drier chapters stick.' },
        { title: 'Board-focused notes', desc: 'Short notes with definitions and keywords marked.' },
        { title: 'Weekly tests', desc: 'Chapter tests in board format.' },
        { title: 'Mock exams', desc: 'Timed full papers before the boards.' },
        { title: 'Answer feedback', desc: 'Dravina marks your answers and writes notes on structure and content.' },
        { title: 'Weekly parent report', desc: 'We email attendance and scores each Sunday.' },
      ]}
      idealFor={[
        'You are in Class 12 with psychology for boards.',
        'You know the content but lose marks in how you write it.',
        'You want steady weekly practice through the year.',
      ]}
      faqs={[
        { q: 'Is this aligned with the latest CBSE syllabus?', a: 'Yes. Dravina teaches from the current NCERT textbook and the CBSE marking pattern.' },
        { q: 'Are answers reviewed individually?', a: 'Yes. Dravina marks your tests and practice answers and writes feedback on each.' },
        { q: 'Can I add CUET preparation?', a: 'Yes. Choose the Boards + CUET track to prepare for both exams together.' },
      ]}
      joinHref="/join?class=class_12&track=standard"
      feesHref="/pricing?class=class12&package=standard"
    />
  );
}
