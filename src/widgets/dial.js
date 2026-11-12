import { esc, renderMarkdown } from '../lib/content.js';
import { typeLabel, EXAMPLE } from './course-setup.js';

// The AI-use levels. Adapted from the Umeå University guidance table and the
// "AI assessment scale" idea; wording written for SRC and checked against the SRC student policy.
export const LEVELS = [
  {
    id: 0, name: 'No AI', short: 'No AI tools at all',
    rule: 'You may not use generative AI tools for any part of this assignment, including brainstorming and language editing. Ordinary spell-check in your word processor is fine.',
    disclose: null,
    fits: 'Skills students must show unaided: on-site exams, oral exams, in-class writing, basic methods.',
  },
  {
    id: 1, name: 'Language help only', short: 'Spelling, grammar and clarity of your own text',
    rule: 'You may use AI tools only to check spelling, grammar and clarity in text you have written yourself. You may not use AI to generate ideas, structure, arguments, analysis or new text.',
    disclose: 'Add one line at the end saying which tool you used for language checking.',
    fits: 'Writing where the thinking and argument are what you assess, and you don\'t want to penalise non-native writers.',
  },
  {
    id: 2, name: 'AI as tutor', short: 'Explain, quiz, discuss; the work is all yours',
    rule: 'You may use AI to help you learn: explaining concepts, quizzing you, discussing the readings. Everything you submit (text, analysis, structure, references) must be your own. Don\'t paste or paraphrase AI-generated text into your submission.',
    disclose: 'If AI meaningfully shaped your understanding or approach, say which tool you used and how, in two or three sentences.',
    fits: 'Reflections, essays and exams where the point is the student\'s own understanding and argument.',
  },
  {
    id: 3, name: 'AI as feedback partner', short: 'Tutor, plus feedback on your own draft',
    rule: 'You may use AI as a tutor and to get feedback on a draft you wrote yourself. You decide which suggestions to take. You may not let AI rewrite your draft or write sections for you. Check every fact and reference against a real source.',
    disclose: 'Describe which tool you used, for what, and how its feedback changed your work.',
    fits: 'This is roughly the SRC default when a course says nothing. Good for most formative work and many take-home assignments.',
    isDefault: true,
  },
  {
    id: 4, name: 'AI for specified parts', short: 'AI may do named parts of the work',
    rule: 'You may use AI for the parts of the work listed below. You must check and be able to explain everything AI produced, and the rest of the work must be your own.',
    disclose: 'Keep a short log: which tool, what you asked, what you kept and what you changed. Hand it in with the work.',
    fits: 'Courses where something other than the AI-able part is being assessed, e.g. code is a means, not the learning outcome.',
    needsParts: true,
  },
  {
    id: 5, name: 'AI as part of the task', short: 'Using and judging AI is what\'s assessed',
    rule: 'This assignment requires you to use AI. You are assessed on how well you direct, check and critique what it produces, not on the AI\'s output itself. Instructions on how to evaluate the output are included in the brief.',
    disclose: 'Include your prompts and the AI output you worked from, and explain your judgement of it.',
    fits: 'Assignments about AI literacy, or critique-the-AI tasks. You must give students guidance on judging the output and offer an option that doesn\'t need a personal commercial account.',
  },
];

const WARN = {
  takehome: { 0: 'You can\'t check "no AI" on take-home work. If you need it, pair the assignment with a short oral follow-up or an in-class part (chapter 5).', 1: 'Hard to verify on take-home work. Consider asking for drafts or version history as evidence.' },
  essay: { 0: 'You can\'t check "no AI" on take-home writing. If you need it, add a short oral check or in-class writing (chapter 5).' },
  brief: { 0: 'You can\'t check "no AI" on take-home writing. If you need it, add a short oral check or in-class writing (chapter 5).' },
  exam: { 4: 'On an on-site exam this needs approved devices and tools. Check with the exams office before promising it.', 5: 'On an on-site exam this needs approved devices and tools. Check with the exams office before promising it.' },
  thesis: { 4: 'Degree projects have their own supervision rules. Agree on this with the supervisor and examiner, in writing.', 5: 'Degree projects have their own supervision rules. Agree on this with the supervisor and examiner, in writing.' },
  group: { 2: 'In group work, agree on one rule for the whole group and ask each member to disclose their own use.', 3: 'In group work, agree on one rule for the whole group and ask each member to disclose their own use.', 4: 'In group work, agree on one rule for the whole group and ask each member to disclose their own use.' },
};

export function statementFor(a, course) {
  const L = LEVELS.find((l) => l.id === a.level);
  if (!L) return '';
  const name = a.name || 'this assignment';
  const lines = [`AI use in ${name}: ${L.name}.`, L.rule];
  if (L.needsParts) lines.push(`Allowed for: ${a.parts?.trim() || '[list the parts]'}.`);
  if (a.why?.trim()) lines.push(`Why: this assignment checks that you can ${a.why.trim().replace(/\.$/, '')} yourself.`);
  if (L.disclose) lines.push(`Disclosure: ${L.disclose}`);
  lines.push('If you\'re not sure whether something is allowed, ask before you do it. Using AI beyond what\'s allowed here may be treated as academic misconduct under Stockholm University\'s rules.');
  return lines.join(' ');
}

export default function dial(el, { store }) {
  const course = () => store.get().course;
  if (!course().assessments.length) {
    el.innerHTML = `<div class="card"><p>You haven't listed any assessments yet. You can <a href="#/c/start/2">add your course</a>, or try this with an example course.</p>
      <button type="button" class="btn small" data-example>Use the example course</button></div>`;
    el.querySelector('[data-example]').addEventListener('click', () => {
      store.update((s) => { s.course = structuredClone(EXAMPLE); });
      dial(el, { store });
    });
    return;
  }
  let sel = course().assessments[0].id;

  const save = (fn) => store.update((s) => { const a = s.course.assessments.find((x) => x.id === sel); if (a) fn(a); });
  const cur = () => course().assessments.find((x) => x.id === sel);

  const draw = (focusSel) => {
    const a = cur();
    const L = LEVELS.find((l) => l.id === a.level);
    const warn = L && WARN[a.type]?.[L.id];
    el.innerHTML = `<div class="card dial">
      <div class="dial-tabs" role="tablist" aria-label="Assessments">${course().assessments.map((x) => `
        <button type="button" role="tab" data-sel="${x.id}" aria-selected="${x.id === sel}">
          ${esc(x.name || 'Untitled')}${x.level != null ? ` <span class="lvl-num">${x.level}</span>` : ''}</button>`).join('')}</div>
      <p class="hint" style="margin:.2rem 0 1rem">${esc(typeLabel(a.type))}</p>

      <div class="dial-scale" role="radiogroup" aria-label="AI use level for ${esc(a.name || 'this assessment')}">
        ${LEVELS.map((l) => `<button type="button" role="radio" class="lvl lvl-${l.id}" data-lvl="${l.id}" aria-checked="${a.level === l.id}" tabindex="${(a.level ?? 0) === l.id ? 0 : -1}">
          <span class="lvl-n">${l.id}</span><span class="lvl-name">${esc(l.name)}</span>${l.isDefault ? '<span class="lvl-def">≈ SRC default</span>' : ''}</button>`).join('')}
      </div>

      ${L ? `
      <div class="dial-detail">
        <p class="dial-short"><strong>${esc(L.name)}:</strong> ${esc(L.short)}</p>
        <p class="hint"><strong>Fits:</strong> ${esc(L.fits)}</p>
        ${warn ? `<aside class="callout callout-grey"><p class="callout-title"><span class="tag">Watch out</span></p><p>${esc(warn)}</p></aside>` : ''}
        ${L.needsParts ? `<label class="field"><span>Which parts may students use AI for?</span><input type="text" data-k="parts" value="${esc(a.parts || '')}" placeholder="e.g. writing and debugging R code; formatting the reference list"></label>` : ''}
        <label class="field"><span>What must a student be able to do <em>on their own</em> to pass this?</span>
          <input type="text" data-k="why" value="${esc(a.why || '')}" placeholder="e.g. build an argument from the course literature">
          <span class="hint" style="display:block;margin-top:.3rem;font-weight:400">This becomes the "why" in the text for students. Students follow rules they understand.</span></label>
        <p class="q-label" style="margin-bottom:.3rem">Text for your students</p>
        <div class="statement" aria-live="polite">${esc(statementFor(a, course()))}</div>
        <p style="margin:.6rem 0 0;display:flex;gap:.5rem;align-items:center"><button type="button" class="btn small" data-copy>Copy text</button><span class="hint" data-copied aria-live="polite"></span></p>
      </div>` : '<p class="hint">Pick a level to see what it means and the text your students would get.</p>'}
    </div>`;

    el.querySelectorAll('[data-sel]').forEach((b) => b.addEventListener('click', () => { sel = b.dataset.sel; draw(`[data-sel="${sel}"]`); }));
    el.querySelector('[role="tablist"]').addEventListener('keydown', (ev) => {
      if (!['ArrowRight', 'ArrowLeft'].includes(ev.key)) return;
      ev.preventDefault();
      const ids = course().assessments.map((x) => x.id);
      sel = ids[(ids.indexOf(sel) + (ev.key === 'ArrowRight' ? 1 : -1) + ids.length) % ids.length];
      draw(`[data-sel="${sel}"]`);
    });
    const pick = (lvl) => { save((x) => { x.level = lvl; }); draw(`[data-lvl="${lvl}"]`); };
    el.querySelectorAll('[data-lvl]').forEach((b) => b.addEventListener('click', () => pick(Number(b.dataset.lvl))));
    el.querySelector('[role="radiogroup"]').addEventListener('keydown', (ev) => {
      const cur = cur_level();
      if (['ArrowRight', 'ArrowDown'].includes(ev.key)) { ev.preventDefault(); pick(Math.min(5, cur + 1)); }
      if (['ArrowLeft', 'ArrowUp'].includes(ev.key)) { ev.preventDefault(); pick(Math.max(0, cur - 1)); }
    });
    el.querySelectorAll('[data-k]').forEach((i) => i.addEventListener('input', () => {
      save((x) => { x[i.dataset.k] = i.value; });
      el.querySelector('.statement').textContent = statementFor(cur(), course());
    }));
    el.querySelector('[data-copy]')?.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(statementFor(cur(), course())); el.querySelector('[data-copied]').textContent = 'Copied.'; }
      catch { el.querySelector('[data-copied]').textContent = 'Copy failed. Select the text and copy it by hand.'; }
    });
    if (focusSel) el.querySelector(focusSel)?.focus();
  };
  const cur_level = () => cur().level ?? -1;
  draw();
}

export { renderMarkdown };
