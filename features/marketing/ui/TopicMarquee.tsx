import { Sparkle } from './Doodles';

/** NCERT psychology chapters, Class 11 then Class 12. */
const topics = [
  'What is Psychology?',
  'Methods of Enquiry',
  'Human Development',
  'Sensation, Attention & Perception',
  'Learning',
  'Human Memory',
  'Thinking',
  'Motivation & Emotion',
  'Variations in Psychological Attributes',
  'Self & Personality',
  'Meeting Life Challenges',
  'Psychological Disorders',
  'Therapeutic Approaches',
  'Attitude & Social Cognition',
  'Social Influence & Group Processes',
];

export function TopicMarquee() {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {topics.map((t) => (
        <li key={t} className="flex items-center gap-6 pr-6 font-serif text-2xl text-paper sm:text-[28px]">
          {t}
          <Sparkle className="h-4 w-4 text-gold-500" />
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label="Topics covered across Class 11 and Class 12" className="overflow-hidden bg-forest-900 py-5">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
