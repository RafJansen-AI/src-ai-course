import { esc } from '../lib/content.js';

// Adapted (translated, shortened, moved to an SRC-style course) from an example
// assignment description shared with Eva Mårell-Olsson's material.
const BRIEF_BEFORE = [
  'Seminar task 2: Regime shifts and society',
  'Read the course texts for week 2 (Scheffer et al. 2001; Biggs et al. 2018, ch. 3; the Baltic Sea case report) and listen to the podcast episode on ocean tipping points.',
  'Write a reflection of 500–800 words on how regime shifts affect people and societies, and what that means for governance. Relate your reflection to your own field or future work. End with two discussion questions.',
  'Post your text in the course forum by 1 February and comment on at least three classmates\' posts. Reference the literature using APA 7 with page numbers. Graded pass/fail; counts towards the final grade.',
];

const FIXES = [
  {
    id: 'level', good: true, label: 'Say what the SRC student rules mean for this task',
    add: 'AI use: the SRC student AI policy applies. You may use AI to explain concepts, quiz yourself on the readings or get feedback on your own draft. The reflection, examples and discussion questions must be your own words and thinking.',
    fb: 'The single most important line. A bare link to the policy gets read generously; two concrete sentences don\'t.',
  },
  {
    id: 'why', good: true, label: 'Explain why the line is there',
    add: 'Why: the point of this task is that you can connect the readings to your own field yourself. That\'s what we\'ll build on in the seminar.',
    fb: 'Students follow rules they understand. One sentence is enough.',
  },
  {
    id: 'disclose', good: true, label: 'Say how to disclose',
    add: 'If AI meaningfully shaped your understanding or your text, add two sentences at the end: which tool, what for, and how it influenced your work.',
    fb: 'Without instructions, you get nothing, or a blanket "AI was used".',
  },
  {
    id: 'local', good: true, label: 'Anchor it in something only this course has',
    add: 'Include one point from our week 2 seminar discussion or from the guest lecture, and say whether you agree with it.',
    fb: 'AI can\'t have been in your seminar. This also makes the reflection better.',
  },
  {
    id: 'live', good: true, label: 'Examine part of it in the room',
    add: 'In the seminar on 3 February, you\'ll start with ten minutes of handwritten answers on the readings, and present one of your discussion questions and why you chose it. Both count towards the pass.',
    fb: 'The fix that matters most. Under our rules you can\'t check how the text was written; you can see what the student understands in the room.',
  },
  {
    id: 'detector', good: false, label: 'Say that submissions will be checked with an AI detector',
    fb: 'Not allowed under SRC policy (teacher policy 3C), and the tools are unreliable. Threatening it also invites false accusations and arguments you can\'t win.',
  },
  {
    id: 'ban', good: false, label: 'Ban AI completely for this task',
    fb: 'You may, but you can\'t check it on a take-home reflection, and it rules out legitimate learning uses. If you need "no AI", move part of the task into the seminar instead.',
  },
];

export default function brief(el, { store }) {
  const picked = new Set(store.get().briefFixes || []);
  const draw = (focusSel) => {
    const goods = FIXES.filter((f) => f.good && picked.has(f.id));
    el.innerHTML = `<div class="brief-grid">
      <div class="card">
        <p class="q-label">Choose your fixes</p>
        <ul class="ideas">${FIXES.map((f) => `<li><label class="idea"><input type="checkbox" data-f="${f.id}" ${picked.has(f.id) ? 'checked' : ''}><span>${esc(f.label)}</span></label>
          ${picked.has(f.id) ? `<p class="fix-fb ${f.good ? 'ok' : 'bad'}">${f.good ? '' : '<strong>Rethink this. </strong>'}${esc(f.fb)}</p>` : ''}</li>`).join('')}</ul>
      </div>
      <div class="card brief-doc" aria-live="polite">
        <p class="eyebrow" style="margin:0 0 .4rem">${goods.length ? `Brief with ${goods.length} fix${goods.length === 1 ? '' : 'es'}` : 'The brief as it is'}</p>
        <h3>${esc(BRIEF_BEFORE[0])}</h3>
        ${BRIEF_BEFORE.slice(1).map((p) => `<p>${esc(p)}</p>`).join('')}
        ${goods.length ? `<div class="brief-added">${goods.map((f) => `<p><mark>${esc(f.add)}</mark></p>`).join('')}</div>` : '<p class="hint">Nothing in this brief says anything about AI. Students will guess.</p>'}
      </div></div>`;
    el.querySelectorAll('[data-f]').forEach((c) => c.addEventListener('change', () => {
      c.checked ? picked.add(c.dataset.f) : picked.delete(c.dataset.f);
      store.update((s) => { s.briefFixes = [...picked]; });
      draw(`[data-f="${c.dataset.f}"]`);
    }));
    if (focusSel) el.querySelector(focusSel)?.focus();
  };
  draw();
}
