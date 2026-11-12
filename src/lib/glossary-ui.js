import { glossary, esc } from './content.js';

let pop = null;
let anchor = null;

function close() {
  if (pop) { pop.remove(); pop = null; }
  if (anchor) { anchor.setAttribute('aria-expanded', 'false'); anchor = null; }
}

function open(btn, { focus = false } = {}) {
  const e = glossary.get(btn.dataset.term);
  if (!e) return;
  if (anchor === btn) return;
  close();
  anchor = btn;
  pop = document.createElement('div');
  pop.className = 'popover';
  pop.id = 'gloss-pop';
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('aria-label', e.term);
  pop.innerHTML = `<h4>${esc(e.term)}</h4><p>${esc(e.short)}</p>${e.more ? `<p class="more">${esc(e.more)}</p>` : ''}`
    + `<p><a href="#/glossary/${e.id}" data-close>Full glossary</a></p>`;
  document.body.appendChild(pop);
  btn.setAttribute('aria-expanded', 'true');
  btn.setAttribute('aria-controls', 'gloss-pop');
  place();
  pop.addEventListener('mouseleave', scheduleClose);
  pop.addEventListener('mouseenter', cancelClose);
  pop.querySelector('[data-close]').addEventListener('click', close);
  if (focus) pop.querySelector('a').focus();
}

function place() {
  if (!pop || !anchor) return;
  const r = anchor.getBoundingClientRect();
  const pw = pop.offsetWidth, ph = pop.offsetHeight;
  let left = r.left + window.scrollX + r.width / 2 - pw / 2;
  left = Math.max(window.scrollX + 12, Math.min(left, window.scrollX + document.documentElement.clientWidth - pw - 12));
  let top = r.bottom + window.scrollY + 8;
  if (r.bottom + ph + 16 > window.innerHeight && r.top - ph - 8 > 0) top = r.top + window.scrollY - ph - 8;
  pop.style.left = `${left}px`;
  pop.style.top = `${top}px`;
}

let timer = null;
function scheduleClose() { cancelClose(); timer = setTimeout(close, 250); }
function cancelClose() { clearTimeout(timer); }

export function initGlossary() {
  const hoverable = window.matchMedia('(hover: hover)').matches;
  document.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.term');
    if (btn) { ev.preventDefault(); anchor === btn ? close() : open(btn); return; }
    if (pop && !pop.contains(ev.target)) close();
  });
  if (hoverable) {
    document.addEventListener('mouseover', (ev) => {
      const btn = ev.target.closest('.term');
      if (btn) { cancelClose(); open(btn); }
    });
    document.addEventListener('mouseout', (ev) => {
      if (ev.target.closest('.term')) scheduleClose();
    });
  }
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && pop) { const a = anchor; close(); a?.focus(); }
  });
  window.addEventListener('resize', place);
  window.addEventListener('hashchange', close);
}

export function glossaryPageHtml() {
  const items = [...glossary.values()].sort((a, b) => a.term.localeCompare(b.term));
  return `<div class="slide"><p class="eyebrow">Reference</p><h1 tabindex="-1">Glossary</h1>
    <p class="lead">Plain-English explanations of the AI terms used in this course. Dotted-underlined words in the course open these too.</p>
    <dl class="glossary">${items.map((e) => `<div id="g-${e.id}" class="g-item"><dt>${esc(e.term)}</dt><dd><p>${esc(e.short)}</p>${e.more ? `<p class="more">${esc(e.more)}</p>` : ''}</dd></div>`).join('')}</dl></div>`;
}
