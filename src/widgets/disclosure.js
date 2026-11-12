import './widgets-extra.css';
import { esc } from '../lib/content.js';

const TOOLS = ['ChatGPT', 'Microsoft Copilot', 'Claude', 'Gemini', 'Gemini Notebook', 'Other'];
const TYPES = [
  ['graded', 'Feedback on graded work'],
  ['formative', 'Formative feedback'],
  ['brief', 'Instructions or an assignment brief'],
  ['email', 'An email or announcement'],
  ['material', 'Course material (slides, readings guide, examples)'],
];
const ACTIONS = [
  ['spell', 'Checked spelling and grammar', 'checked spelling and grammar'],
  ['clarity', 'Improved clarity and tone', 'suggested clearer wording, which I edited'],
  ['translate', 'Translated my text', 'translated my text'],
  ['notes', 'Turned my own notes into full sentences', 'turned my own notes into full sentences'],
  ['examples', 'Suggested examples or questions that I checked', 'suggested examples or questions, which I checked'],
  ['draft', 'Drafted the text, which I then rewrote', 'drafted a first version, which I rewrote'],
  ['wrote', 'Wrote the feedback for me', 'wrote the feedback'],
];
const OBJECT = {
  graded: 'my comments on your work, after I had decided the grade',
  formative: 'this feedback',
  brief: 'these instructions',
  email: 'this message',
  material: 'this material',
};
const GENERATIVE = ['examples', 'draft', 'wrote'];
const isFeedback = (t) => t === 'graded' || t === 'formative';

function join(a) {
  if (a.length < 2) return a.join('');
  const sep = a.some((x) => x.includes(',')) ? '; ' : ', ';
  if (a.length === 2) return `${a[0]} and ${a[1]}`;
  return `${a.slice(0, -1).join(sep)}${sep}and ${a[a.length - 1]}`;
}

function sentence(d) {
  const tool = d.tool === 'Other' ? (d.other || '').trim() || 'an AI tool' : d.tool;
  if (!tool || !d.actions.length) return '';
  const parts = ACTIONS.filter((a) => d.actions.includes(a[0])).map((a) => a[2]);
  let s = `I used ${tool} for ${OBJECT[d.type] || 'this text'}. It ${join(parts)}.`;
  if (!d.actions.some((a) => GENERATIVE.includes(a))) s += ' The judgement and content are my own.';
  return s;
}

function warnings(d) {
  const w = [];
  const fb = isFeedback(d.type);
  const has = (k) => d.actions.includes(k);
  if (fb && has('wrote')) w.push(['Not allowed', 'Feedback that AI wrote and you lightly edited isn\'t your feedback, even with a disclosure. The exception is a clearly announced experiment. Write the substance yourself; AI may help with the wording.']);
  if (d.type === 'graded' && (has('examples') || has('draft'))) w.push(['Check this', 'After grading, AI may only help with language and clarity. It must not add to or change your evaluation.']);
  if (fb && has('translate')) w.push(['Check this', 'Check the translation carries your meaning, especially for criticism.']);
  return w;
}

export default function disclosure(el, { store }) {
  const saved = store.get().disclosure || {};
  const d = {
    tool: TOOLS.includes(saved.tool) ? saved.tool : '',
    other: typeof saved.other === 'string' ? saved.other : '',
    type: TYPES.some((t) => t[0] === saved.type) ? saved.type : '',
    actions: Array.isArray(saved.actions) ? saved.actions.filter((a) => ACTIONS.some((x) => x[0] === a)) : [],
  };

  const chip = (group, v, t, on) => `<button type="button" class="chip" data-g="${group}" data-v="${esc(v)}" aria-pressed="${on}">${esc(t)}</button>`;

  el.innerHTML = `<div class="card dc-root">
    <div class="q" role="group" aria-labelledby="dc-l-tool"><span class="q-label" id="dc-l-tool">Which tool?</span>
      <div class="choice-row">${TOOLS.map((t) => chip('tool', t, t, d.tool === t)).join('')}</div>
      <label class="field dc-other" data-other-wrap hidden><span>Name of the tool</span><input type="text" data-other autocomplete="off" maxlength="60"></label>
    </div>
    <div class="q" role="group" aria-labelledby="dc-l-type"><span class="q-label" id="dc-l-type">What is the text?</span>
      <div class="choice-row">${TYPES.map(([v, t]) => chip('type', v, t, d.type === v)).join('')}</div></div>
    <div class="q" role="group" aria-labelledby="dc-l-act"><span class="q-label" id="dc-l-act">What did AI do?</span>
      <div class="choice-row">${ACTIONS.map(([v, t]) => chip('actions', v, t, d.actions.includes(v))).join('')}</div>
      <p class="hint">Pick all that apply.</p></div>
    <div class="dc-out"><span class="q-label">Your disclosure line</span>
      <div aria-live="polite" data-out></div></div>
    <div data-warn aria-live="polite"></div>
    <p class="hint" data-hint hidden>Remove names and anything identifying before pasting student work into a tool that isn't approved for student data.</p>
  </div>`;

  const out = el.querySelector('[data-out]');
  const warn = el.querySelector('[data-warn]');
  const hint = el.querySelector('[data-hint]');
  const wrap = el.querySelector('[data-other-wrap]');
  const input = el.querySelector('[data-other]');
  input.value = d.other;
  let timer;

  const update = (persist = true) => {
    el.querySelectorAll('.chip').forEach((b) => {
      const g = b.dataset.g;
      b.setAttribute('aria-pressed', String(g === 'actions' ? d.actions.includes(b.dataset.v) : d[g] === b.dataset.v));
    });
    wrap.hidden = d.tool !== 'Other';
    const text = sentence(d);
    out.innerHTML = text
      ? `<div class="statement">${esc(text)}</div><div class="dc-actions"><button type="button" class="btn small" data-copy>Copy</button><span class="hint" style="margin:0" data-msg></span></div>`
      : '<p class="hint" style="margin:0">Choose a tool and at least one thing AI did. Your sentence appears here.</p>';
    warn.innerHTML = warnings(d).map(([tag, msg]) => `<div class="callout callout-grey"><div class="callout-title"><span class="tag">${esc(tag)}</span></div><p>${esc(msg)}</p></div>`).join('');
    hint.hidden = !isFeedback(d.type);
    if (persist) store.update((s) => { s.disclosure = { tool: d.tool, other: d.other, type: d.type, actions: [...d.actions], text }; });
  };

  el.addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b || !el.contains(b)) return;
    if (b.dataset.copy !== undefined) {
      const msg = el.querySelector('[data-msg]');
      try {
        await navigator.clipboard.writeText(sentence(d));
        msg.textContent = 'Copied.';
      } catch { msg.textContent = 'Copy failed. Select the text and copy it by hand.'; }
      return;
    }
    const { g, v } = b.dataset;
    if (!g) return;
    if (g === 'actions') {
      d.actions = d.actions.includes(v) ? d.actions.filter((x) => x !== v) : [...d.actions, v];
    } else d[g] = d[g] === v ? '' : v;
    update();
    if (g === 'tool' && d.tool === 'Other') input.focus();
  });
  input.addEventListener('input', () => {
    d.other = input.value;
    clearTimeout(timer);
    // update text live but keep focus: only rebuild output, not the input
    update();
  });
  update(false);
  return () => clearTimeout(timer);
}
