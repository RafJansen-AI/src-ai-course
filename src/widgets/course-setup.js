import { esc } from '../lib/content.js';

export const TYPES = [
  ['essay', 'Essay or reflection (take-home)'],
  ['brief', 'Report or policy brief (take-home)'],
  ['takehome', 'Take-home exam'],
  ['exam', 'Written exam on site'],
  ['oral', 'Oral exam or presentation'],
  ['seminar', 'Seminar participation'],
  ['group', 'Group project'],
  ['code', 'Code, modelling or data analysis'],
  ['thesis', 'Thesis or degree project'],
  ['other', 'Other'],
];
export const typeLabel = (t) => (TYPES.find((x) => x[0] === t) || [, 'Other'])[1];

export const EXAMPLE = {
  name: 'Sustainability Science (example)',
  level: 'MSc',
  assessments: [
    { id: 'a1', name: 'Weekly seminar reflections', type: 'essay' },
    { id: 'a2', name: 'Policy brief', type: 'brief' },
    { id: 'a3', name: 'Final exam', type: 'exam' },
    { id: 'a4', name: 'Group project and presentation', type: 'group' },
  ],
};

let uid = Date.now();

export default function courseSetup(el, { store }) {
  const c = () => store.get().course;
  const save = (fn) => store.update((s) => fn(s.course));

  const draw = () => {
    const course = c();
    el.innerHTML = `<div class="card">
      <label class="field"><span>Course name</span><input type="text" data-f="name" value="${esc(course.name)}" placeholder="e.g. Sustainability Science"></label>
      <label class="field"><span>Level</span><select data-f="level">${['', 'BSc', 'MSc', 'PhD', 'Other'].map((l) => `<option value="${l}" ${course.level === l ? 'selected' : ''}>${l || 'Choose...'}</option>`).join('')}</select></label>
      <p class="q-label" id="assess-h">How is the course assessed?</p>
      <p class="hint" style="margin-top:-.3rem">List each graded or required piece of work. You'll set an AI level for each one later.</p>
      <ul class="assess-list" aria-labelledby="assess-h" style="list-style:none;padding:0;margin:0 0 .8rem">${course.assessments.map((a, i) => `
        <li class="assess-row" style="display:grid;grid-template-columns:1fr 1fr auto;gap:.5rem;margin-bottom:.5rem">
          <label class="sr-only" for="an-${a.id}">Assessment ${i + 1} name</label>
          <input id="an-${a.id}" type="text" data-a="${a.id}" data-k="name" value="${esc(a.name)}" placeholder="e.g. Policy brief">
          <label class="sr-only" for="at-${a.id}">Assessment ${i + 1} type</label>
          <select id="at-${a.id}" data-a="${a.id}" data-k="type">${TYPES.map(([v, t]) => `<option value="${v}" ${a.type === v ? 'selected' : ''}>${t}</option>`).join('')}</select>
          <button type="button" class="icon-btn" data-del="${a.id}" aria-label="Remove ${esc(a.name || 'assessment')}">✕</button>
        </li>`).join('')}</ul>
      <p style="display:flex;gap:.5rem;flex-wrap:wrap;margin:0">
        <button type="button" class="btn small" data-add>+ Add assessment</button>
        ${course.assessments.length ? '' : '<button type="button" class="btn small secondary" data-example>Use an example course instead</button>'}
      </p>
      <p class="hint" style="margin:.8rem 0 0">Saved in this browser only. Nothing you type is sent anywhere.</p></div>`;

    el.querySelectorAll('[data-f]').forEach((i) => i.addEventListener('input', () => save((co) => { co[i.dataset.f] = i.value; })));
    el.querySelectorAll('[data-a]').forEach((i) => i.addEventListener(i.tagName === 'SELECT' ? 'change' : 'input', () => save((co) => {
      const a = co.assessments.find((x) => x.id === i.dataset.a); if (a) a[i.dataset.k] = i.value;
    })));
    el.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
      save((co) => { co.assessments = co.assessments.filter((x) => x.id !== b.dataset.del); });
      draw(); el.querySelector('[data-add]').focus();
    }));
    el.querySelector('[data-add]').addEventListener('click', () => {
      const id = `a${uid++}`;
      save((co) => { co.assessments.push({ id, name: '', type: 'essay' }); });
      draw(); el.querySelector(`#an-${id}`).focus();
    });
    el.querySelector('[data-example]')?.addEventListener('click', () => {
      save((co) => { Object.assign(co, structuredClone(EXAMPLE)); });
      draw();
    });
  };
  draw();
}
