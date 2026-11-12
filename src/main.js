import './styles.css';
import { chapters, esc } from './lib/content.js';
import * as store from './lib/store.js';
import { initGlossary, glossaryPageHtml } from './lib/glossary-ui.js';
import { openRules, closeRules, rulesChanged, trapFocus } from './lib/rules-ui.js';
import { widgets } from './widgets/index.js';

const SINGLE = import.meta.env.MODE === 'single';
const $ = (s) => document.querySelector(s);
const stage = $('#stage');
const isBeginner = () => store.get().beginner === true;

// ---------- sequence of visible slides ----------
function sequence(includeChapter) {
  const seq = [];
  for (const ch of chapters) {
    if (ch.track === 'beginner' && !isBeginner() && ch.id !== includeChapter) continue;
    ch.slides.forEach((s, i) => {
      if (s.flags.includes('beginner') && !isBeginner()) return;
      seq.push({ ch, i });
    });
  }
  return seq;
}

function parseHash() {
  const h = location.hash.replace(/^#\/?/, '');
  const parts = h.split('/').filter(Boolean);
  if (parts[0] === 'c' && parts[1]) return { type: 'slide', chapter: parts[1], index: Number(parts[2] || 0) };
  if (parts[0] === 'glossary') return { type: 'glossary', term: parts[1] };
  return { type: 'home' };
}

function go(chId, idx) { location.hash = `#/c/${chId}/${idx}`; }

// ---------- rendering ----------
let unmounts = [];
function cleanup() { unmounts.forEach((f) => f && f()); unmounts = []; }

function render() {
  cleanup();
  const route = parseHash();
  if (route.type === 'glossary') return renderGlossary(route.term);
  if (route.type === 'home') {
    const first = chapters[0];
    return go(first.id, 0);
  }
  const ch = chapters.find((c) => c.id === route.chapter);
  if (!ch) return go(chapters[0].id, 0);
  const idx = Math.max(0, Math.min(route.index, ch.slides.length - 1));
  const slide = ch.slides[idx];
  const seq = sequence(ch.id);
  const pos = seq.findIndex((p) => p.ch === ch && p.i === idx);

  stage.innerHTML = `<article class="slide ${slide.flags.includes('wide') ? 'wide' : ''}" aria-labelledby="slide-h">
    <p class="eyebrow">${ch.num !== '' ? `Chapter ${esc(ch.num)} · ` : ''}${esc(ch.title)}${slide.flags.includes('beginner') ? ' <span class="badge">Beginner</span>' : ''}${ch.status === 'soon' ? ' <span class="badge soon">Coming next</span>' : ''}</p>
    ${slide.html}</article>`;

  const h = stage.querySelector('h1, h2');
  if (h) { h.id = 'slide-h'; h.tabIndex = -1; }

  // beginner boxes
  stage.querySelectorAll('details[data-beginner]').forEach((d) => { d.open = isBeginner(); });

  // widgets
  stage.querySelectorAll('[data-widget]').forEach((el) => {
    const w = widgets[el.dataset.widget];
    if (!w) { el.textContent = `[missing widget: ${el.dataset.widget}]`; return; }
    el.classList.add('widget');
    unmounts.push(w(el, { store, go, rerender: render, openRules, chapters }));
  });

  // nav
  const prev = seq[pos - 1], next = seq[pos + 1];
  $('#btn-prev').disabled = !prev;
  $('#btn-next').disabled = !next;
  $('#btn-next').innerHTML = next && next.ch !== ch ? `Next: ${esc(next.ch.title)} <span aria-hidden="true">→</span>` : 'Next <span aria-hidden="true">→</span>';
  $('#btn-prev').onclick = () => prev && go(prev.ch.id, prev.i);
  $('#btn-next').onclick = () => next && go(next.ch.id, next.i);
  const visibleInCh = seq.filter((p) => p.ch === ch);
  const local = visibleInCh.findIndex((p) => p.i === idx) + 1;
  $('#nav-pos').textContent = `${ch.title} · ${local} of ${visibleInCh.length}`;
  $('#progress').style.width = `${seq.length > 1 ? Math.round((pos / (seq.length - 1)) * 100) : 0}%`;
  document.querySelector('.navbar').hidden = false;

  store.update((s) => {
    s.progress[ch.id] = Math.max(s.progress[ch.id] ?? -1, idx);
    s.last = location.hash;
  });

  document.title = `${ch.title} · AI in Your Course`;
  window.scrollTo(0, 0);
  if (!firstRender) (h || stage).focus({ preventScroll: true });
  firstRender = false;
}
let firstRender = true;

function renderGlossary(term) {
  stage.innerHTML = glossaryPageHtml();
  document.querySelector('.navbar').hidden = true;
  $('#progress').style.width = '0';
  document.title = 'Glossary · AI in Your Course';
  const back = document.createElement('p');
  back.innerHTML = `<a href="${esc(store.get().last || '#/')}">← Back to the course</a>`;
  stage.querySelector('.slide').prepend(back);
  if (term) document.getElementById(`g-${term}`)?.scrollIntoView({ block: 'center' });
  else window.scrollTo(0, 0);
  stage.querySelector('h1').focus({ preventScroll: !!term });
}

// ---------- chapter menu ----------
let menu = null, menuScrim = null, menuReturn = null;
function openMenu() {
  if (!menu) {
    menuScrim = document.createElement('div'); menuScrim.className = 'scrim';
    menu = document.createElement('section'); menu.className = 'drawer left';
    menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-modal', 'true'); menu.setAttribute('aria-labelledby', 'menu-h');
    document.body.append(menuScrim, menu);
    menuScrim.addEventListener('click', closeMenu);
    menu.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeMenu(); if (ev.key === 'Tab') trapFocus(ev, menu); });
    menu.addEventListener('click', (ev) => { if (ev.target.closest('a')) closeMenu(); });
  }
  const cur = parseHash();
  const prog = store.get().progress;
  menu.innerHTML = `<div class="drawer-head"><h2 id="menu-h" tabindex="-1">Chapters</h2><button class="icon-btn" type="button" aria-label="Close chapters">✕</button></div>
    <div class="drawer-body"><ol class="ch-list">${chapters.map((c) => {
      const seen = prog[c.id] ?? -1;
      const done = seen >= c.slides.length - 1 && c.status !== 'soon';
      return `<li><a href="#/c/${c.id}/0" ${cur.chapter === c.id ? 'aria-current="true"' : ''}>
        <span class="ch-num">${esc(c.num)}</span>
        <span><span class="ch-title">${esc(c.title)}</span>${c.track === 'beginner' ? '<span class="badge">Beginner</span>' : ''}${c.status === 'soon' ? '<span class="badge soon">Coming next</span>' : ''}</span>
        <span class="ch-meta">${done ? '<span class="done-mark" aria-label="done">✓</span> ' : ''}${c.minutes ? `${c.minutes} min` : ''}</span>
        ${c.summary ? `<span class="ch-sub">${esc(c.summary)}</span>` : ''}</a></li>`;
    }).join('')}</ol>
    <p class="hint" style="margin-top:1.5rem"><a href="#/glossary">Glossary</a> · ${SINGLE ? '' : '<a href="rules.html" target="_blank" rel="noopener">Rules as a page</a> · '}<button class="btn ghost" type="button" data-reset>Start over (clears your answers)</button></p></div>`;
  menu.querySelector('.icon-btn').addEventListener('click', closeMenu);
  const resetBtn = menu.querySelector('[data-reset]');
  resetBtn.addEventListener('click', () => {
    if (resetBtn.dataset.armed) { store.reset(); closeMenu(); syncBeginner(); go(chapters[0].id, 0); render(); return; }
    resetBtn.dataset.armed = '1';
    resetBtn.textContent = 'Click again to clear all your answers on this device';
  });
  menuReturn = document.activeElement;
  menu.hidden = false; menuScrim.hidden = false;
  menu.querySelector('h2').focus();
}
function closeMenu() {
  if (!menu || menu.hidden) return;
  menu.hidden = true; menuScrim.hidden = true; menuReturn?.focus?.();
}

// ---------- beginner toggle ----------
function syncBeginner() {
  $('#btn-beginner').setAttribute('aria-pressed', String(isBeginner()));
}
$('#btn-beginner').addEventListener('click', () => {
  store.update((s) => { s.beginner = !isBeginner(); });
  syncBeginner();
  render();
});

// ---------- global events ----------
$('#btn-chapters').addEventListener('click', openMenu);
$('#btn-rules').addEventListener('click', () => openRules());
document.addEventListener('click', (ev) => {
  const a = ev.target.closest('a[data-rule]');
  if (a && !ev.metaKey && !ev.ctrlKey) { ev.preventDefault(); openRules(a.dataset.rule); }
});
document.addEventListener('keydown', (ev) => {
  if (ev.defaultPrevented || ev.altKey || ev.metaKey || ev.ctrlKey) return;
  const t = ev.target;
  if (t.closest('input, textarea, select, [contenteditable], .drawer, [role="radiogroup"], [role="slider"]')) return;
  if (ev.key === 'ArrowRight' && !$('#btn-next').disabled) $('#btn-next').click();
  if (ev.key === 'ArrowLeft' && !$('#btn-prev').disabled) $('#btn-prev').click();
});
window.addEventListener('hashchange', () => { closeMenu(); closeRules(); render(); });

if (rulesChanged()) {
  const b = document.createElement('div');
  b.className = 'rules-banner';
  b.style.cssText = 'max-width:72rem;margin:.5rem auto 0;';
  b.innerHTML = 'The SRC AI rules have been updated since your last visit. <button class="btn ghost" type="button">Read them</button>';
  b.querySelector('button').addEventListener('click', () => { b.remove(); openRules(); });
  $('.topbar').after(b);
}

initGlossary();
syncBeginner();
if (!location.hash && store.get().last) location.replace(store.get().last);
render();
