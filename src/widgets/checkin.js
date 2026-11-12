import { esc } from '../lib/content.js';

const QUESTIONS = [
  {
    id: 'freq', label: 'How often do you use AI chatbots (ChatGPT, Copilot, Claude, Gemini...)?',
    options: [['never', 'Never'], ['tried', 'Tried a few times'], ['monthly', 'Now and then'], ['weekly', 'Most weeks'], ['daily', 'Daily']],
  },
  {
    id: 'terms', multi: true, label: 'Which of these could you explain to a colleague in a sentence or two?',
    options: [['hallucination', 'Hallucination'], ['context', 'Context window'], ['agent', 'AI agent'], ['detectors', 'Why SRC rules out AI detectors']],
  },
  {
    id: 'conf', label: 'How confident are you about setting AI rules for your own course?',
    options: [['1', 'Not at all'], ['2', 'A bit'], ['3', 'Fairly'], ['4', 'Very']],
  },
];

function suggestBeginner(a) {
  const low = ['never', 'tried'].includes(a.freq);
  const terms = (a.terms || []).length;
  return low || terms <= 1;
}

export default function checkin(el, { store, rerender }) {
  const answers = { ...store.get().checkin };
  const draw = () => {
    const done = answers.freq && answers.conf;
    el.innerHTML = `<div class="card">${QUESTIONS.map((q) => `
      <div class="q" role="group" aria-labelledby="q-${q.id}">
        <span class="q-label" id="q-${q.id}">${esc(q.label)}</span>
        <div class="choice-row">${q.options.map(([v, t]) => {
          const on = q.multi ? (answers[q.id] || []).includes(v) : answers[q.id] === v;
          return `<button type="button" class="chip" data-q="${q.id}" data-v="${v}" aria-pressed="${on}">${esc(t)}</button>`;
        }).join('')}</div>
        ${q.multi ? '<p class="hint" style="margin:.4rem 0 0">Pick any, or none.</p>' : ''}
      </div>`).join('')}
      <div aria-live="polite">${done ? resultHtml() : ''}</div></div>`;
    el.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => {
      const q = QUESTIONS.find((x) => x.id === b.dataset.q);
      if (q.multi) {
        const set = new Set(answers[q.id] || []);
        set.has(b.dataset.v) ? set.delete(b.dataset.v) : set.add(b.dataset.v);
        answers[q.id] = [...set];
      } else answers[q.id] = b.dataset.v;
      const rec = suggestBeginner(answers);
      store.update((s) => { s.checkin = { ...answers }; if (answers.freq && answers.conf) s.beginner = rec; });
      document.querySelector('#btn-beginner')?.setAttribute('aria-pressed', String(store.get().beginner !== false));
      draw();
      el.querySelector(`[data-q="${b.dataset.q}"][data-v="${b.dataset.v}"]`)?.focus();
    }));
    el.querySelector('[data-switch]')?.addEventListener('click', () => {
      store.update((s) => { s.beginner = s.beginner === false; });
      document.querySelector('#btn-beginner')?.setAttribute('aria-pressed', String(store.get().beginner !== false));
      draw();
    });
  };
  const resultHtml = () => {
    const b = store.get().beginner !== false;
    const conf = Number(answers.conf || 0);
    return `<div class="result-note">
      ${b
        ? '<p><strong>We\'ll take the scenic route.</strong> You\'ll get a short chapter on what these tools actually do, and the "New to this?" notes will be open. Dotted-underlined words explain themselves when you hover or tap them.</p>'
        : '<p><strong>We\'ll skip the basics.</strong> The beginner chapter and "New to this?" notes are hidden but one click away. Dotted-underlined words still explain themselves on hover or tap.</p>'}
      ${conf && conf <= 2 ? '<p>On setting rules for your course: that\'s exactly what chapters 4 and 5 are for. You\'ll leave with text you can paste into your syllabus.</p>' : ''}
      <p style="margin:0"><button type="button" class="btn small secondary" data-switch>${b ? 'Actually, skip the basics' : 'Actually, show me the basics'}</button>
      <span class="hint">&nbsp;You can also switch with "Beginner notes" at the top.</span></p></div>`;
  };
  draw();
}
