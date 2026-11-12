import { esc } from '../lib/content.js';
import { typeLabel, EXAMPLE } from './course-setup.js';
import { ruleLabel } from './dial.js';

// risk: points added when the answer is the risky one
const QUESTIONS = [
  { id: 'unsup', text: 'Do students do it without supervision (at home, over days)?', risky: 'yes', w: 2 },
  { id: 'output', text: 'Is what you grade mainly a finished product: text, code, slides or a poster?', risky: 'yes', w: 2 },
  { id: 'public', text: 'Could someone do it well using only public sources, without having been in your seminars, field visits or data?', risky: 'yes', w: 2 },
  { id: 'process', text: 'Do you see how the work develops (drafts, notes, version history, check-ins)?', risky: 'no', w: 1 },
  { id: 'live', text: 'Do students have to explain or defend the work live (oral, seminar, in-class)?', risky: 'no', w: 2 },
];

export const REDESIGNS = {
  inclass: { title: 'Examine the core in class', text: 'Our main recommendation. Move the part that decides the grade into the room: a short written exam, an in-class write-up of the core argument, or an interpretation done on site. The take-home part can stay, with the default rules, as preparation.', when: (a) => a.unsup === 'yes' ? 5 : null },
  oral: { title: 'Add a short oral check', text: 'A 5–10 minute conversation per student (or a random sample) about their own submission: "walk me through section 2", "why this source?". The most reliable signal you have. Tell students in advance; it\'s part of the assessment, not an interrogation.', when: (a) => a.live === 'yes' ? null : 4 },
  process: { title: 'Grade the process too', text: 'Ask for a dated outline and a draft, or a link to the version history, and give a small part of the grade for them. It also helps honest students who get feedback earlier.', when: (a) => a.process === 'yes' ? null : 3 },
  local: { title: 'Tie it to something only your course has', text: 'Your own seminar discussion, a guest lecture, a field visit, a local case, a dataset you hand out. AI can still help, but the student has to bring what they saw and heard.', when: (a) => a.public === 'yes' ? 3 : null },
  critique: { title: 'Make AI output the material', text: 'Give students an AI-generated answer and ask them to correct, extend and source it. That assesses judgement, which is what you want them to have when AI is everywhere. Requires guidance on how to check AI output.', when: (a) => a.output === 'yes' ? 1 : null },
  reflect: { title: 'Ask for the decisions, not just the result', text: 'A short memo: what alternatives did you consider, what did you reject and why, what would you do differently? Hard to fake well without having done the work, and easy to probe in an oral check.', when: (a) => a.output === 'yes' ? 1 : null },
};

function score(ans) {
  let s = 0;
  for (const q of QUESTIONS) if (ans[q.id] === q.risky) s += q.w;
  return s;
}
export function riskOf(ans) {
  if (QUESTIONS.some((q) => !ans[q.id])) return null;
  const s = score(ans);
  return s >= 6 ? 'high' : s >= 3 ? 'medium' : 'low';
}
const RISK = {
  high: { label: 'High', text: 'A student could hand in a passing version of this without learning what it\'s meant to assess, and you\'d have no way of telling. Under our rules you can\'t reliably spot it either, so the fix is in the design.' },
  medium: { label: 'Medium', text: 'AI could do much of this, but something in the design gives you a view of the student\'s own understanding. Strengthen that part.' },
  low: { label: 'Low', text: 'The design already shows you what the student can do. Keep it, and use the AI level to say what\'s allowed in the preparation.' },
};

export default function stress(el, { store }) {
  if (!store.get().course.assessments.length) {
    el.innerHTML = `<div class="card"><p>You haven't listed any assessments yet. <a href="#/c/start/2">Add your course</a>, or try this with the example course.</p>
      <button type="button" class="btn small" data-example>Use the example course</button></div>`;
    el.querySelector('[data-example]').addEventListener('click', () => { store.update((s) => { s.course = structuredClone(EXAMPLE); }); stress(el, { store }); });
    return;
  }
  let sel = store.get().course.assessments[0].id;
  const cur = () => store.get().course.assessments.find((x) => x.id === sel);
  const save = (fn) => store.update((s) => { const a = s.course.assessments.find((x) => x.id === sel); if (a) fn(a); });

  const draw = (focusSel) => {
    const a = cur();
    const ans = a.stress || {};
    const risk = riskOf(ans);
    const ideas = Object.entries(REDESIGNS).map(([k, r]) => [k, r, r.when(ans)]).filter(([, , p]) => p != null).sort((x, y) => y[2] - x[2]);
    const chosen = new Set(a.redesign || []);
    el.innerHTML = `<div class="card">
      <div class="dial-tabs" role="tablist" aria-label="Assessments">${store.get().course.assessments.map((x) => {
        const r = riskOf(x.stress || {});
        return `<button type="button" role="tab" data-sel="${x.id}" aria-selected="${x.id === sel}">${esc(x.name || 'Untitled')}${r ? ` <span class="risk-dot risk-${r}" aria-label="${RISK[r].label} risk"></span>` : ''}</button>`;
      }).join('')}</div>
      <p class="hint" style="margin:.2rem 0 1rem">${esc(typeLabel(a.type))}· ${esc(ruleLabel(a))}</p>
      ${QUESTIONS.map((q) => `<div class="q stress-q" role="group" aria-labelledby="sq-${q.id}">
        <span class="q-label" id="sq-${q.id}">${esc(q.text)}</span>
        <div class="choice-row">${['yes', 'no'].map((v) => `<button type="button" class="chip" data-q="${q.id}" data-v="${v}" aria-pressed="${ans[q.id] === v}">${v === 'yes' ? 'Yes' : 'No'}</button>`).join('')}</div></div>`).join('')}
      <div aria-live="polite">${risk ? `
        <div class="risk-box risk-${risk}"><p class="risk-head"><span class="risk-tag">${RISK[risk].label} risk</span> ${esc(RISK[risk].text)}</p></div>
        ${ideas.length ? `<p class="q-label" style="margin-top:1.2rem">Redesign ideas for this one. Tick the ones you'll use; they go into your kit.</p>
        <ul class="ideas">${ideas.map(([k, r]) => `<li><label class="idea"><input type="checkbox" data-idea="${k}" ${chosen.has(k) ? 'checked' : ''}><span><strong>${esc(r.title)}.</strong> ${esc(r.text)}</span></label></li>`).join('')}</ul>` : '<p>No changes needed for this one.</p>'}` : `<p class="hint">Answer all five to see the risk and ideas.</p>`}</div>
    </div>`;
    el.querySelectorAll('[data-sel]').forEach((b) => b.addEventListener('click', () => { sel = b.dataset.sel; draw(`[data-sel="${sel}"]`); }));
    el.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => {
      save((x) => { x.stress = { ...(x.stress || {}), [b.dataset.q]: b.dataset.v }; });
      draw(`[data-q="${b.dataset.q}"][data-v="${b.dataset.v}"]`);
    }));
    el.querySelectorAll('[data-idea]').forEach((c) => c.addEventListener('change', () => {
      save((x) => { const s = new Set(x.redesign || []); c.checked ? s.add(c.dataset.idea) : s.delete(c.dataset.idea); x.redesign = [...s]; });
    }));
    if (focusSel) el.querySelector(focusSel)?.focus();
  };
  draw();
}
