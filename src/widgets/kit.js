import { esc } from '../lib/content.js';
import { statementFor, LEVELS } from './dial.js';
import { typeLabel } from './course-setup.js';

export default function kit(el, { store }) {
  const c = store.get().course;
  const set = c.assessments.filter((a) => a.level != null);
  const unset = c.assessments.filter((a) => a.level == null);
  const all = set.map((a) => statementFor(a, c)).join('\n\n');
  const header = `${c.name || 'This course'}: rules for using generative AI\n\nThe SRC student AI policy applies unless an assignment says otherwise below.\n\n`;
  el.innerHTML = `<div class="card">
    ${set.length ? set.map((a) => `<div class="kit-item"><p class="q-label" style="margin:0">${esc(a.name || 'Untitled')} <span class="pill">${esc(typeLabel(a.type))} · level ${a.level}: ${esc(LEVELS[a.level].name)}</span></p><p class="statement">${esc(statementFor(a, c))}</p></div>`).join('')
      : '<p>No AI levels set yet. Chapter 4 is where you set them.</p>'}
    ${unset.length ? `<p class="hint">Not set yet: ${unset.map((a) => esc(a.name || 'Untitled')).join(', ')}. Students will fall back on the default student policy for these.</p>` : ''}
    ${set.length ? '<p style="margin:0;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap"><button type="button" class="btn small" data-copy>Copy all for the syllabus</button><span class="hint" data-msg aria-live="polite"></span></p>' : ''}
  </div>`;
  el.querySelector('[data-copy]')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(header + all); el.querySelector('[data-msg]').textContent = 'Copied.'; }
    catch { el.querySelector('[data-msg]').textContent = 'Copy failed. Select the text and copy it by hand.'; }
  });
}
