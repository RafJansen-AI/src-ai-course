// What the SRC default student policy means in practice, per assessment type,
// and in-class exercises that fit. Wording stays inside the student policy (V8, s-1 and s-practice).

const BASE_MAY = [
  'ask AI to explain concepts or readings you don\'t understand, and check the explanation against the course literature',
  'use AI to quiz you or argue against your ideas',
  'get feedback on a draft you wrote yourself, and decide which suggestions to take',
  'check spelling, grammar and clarity',
];
const BASE_MAYNOT = [
  'hand in text, analysis or code written by AI, even if you edited or paraphrased it',
  'let AI rewrite your draft into a "better" version',
  'cite sources you haven\'t read and checked yourself',
];

export const PRACTICE = {
  essay: { may: BASE_MAY, mayNot: BASE_MAYNOT, tip: 'Take-home writing is where the rules are hardest to check. Pair it with something done in class: a short handwritten version of the core argument, or two minutes explaining it in the seminar.' },
  brief: { may: BASE_MAY, mayNot: [...BASE_MAYNOT.slice(0, 1), 'let AI produce the analysis or the recommendations', ...BASE_MAYNOT.slice(1)], tip: 'Ask for an outline early and discuss it with the student. A short conversation on the final brief tells you more than any reading of it.' },
  takehome: { may: BASE_MAY.slice(0, 2).concat(['check spelling, grammar and clarity']), mayNot: BASE_MAYNOT, tip: 'A take-home exam can\'t be supervised. If it decides the grade, consider moving the decisive part to an in-class or oral exam.' },
  exam: { may: ['use AI to prepare: explain the material, quiz you, test your understanding'], mayNot: ['use any AI tool or device during the exam itself'], tip: 'The one setting where "no AI" can be enforced. Make it count: test understanding and application, not recall.', during: true },
  oral: { may: ['use AI to prepare: explain the material, quiz you, play the examiner', 'get feedback on slides you made yourself'], mayNot: ['present content or answers you can\'t explain yourself'], tip: 'Oral examination is your strongest tool. Questions about the student\'s own work reveal more than anything written.' },
  seminar: { may: ['use AI to prepare: explain the readings, quiz you, raise counterarguments'], mayNot: ['read out or post AI-written contributions as your own'], tip: 'Start the seminar with five minutes of handwritten notes on the reading. It shows who prepared and gives everyone something to say.' },
  group: { may: BASE_MAY, mayNot: BASE_MAYNOT, tip: 'Each member discloses their own AI use, and each should be able to explain any part of the work. Ask them to, in the presentation.' },
  code: { may: ['ask AI to explain code, error messages and methods', 'get feedback on code you wrote yourself', 'check the language in your write-up'], mayNot: ['hand in code or analysis written by AI, even if you edited it', 'hand in results you can\'t explain line by line'], tip: 'If writing the code isn\'t the learning outcome, AI-experienced teachers may allow more (adapt the rules). Either way, a live walkthrough of the student\'s script is the best check.' },
  thesis: { may: BASE_MAY, mayNot: BASE_MAYNOT, tip: 'Agree with the supervisor and examiner on AI use, in writing, at the start. Regular supervision meetings are your in-person check.' },
  other: { may: BASE_MAY, mayNot: BASE_MAYNOT, tip: 'Ask yourself which part of this you could see the student do in person.' },
};

export const EXERCISES = [
  { id: 'tenmin', title: 'Ten-minute write', text: 'In class, by hand: students write the core argument of their upcoming assignment in ten minutes. Collect it. You now have a baseline in their own words.', types: ['essay', 'brief', 'takehome', 'thesis'] },
  { id: 'explain', title: 'Explain it back', text: 'In the seminar, pick a paragraph from each student\'s submission and ask them to explain it in their own words. Two minutes each, announced in advance.', types: ['essay', 'brief', 'group', 'code', 'thesis', 'seminar'] },
  { id: 'critique', title: 'Critique the chatbot', text: 'Show an AI answer to a course question. In groups, students find the errors, the missing perspectives and the unsupported claims, then check them against the literature. Teaches the judgement the rules ask for.', types: ['*'] },
  { id: 'coldopen', title: 'Seminar cold open', text: 'Start with five minutes of handwritten answers to one question about the reading. No devices. Use it to start the discussion, not to grade.', types: ['seminar', 'essay'] },
  { id: 'walkthrough', title: 'Live code walkthrough', text: 'Each student runs their script and explains what it does and why, step by step. Five minutes. Anything they can\'t explain doesn\'t count.', types: ['code'] },
  { id: 'sources', title: 'Show me the page', text: 'Students bring two of their references to the seminar and show the page that supports their claim. Catches fabricated and unread sources fast.', types: ['brief', 'essay', 'thesis'] },
  { id: 'disclose', title: 'Disclosure practice', text: 'In the first week, give three short scenarios of AI use. Students write the disclosure for each and decide whether the use is allowed under the course rules. Ten minutes; clears up most confusion.', types: ['*'] },
];

export function exercisesFor(types) {
  const set = new Set(types);
  return EXERCISES.filter((e) => e.types.includes('*') || e.types.some((t) => set.has(t)));
}
