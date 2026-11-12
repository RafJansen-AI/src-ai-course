import { esc, renderMarkdown } from '../lib/content.js';

// verdict: 'yes' (allowed), 'no' (not allowed), 'grey' (the rules don't settle it)
// Explanations are Markdown and may use [[rule:...]] and [[term]] syntax.
export const SCENARIOS = [
  {
    id: 'rubric',
    text: 'You ask a chatbot to draft a grading rubric from your course\'s learning outcomes. You then rework it until it says what you actually expect.',
    verdict: 'yes',
    why: 'Drafting rubrics is named as authorised use in [[rule:t-1|clause 1]]. The rubric is yours once you have reworked it, and it is written before any student work exists, so it does not touch an individual grade.',
  },
  {
    id: 'second-opinion',
    text: 'You have marked an essay. Just to be safe, you paste it with the rubric into a chatbot and ask what grade it would give. You don\'t plan to change your grade unless it disagrees a lot.',
    verdict: 'no',
    why: 'This is the "second opinion" case, and [[rule:t-3b|clause 3B]] rules it out: AI must not propose, justify or influence a grade, directly or indirectly. "Unless it disagrees a lot" is exactly the influence the rule is about. It\'s also [[high-risk AI|high-risk-ai-system]] use under the EU AI Act.',
  },
  {
    id: 'polish',
    text: 'After deciding the grade, you paste your written comments (no name) into Copilot to fix grammar and tone. You add: "I used Copilot to check the language in these comments."',
    verdict: 'yes',
    why: 'Post-grade polishing without changing the substance is explicitly allowed in [[rule:t-3b|clause 3B]], and your disclosure is exactly the kind the policy asks for ([[rule:t-transparency|Transparency matters]]).',
  },
  {
    id: 'detector',
    text: 'An essay reads oddly smooth. You run it through an [[AI detector]], not as proof, "just to have a look".',
    verdict: 'no',
    why: '[[rule:t-3c|Clause 3C]] is flat: don\'t use AI detection tools to infer whether text was AI-generated. They are unreliable and flag human writing, more often for non-native English writers. "Just a look" still shapes how you read the student. Talk to the student about the work instead (chapter 7).',
  },
  {
    id: 'mcq',
    text: 'You upload your lecture slides and ask for 20 multiple-choice questions for the exam. You check each one for correctness and keep 12.',
    verdict: 'yes',
    why: 'Generating exam questions from your own material is listed as acceptable use ([[rule:t-acceptable|Acceptable use]]). The condition is that you review them for correctness, bias and fit with the course, which you did. Generated questions are often subtly wrong or test trivia, so the review is real work.',
  },
  {
    id: 'ai-feedback',
    text: 'You have 30 seminar reflections to give formative feedback on. You let a chatbot write the feedback, skim it, fix a few things and send it with a note saying AI helped.',
    verdict: 'no',
    why: 'Disclosure doesn\'t save this one. Lightly edited AI feedback isn\'t you giving feedback, and the policy lists it as unacceptable ([[rule:t-unacceptable|Unacceptable use]]). Students want your judgement. The one exception is a clearly announced experiment, where students know in advance what they are getting and why.',
    note: 'Clause 3A does allow AI for formative feedback "at your discretion". Our reading: AI may help you *word* feedback whose substance is yours, not write it for you. The next policy version should make this clearer.',
  },
  {
    id: 'notes-to-prose',
    text: 'You write your own bullet-point notes on each reflection, then ask AI to turn your notes into friendly sentences. You check each one and tell students how you used it.',
    verdict: 'yes',
    why: 'The judgement is yours; the AI only does the wording. That\'s allowed for non-graded work under [[rule:t-3a|clause 3A]] as long as you verify and disclose ([[rule:t-2|clause 2]]). Compare it with the previous case: the question is always whose thinking it is.',
  },
  {
    id: 'thesis-upload',
    text: 'Before a supervision meeting you upload a student\'s unpublished thesis draft to a free chatbot to get a quick summary.',
    verdict: 'no',
    why: 'Unpublished theses are named as sensitive in [[rule:t-4|clause 4]]: don\'t upload them unless the tool is institutionally approved for that data. A free consumer chatbot isn\'t. There\'s a second problem: reading the draft *is* the supervision. Outsourcing it is the "core academic judgement" the policy keeps with you.',
  },
  {
    id: 'health-email',
    text: 'A student emails about a mental-health crisis and asks for an extension. You paste the email into a chatbot to help you write a kind reply.',
    verdict: 'no',
    why: 'Health information is the first example of sensitive data in [[rule:t-4|clause 4]]. Don\'t paste it into an AI tool. If you want help with tone, ask a general question with no details ("how do I kindly grant an extension and point to support services?") and write the reply yourself.',
  },
  {
    id: 'evaluations',
    text: 'You paste 40 anonymous course-evaluation comments into a chatbot and ask it to group them into themes for your course report.',
    verdict: 'grey',
    why: 'Not graded, not student-facing, and anonymised, so most of the policy\'s concerns don\'t bite. But free-text comments can still identify people ("as the only PhD student in the group...") and the policy points to GDPR. Our reading: fine in an [[approved tool]] after you strip anything identifying, and you still read the comments yourself. If unsure, ask the SRC GDPR contact.',
  },
  {
    id: 'transcribe',
    text: 'You use AI to transcribe handwritten exam answers so they\'re easier to read before you grade them.',
    verdict: 'grey',
    why: 'Transcription doesn\'t propose a grade, so it isn\'t clearly banned by [[rule:t-3b|clause 3B]]. But exam answers are personal data ([[rule:t-4|clause 4]]), and a transcription error can quietly change what you grade, which is "indirect influence". Our reading: avoid it unless the tool is approved for the data, and always grade from the original.',
  },
  {
    id: 'require-ai',
    text: 'You require students to generate a first draft with ChatGPT and then critique it. You don\'t say how to judge the output; that\'s part of the challenge.',
    verdict: 'no',
    why: 'Requiring genAI "without guidance and support in evaluating the outcome" is on the unacceptable list ([[rule:t-unacceptable|Unacceptable use]]). The task itself can be a good one. Fix it by teaching how to check AI output, and think about students who don\'t want a commercial account: offer an [[approved tool]] or an alternative.',
  },
];

const LABEL = { yes: 'Allowed', no: 'Not allowed', grey: 'Grey area' };

export default function scenarios(el, { store }) {
  let idx = 0;
  const answers = () => store.get().scenarios || {};
  // start at the first unanswered one
  const firstOpen = SCENARIOS.findIndex((s) => !answers()[s.id]);
  idx = firstOpen === -1 ? SCENARIOS.length : firstOpen;

  const draw = (focusSel) => {
    if (idx >= SCENARIOS.length) return drawSummary();
    const s = SCENARIOS[idx];
    const picked = answers()[s.id];
    el.innerHTML = `<div class="card scen">
      <div class="scen-top"><span class="pill">Case ${idx + 1} of ${SCENARIOS.length}</span>
        <span class="scen-dots" aria-hidden="true">${SCENARIOS.map((x, i) => `<span class="dot ${answers()[x.id] ? (answers()[x.id] === x.verdict || x.verdict === 'grey' ? 'ok' : 'miss') : ''} ${i === idx ? 'cur' : ''}"></span>`).join('')}</span></div>
      <p class="scen-text">${renderInline(s.text)}</p>
      <div class="choice-row" role="group" aria-label="Your verdict">
        ${['yes', 'no', 'grey'].map((v) => `<button type="button" class="verdict-btn v-${v}" data-v="${v}" aria-pressed="${picked === v}" ${picked ? 'disabled' : ''}>${LABEL[v]}</button>`).join('')}
      </div>
      <div class="scen-result" aria-live="polite">${picked ? resultHtml(s, picked) : ''}</div>
      <div class="scen-nav">
        <button type="button" class="btn small secondary" data-prev ${idx === 0 ? 'disabled' : ''}>← Previous case</button>
        ${picked ? `<button type="button" class="btn small" data-next>${idx === SCENARIOS.length - 1 ? 'See your results' : 'Next case →'}</button>` : ''}
      </div></div>`;
    el.querySelectorAll('[data-v]').forEach((b) => b.addEventListener('click', () => {
      store.update((st) => { st.scenarios = { ...st.scenarios, [s.id]: b.dataset.v }; });
      draw('[data-next]');
    }));
    el.querySelector('[data-prev]')?.addEventListener('click', () => { idx--; draw('.verdict-btn'); });
    el.querySelector('[data-next]')?.addEventListener('click', () => { idx++; draw('.verdict-btn:not([disabled]), [data-next], [data-again]'); });
    if (focusSel) el.querySelector(focusSel)?.focus();
  };

  const resultHtml = (s, picked) => {
    const match = picked === s.verdict;
    const head = match
      ? `<strong>Agreed: ${LABEL[s.verdict].toLowerCase()}.</strong>`
      : s.verdict === 'grey'
        ? `<strong>We'd call this a grey area.</strong> Your "${LABEL[picked].toLowerCase()}" is a defensible reading, and here's why it isn't clear-cut.`
        : `<strong>We'd say: ${LABEL[s.verdict].toLowerCase()}.</strong>`;
    return `<div class="verdict-box v-${s.verdict}">
      <p class="verdict-head"><span class="verdict-tag">${LABEL[s.verdict]}</span> ${head}</p>
      ${renderMarkdown(s.why)}
      ${s.note ? `<aside class="callout callout-grey"><p class="callout-title"><span class="tag">Grey area</span></p>${renderMarkdown(s.note)}</aside>` : ''}
    </div>`;
  };

  const drawSummary = () => {
    const a = answers();
    let agree = 0, greyHits = 0;
    const misses = [];
    for (const s of SCENARIOS) {
      if (a[s.id] === s.verdict) agree++;
      else if (s.verdict === 'grey') greyHits++;
      else misses.push(s);
    }
    const strictMisses = misses.filter((s) => s.verdict === 'no' && a[s.id] !== 'no');
    el.innerHTML = `<div class="card">
      <h3 style="margin-top:0">You agreed with our reading on ${agree} of ${SCENARIOS.length} cases.</h3>
      ${strictMisses.length ? `<p>Worth a second look, because these are firm "no"s in the policy:</p><ul>${strictMisses.map((s) => `<li><button type="button" class="btn ghost" data-jump="${s.id}">${esc(short(s.text))}</button></li>`).join('')}</ul>` : '<p>You didn\'t call anything allowed that the policy rules out. Good.</p>'}
      <p>The three rules that decide most cases:</p>
      <ol><li><strong>AI stays out of grades</strong>, before and during grading, including "second opinions". Language polish after the grade is fine.</li>
      <li><strong>Sensitive student data stays out of unapproved tools.</strong> Health, discipline, unpublished theses.</li>
      <li><strong>Your judgement, your words, your name.</strong> AI can help with wording; it can't do the thinking students expect from you. Say how you used it.</li></ol>
      <p style="margin:0"><button type="button" class="btn small secondary" data-again>Go through the cases again</button></p></div>`;
    el.querySelectorAll('[data-jump]').forEach((b) => b.addEventListener('click', () => {
      idx = SCENARIOS.findIndex((s) => s.id === b.dataset.jump); draw('.verdict-box');
    }));
    el.querySelector('[data-again]').addEventListener('click', () => {
      store.update((st) => { st.scenarios = {}; }); idx = 0; draw('.verdict-btn');
    });
  };

  draw();
}

function renderInline(md) {
  return renderMarkdown(md).replace(/^<p>|<\/p>\s*$/g, '');
}
function short(t) { return t.length > 90 ? `${t.slice(0, 87).replace(/\s+\S*$/, '')}...` : t; }
