/** Pure test logic: scoring, shuffling and the bulk-paste format. No database access here. */
import type { TestOption } from "@/db/schema/academic/tests";

export type Marking = { marksPerCorrect: number; penaltyPerWrong: number; xpPerCorrect: number };
export type KeyedQuestion = { id: string; correctOptionId: string };

export function scoreAnswers(questions: KeyedQuestion[], answers: Record<string, string>, m: Marking) {
  let correct = 0;
  let wrong = 0;
  for (const q of questions) {
    const a = answers[q.id];
    if (!a) continue;
    if (a === q.correctOptionId) correct++;
    else wrong++;
  }
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    correct,
    wrong,
    skipped: questions.length - correct - wrong,
    score: round(correct * m.marksPerCorrect - wrong * m.penaltyPerWrong),
    maxScore: round(questions.length * m.marksPerCorrect),
    xp: correct * m.xpPerCorrect,
    maxXp: questions.length * m.xpPerCorrect,
  };
}

function shuffled<T>(items: T[], random: () => number) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** The order one student sees questions and options in. */
export function buildOrder(
  questions: { id: string; options: TestOption[] }[],
  shuffle: boolean,
  random: () => number = Math.random
) {
  const questionOrder = shuffle ? shuffled(questions.map((q) => q.id), random) : questions.map((q) => q.id);
  const optionOrder: Record<string, string[]> = {};
  for (const q of questions) {
    const ids = q.options.map((o) => o.id);
    optionOrder[q.id] = shuffle ? shuffled(ids, random) : ids;
  }
  return { questionOrder, optionOrder };
}

/** Option ids are short and stable within a question: "a", "b", "c"... */
export const optionId = (index: number) => String.fromCharCode(97 + index);

export type DraftQuestion = { prompt: string; options: TestOption[]; correctOptionId: string; explanation: string | null };

export const BULK_FORMAT_EXAMPLE = `Q: Who described five psychosexual stages of development?
A) Erik Erikson
B) Sigmund Freud *
C) Jean Piaget
D) B. F. Skinner
Explanation: Freud's stages are oral, anal, phallic, latency and genital.

Q: Which part of the neuron receives signals from other neurons?
A) Axon
B) Dendrite *
C) Myelin sheath
D) Terminal button`;

const OPTION_LINE = /^\(?([A-Fa-f])[).:]\s*(.*)$/;
const QUESTION_LINE = /^(?:Q\s*\d*\s*[:.)]|\d+\s*[.)])\s*(.*)$/i;
const EXPLANATION_LINE = /^(?:Explanation|Exp|Reason)\s*[:\-]\s*(.*)$/i;

/**
 * Parses pasted questions. Each question starts with "Q:" (or "1."), options are "A)" to "F)",
 * the right option ends with "*", and an optional "Explanation:" line follows. Blank lines are ignored.
 */
export function parseBulkQuestions(text: string): { questions: DraftQuestion[]; errors: string[] } {
  type Block = { prompt: string[]; options: { text: string; correct: boolean }[]; explanation: string[]; line: number; mode: "prompt" | "options" | "explanation" };
  const blocks: Block[] = [];
  let cur: Block | null = null;

  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const q = QUESTION_LINE.exec(line);
    const o = OPTION_LINE.exec(line);
    const e = EXPLANATION_LINE.exec(line);
    if (q && (!cur || cur.options.length > 0 || cur.mode === "explanation")) {
      cur = { prompt: [q[1]], options: [], explanation: [], line: i + 1, mode: "prompt" };
      blocks.push(cur);
    } else if (!cur) {
      cur = { prompt: [line], options: [], explanation: [], line: i + 1, mode: "prompt" };
      blocks.push(cur);
    } else if (e && cur.options.length > 0) {
      cur.explanation.push(e[1]);
      cur.mode = "explanation";
    } else if (o && cur.mode !== "explanation") {
      const correct = /\*\s*$/.test(o[2]);
      cur.options.push({ text: o[2].replace(/\s*\*\s*$/, "").trim(), correct });
      cur.mode = "options";
    } else if (cur.mode === "explanation") {
      cur.explanation.push(line);
    } else if (cur.mode === "options") {
      // A long option wrapped onto the next line; the * may be at the end of this part.
      const last = cur.options[cur.options.length - 1];
      last.correct ||= /\*\s*$/.test(line);
      last.text = `${last.text} ${line.replace(/\s*\*\s*$/, "")}`.trim();
    } else {
      cur.prompt.push(line);
    }
  });

  const questions: DraftQuestion[] = [];
  const errors: string[] = [];
  blocks.forEach((b, n) => {
    const label = `Question ${n + 1} (line ${b.line})`;
    const prompt = b.prompt.join(" ").trim();
    const correct = b.options.filter((o) => o.correct).length;
    if (!prompt) errors.push(`${label}: the question text is empty.`);
    else if (b.options.length < 2) errors.push(`${label}: needs at least 2 options, written A) B) C)…`);
    else if (b.options.length > 6) errors.push(`${label}: has more than 6 options.`);
    else if (b.options.some((o) => !o.text)) errors.push(`${label}: one of the options is empty.`);
    else if (correct !== 1) errors.push(`${label}: mark exactly one option as right by ending it with *. Found ${correct}.`);
    else {
      const options = b.options.map((o, i) => ({ id: optionId(i), text: o.text }));
      questions.push({
        prompt,
        options,
        correctOptionId: optionId(b.options.findIndex((o) => o.correct)),
        explanation: b.explanation.join(" ").trim() || null,
      });
    }
  });
  if (blocks.length === 0) errors.push("Nothing to add. Paste questions in the format shown.");
  return { questions, errors };
}

export type TestPhase = "draft" | "scheduled" | "open" | "closed";

export function testPhase(t: { publishedAt: Date | null; opensAt: Date; closesAt: Date }, now: Date): TestPhase {
  if (!t.publishedAt) return "draft";
  if (now < t.opensAt) return "scheduled";
  if (now < t.closesAt) return "open";
  return "closed";
}
