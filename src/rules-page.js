import './styles.css';
import { rules } from './lib/content.js';
import { rulesMetaHtml } from './lib/rules-ui.js';

const root = document.getElementById('rules-page');
const docs = ['teacher', 'student'].filter((k) => rules[k]);
root.innerHTML = `<div class="slide wide">
  <p class="eyebrow">Stockholm Resilience Centre</p>
  <h1>Generative AI rules</h1>
  <p class="lead">The current SRC policies for teaching staff and for students. Link to a specific clause by clicking the # next to its heading.</p>
  <p class="pill-row">${docs.map((k) => `<a class="pill" href="#${k}">${rules[k].short}</a>`).join('')}</p>
  ${docs.map((k) => `<section id="${k}" class="rules-doc" style="margin-top:2.5rem">${rulesMetaHtml(rules[k])}${rules[k].html}</section>`).join('<hr style="margin:3rem 0;border:0;border-top:1px solid var(--line)">')}
</div>`;
if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
