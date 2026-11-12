import { rules, rulesVersionKey, esc } from './content.js';
import * as store from './store.js';

const ORDER = ['teacher', 'student'];
const fmtDate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return isNaN(dt) ? d : dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export function rulesMetaHtml(r) {
  return `<div class="rules-meta"><strong>${esc(r.title)}</strong><br>
    Version ${esc(r.version)} (${esc(r.fileVersion || '')}) · adopted ${fmtDate(r.adopted)} · last revised ${fmtDate(r.revised)} · approved by ${esc(r.approvedBy || '')}<br>
    The official copy is the <a href="${esc(r.pdf)}" target="_blank" rel="noopener">PDF on Box</a>. If the two ever differ, the PDF wins.</div>`;
}

export function whichDoc(clauseId) {
  if (!clauseId) return null;
  return clauseId.startsWith('s-') ? 'student' : 'teacher';
}

function highlight(container, q) {
  container.querySelectorAll('mark').forEach((m) => m.replaceWith(document.createTextNode(m.textContent)));
  container.normalize();
  if (!q || q.length < 2) return 0;
  const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  let count = 0;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) {
    if (!re.test(n.nodeValue)) continue;
    re.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0;
    n.nodeValue.replace(re, (m, idx) => {
      frag.append(n.nodeValue.slice(last, idx));
      const mark = document.createElement('mark');
      mark.textContent = m;
      frag.append(mark);
      last = idx + m.length;
      count++;
    });
    frag.append(n.nodeValue.slice(last));
    n.replaceWith(frag);
  }
  return count;
}

// ---------- drawer ----------
let drawer = null, scrim = null, lastFocus = null, current = 'teacher';

export function rulesChanged() {
  const seen = store.get().rulesSeen;
  return seen && seen !== rulesVersionKey;
}

export function openRules(clauseId) {
  const doc = whichDoc(clauseId) || current;
  if (!drawer) build();
  lastFocus = document.activeElement;
  drawer.hidden = false; scrim.hidden = false;
  document.body.style.overflow = 'hidden';
  show(doc, clauseId);
  store.update((s) => { s.rulesSeen = rulesVersionKey; });
  drawer.querySelector('.drawer-head h2').focus();
}

export function closeRules() {
  if (!drawer || drawer.hidden) return;
  drawer.hidden = true; scrim.hidden = true;
  document.body.style.overflow = '';
  lastFocus?.focus?.();
}

function build() {
  scrim = document.createElement('div');
  scrim.className = 'scrim'; scrim.hidden = true;
  scrim.addEventListener('click', closeRules);
  drawer = document.createElement('section');
  drawer.className = 'drawer right'; drawer.hidden = true;
  drawer.setAttribute('role', 'dialog'); drawer.setAttribute('aria-modal', 'true'); drawer.setAttribute('aria-labelledby', 'rules-h');
  drawer.innerHTML = `
    <div class="drawer-head"><h2 id="rules-h" tabindex="-1">SRC AI rules</h2>
      ${import.meta.env.MODE === 'single' ? '' : '<a class="btn small secondary" href="rules.html" target="_blank" rel="noopener">Open as page</a>'}
      <button class="icon-btn" type="button" data-x aria-label="Close rules">✕</button></div>
    <div class="rules-tabs" role="tablist">${ORDER.filter((k) => rules[k]).map((k) => `<button type="button" role="tab" data-doc="${k}">${esc(rules[k].short)}</button>`).join('')}</div>
    <div class="rules-search"><label class="sr-only" for="rules-q">Search the rules</label><input id="rules-q" type="search" placeholder="Search, e.g. grade, disclose, data"></div>
    <div class="drawer-body" role="tabpanel"><div class="rules-status hint" aria-live="polite"></div><div class="rules-doc"></div></div>`;
  document.body.append(scrim, drawer);
  drawer.querySelector('[data-x]').addEventListener('click', closeRules);
  drawer.querySelectorAll('[data-doc]').forEach((b) => b.addEventListener('click', () => show(b.dataset.doc)));
  const q = drawer.querySelector('#rules-q');
  q.addEventListener('input', () => {
    const n = highlight(drawer.querySelector('.rules-doc'), q.value.trim());
    drawer.querySelector('.rules-status').textContent = q.value.trim().length >= 2 ? `${n} match${n === 1 ? '' : 'es'} in the ${rules[current].short.toLowerCase()}` : '';
    drawer.querySelector('.rules-doc mark')?.scrollIntoView({ block: 'center' });
  });
  drawer.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') { ev.stopPropagation(); closeRules(); }
    if (ev.key === 'Tab') trapFocus(ev, drawer);
  });
  drawer.addEventListener('click', (ev) => {
    const a = ev.target.closest('a.anchor-link');
    if (a) { ev.preventDefault(); scrollTo(a.getAttribute('href').slice(1)); }
  });
}

function show(doc, clauseId) {
  current = doc;
  const r = rules[doc];
  drawer.querySelectorAll('[data-doc]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.doc === doc)));
  drawer.querySelector('.rules-doc').innerHTML = rulesMetaHtml(r) + r.html;
  const q = drawer.querySelector('#rules-q');
  if (q.value.trim()) q.dispatchEvent(new Event('input'));
  if (clauseId) requestAnimationFrame(() => scrollTo(clauseId));
  else drawer.querySelector('.drawer-body').scrollTop = 0;
}

function scrollTo(id) {
  const el = drawer.querySelector(`#${CSS.escape(id)}`);
  if (!el) return;
  el.scrollIntoView({ block: 'start' });
  el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
}

export function trapFocus(ev, root) {
  const f = [...root.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((x) => x.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
  else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
}
