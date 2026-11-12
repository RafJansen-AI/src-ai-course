import './widgets-extra.css';
import { esc, renderMarkdown } from '../lib/content.js';

export default function flipcards(el) {
  let cards = [];
  try { cards = JSON.parse(el.querySelector('script[type="application/json"]')?.textContent || '[]'); } catch { cards = []; }
  if (!Array.isArray(cards) || !cards.length) { el.innerHTML = ''; return; }
  const flipped = cards.map(() => false);

  el.innerHTML = `<div class="fc-bar"><button type="button" class="btn small secondary" data-all></button></div>
    <div class="fc-grid" role="list">${cards.map((c, i) => `
      <div class="fc-card" role="listitem" data-i="${i}">
        <div class="fc-face front">
          ${c.tag ? `<span class="fc-tag">${esc(c.tag)}</span>` : ''}
          <div class="fc-body">${renderMarkdown(String(c.front || ''))}</div>
          <button type="button" class="btn small" data-flip aria-label="Show answer to card ${i + 1}">Show answer</button>
        </div>
        <div class="fc-face back">
          ${c.tag ? `<span class="fc-tag">${esc(c.tag)}</span>` : ''}
          <div class="fc-body">${renderMarkdown(String(c.back || ''))}</div>
          <button type="button" class="btn small secondary" data-flip aria-label="Show question of card ${i + 1}">Show question</button>
        </div>
      </div>`).join('')}</div>`;

  const cardEls = [...el.querySelectorAll('.fc-card')];
  const allBtn = el.querySelector('[data-all]');
  const sync = () => {
    cardEls.forEach((c, i) => c.classList.toggle('flipped', flipped[i]));
    const all = flipped.every(Boolean);
    allBtn.textContent = all ? 'Hide all' : 'Show all answers';
  };
  cardEls.forEach((c, i) => c.querySelectorAll('[data-flip]').forEach((b) => b.addEventListener('click', () => {
    flipped[i] = !flipped[i];
    sync();
    c.querySelector(flipped[i] ? '.back [data-flip]' : '.front [data-flip]')?.focus();
  })));
  allBtn.addEventListener('click', () => {
    const to = !flipped.every(Boolean);
    flipped.fill(to);
    sync();
  });
  sync();
}
