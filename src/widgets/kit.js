import { esc } from '../lib/content.js';
import { statementFor, LEVELS, isDefault, ruleLabel } from './dial.js';
import { PRACTICE, exercisesFor } from './practice.js';
import { typeLabel } from './course-setup.js';
import { REDESIGNS } from './stress.js';
import { AI_NOTE, AI_NOTE_HINT } from '../lib/ai-note.js';

const SINGLE = import.meta.env.MODE === 'single';

export function lectureScript(c) {
  const all = c.assessments;
  const adapted = all.filter((a) => !isDefault(a));
  const lines = [];
  lines.push(`Before we start on the content: a few minutes on AI in ${c.name || 'this course'}.`);
  lines.push('SRC has two AI policies: one for you as students and one for us as teachers. Both are linked in the course room. Please read them before the first assignment; they\'re two pages each, and you\'ll know what you can expect from us too. The short version for you: you may use AI to support your learning, to explain things, quiz you, give feedback on your own draft or check your language. You may not hand in text, analysis or code that AI wrote, even if you lightly edited or paraphrased it.');
  if (adapted.length) {
    lines.push('For some assignments in this course the rules are different, and the brief says so:');
    for (const a of adapted) {
      const L = LEVELS.find((l) => l.id === a.level);
      lines.push(`- ${a.name || 'Assignment'}: ${L ? L.name : 'see the brief'}.`);
    }
  } else {
    lines.push('Those rules apply to every assignment in this course. Each brief says what they mean for that assignment.');
  }
  const whys = all.filter((a) => a.why?.trim());
  if (whys.length) lines.push(`Why the limits: an assignment exists to show that you can do something yourself. ${whys.slice(0, 2).map((a) => `In ${a.name || 'one assignment'}, that's to ${a.why.trim().replace(/\.$/, '')}.`).join(' ')} If AI does that part, you haven\'t learned it, and the grade means nothing.`);
  else lines.push('Why the limits: an assignment exists to show that you can do something yourself. If AI does that part, you haven\'t learned it, and the grade means nothing, for you or for anyone who relies on it later.');
  lines.push('When AI meaningfully shaped your work, say so: which tool, what for, and how it changed what you handed in. Two or three sentences is enough. Saying it doesn\'t make a forbidden use OK, though.');
  lines.push('I won\'t use AI detectors. SRC treats them as high-risk use under the EU AI Act and stays clear of anything high-risk for now. What I will do is ask you about your work, and an important part of the assessment happens in the room: in seminars, in class, or in a short conversation. The take-home assignments are your preparation for that. If AI does them for you, you\'ll find out when it counts. If you can\'t explain what you handed in, it doesn\'t show the learning outcomes, and it won\'t pass. If something looks like cheating, I\'m required to report it, and someone else decides.');
  lines.push('Used well, these tools can help you learn: ask them to explain, to quiz you, to argue against you. If you\'re unsure whether something is allowed, ask me first. Asking is always fine.');
  lines.push(AI_NOTE);
  return lines.join('\n\n');
}

function tipsFor(c) {
  const types = [...new Set(c.assessments.map((a) => a.type))];
  return { tips: c.assessments.filter((a) => isDefault(a)).map((a) => [a.name || 'Untitled', (PRACTICE[a.type] || PRACTICE.other).tip]), exercises: exercisesFor(types) };
}

function plain(c, st) {
  const set = c.assessments;
  const out = [];
  out.push(`COURSE AI KIT: ${c.name || 'My course'}${c.level ? ` (${c.level})` : ''}`);
  out.push('\nTEXT FOR THE SYLLABUS AND BRIEFS\n');
  out.push('The SRC student AI policy applies in this course. Below is what it means for each assignment.\n');
  for (const a of set) out.push(statementFor(a) + '\n');
  out.push(AI_NOTE + '\n');
  const { tips, exercises } = tipsFor(c);
  out.push('\nPRACTICAL TIPS\n');
  for (const [n, t] of tips) out.push(`${n}: ${t}`);
  out.push('\nEXERCISES YOU COULD RUN\n');
  for (const e of exercises) out.push(`${e.title}: ${e.text}`);
  const redesigns = c.assessments.filter((a) => (a.redesign || []).length);
  if (redesigns.length) {
    out.push('\nASSESSMENT CHANGES I PLAN\n');
    for (const a of redesigns) out.push(`${a.name}: ${a.redesign.map((k) => REDESIGNS[k]?.title).filter(Boolean).join('; ')}.`);
  }
  out.push('\nFIRST LECTURE (about 5 minutes)\n');
  out.push(lectureScript(c));
  if (st.disclosure?.text) { out.push('\nMY OWN DISCLOSURE LINE\n'); out.push(st.disclosure.text); }
  out.push('\nBEFORE THE COURSE STARTS\n');
  out.push(`[ ] ${AI_NOTE_HINT}`);
  out.push(CHECKLIST.map((x) => `[ ] ${x}`).join('\n'));
  return out.join('\n');
}

const CHECKLIST = [
  'AI rules in the syllabus, and the relevant one in every assignment brief',
  'Both SRC AI policies (student and teacher) linked in the course room, or your adapted course rules if you have them, where students can find them',
  'Students asked to read the policies before the first assignment',
  'Five minutes in the first lecture to go through the rules and the why',
  'Students told how to disclose, with an example',
  'In-class or oral parts of the assessment scheduled (chapter 5)',
  'Checked the syllabus: any new graded oral or in-class part is in it, or a syllabus revision is on its way',
  'Plan ready for students with approved study adaptations (extra time, other formats)',
  'A low-stakes practice task early on, so students meet the rules before it counts',
  'Agreed with co-teachers and TAs on the same rules',
];

function wordDoc(c, st) {
  const set = c.assessments;
  const h = (s) => esc(s);
  const { tips, exercises } = tipsFor(c);
  const body = `<h1>Course AI Kit: ${h(c.name || 'My course')}</h1>
  <h2>Text for the syllabus and briefs</h2><p>The SRC student AI policy applies in this course. Below is what it means for each assignment.</p>
  ${set.map((a) => `<h3>${h(a.name || 'Assignment')}</h3><p>${h(statementFor(a))}</p>`).join('')}
  <p><i>${h(AI_NOTE)}</i></p>
  <h2>Practical tips</h2><ul>${tips.map(([n, t]) => `<li><b>${h(n)}:</b> ${h(t)}</li>`).join('')}</ul>
  <h2>Exercises you could run</h2><ul>${exercises.map((e) => `<li><b>${h(e.title)}:</b> ${h(e.text)}</li>`).join('')}</ul>
  ${c.assessments.some((a) => (a.redesign || []).length) ? `<h2>Assessment changes I plan</h2><ul>${c.assessments.filter((a) => (a.redesign || []).length).map((a) => `<li><b>${h(a.name)}:</b> ${a.redesign.map((k) => h(REDESIGNS[k]?.title || '')).join('; ')}</li>`).join('')}</ul>` : ''}
  <h2>First lecture (about 5 minutes)</h2>${lectureScript(c).split('\n\n').map((p) => `<p>${h(p)}</p>`).join('')}
  ${st.disclosure?.text ? `<h2>My own disclosure line</h2><p>${h(st.disclosure.text)}</p>` : ''}
  <h2>Before the course starts</h2><ul>${CHECKLIST.map((x) => `<li>☐ ${h(x)}</li>`).join('')}</ul>`;
  return `<html><head><meta charset="utf-8"><title>Course AI Kit</title><style>body{font-family:Calibri,Arial,sans-serif;font-size:11pt}h1{color:#002F5F}h2{color:#002F5F;margin-top:18pt}</style></head><body>${body}</body></html>`;
}

async function copy(text, msgEl) {
  try { await navigator.clipboard.writeText(text); msgEl.textContent = 'Copied.'; }
  catch { msgEl.textContent = 'Copy failed. Select the text and copy it by hand.'; }
}

export default function kit(el, { store }) {
  const part = el.dataset.part || 'all';
  const st = store.get();
  const c = st.course;

  if (part === 'lecture') {
    el.innerHTML = `<div class="card"><p class="q-label">Your first-lecture script</p>
      <div class="statement">${esc(lectureScript(c))}</div>
      <p class="hint" style="margin:.5rem 0 0">${esc(AI_NOTE_HINT)}</p>
      <p style="margin:.6rem 0 0;display:flex;gap:.5rem;align-items:center"><button type="button" class="btn small" data-copy>Copy script</button><span class="hint" data-msg aria-live="polite"></span></p></div>`;
    el.querySelector('[data-copy]').addEventListener('click', () => copy(lectureScript(c), el.querySelector('[data-msg]')));
    return;
  }

  const set = c.assessments;
  const { tips, exercises } = tipsFor(c);
  const redesigns = c.assessments.filter((a) => (a.redesign || []).length);
  el.innerHTML = `<div class="kit">
    <section class="card kit-sec"><h2 class="h3">1. Text for the syllabus and briefs</h2>
      ${set.length ? set.map((a) => `<div class="kit-item"><p class="q-label" style="margin:0">${esc(a.name || 'Untitled')} <span class="pill">${esc(typeLabel(a.type))} · ${esc(ruleLabel(a))}</span></p><p class="statement">${esc(statementFor(a))}</p></div>`).join('')
        : '<p>No assessments yet. <a href="#/c/start/2">Add your course in chapter 0.</a></p>'}
      ${set.length ? `<p class="statement">${esc(AI_NOTE)}</p>` : ''}
      <p class="hint">${esc(AI_NOTE_HINT)}</p>
    </section>
    <section class="card kit-sec"><h2 class="h3">2. Practical tips and exercises</h2>
      ${tips.length ? `<ul>${tips.map(([n, t]) => `<li><strong>${esc(n)}:</strong> ${esc(t)}</li>`).join('')}</ul>` : ''}
      <p class="q-label">Exercises you could run</p>
      <ul>${exercises.map((e) => `<li><strong>${esc(e.title)}.</strong> ${esc(e.text)}</li>`).join('')}</ul>
    </section>
    <section class="card kit-sec"><h2 class="h3">3. Assessment changes you plan</h2>
      ${redesigns.length ? `<ul>${redesigns.map((a) => `<li><strong>${esc(a.name)}:</strong> ${a.redesign.map((k) => esc(REDESIGNS[k]?.title || '')).join('; ')}</li>`).join('')}</ul>` : '<p class="hint">None chosen. <a href="#/c/stress-test/1">Stress-test your assessments in chapter 5.</a></p>'}
    </section>
    <section class="card kit-sec"><h2 class="h3">4. First lecture (about 5 minutes)</h2><div class="statement">${esc(lectureScript(c))}</div></section>
    <section class="card kit-sec"><h2 class="h3">5. Your own disclosure line</h2>
      ${st.disclosure?.text ? `<p class="statement">${esc(st.disclosure.text)}</p>` : '<p class="hint">Not made yet. <a href="#/c/own-use/1">Make one in chapter 8.</a></p>'}</section>
    <div class="kit-actions">
      <button type="button" class="btn" data-copyall>Copy the whole kit</button>
      ${SINGLE ? '' : '<button type="button" class="btn secondary" data-word>Download as Word file</button>'}
      <span class="hint" data-msg aria-live="polite"></span>
    </div></div>`;
  el.querySelector('[data-copyall]').addEventListener('click', () => copy(plain(c, store.get()), el.querySelector('[data-msg]')));
  el.querySelector('[data-word]')?.addEventListener('click', () => {
    const blob = new Blob(['﻿', wordDoc(c, store.get())], { type: 'application/msword' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `AI-kit-${(c.name || 'course').replace(/[^\w-]+/g, '-').slice(0, 40)}.doc`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    el.querySelector('[data-msg]').textContent = 'Downloaded. It opens in Word.';
  });
}
