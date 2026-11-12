// Loads course content at build time and turns our Markdown dialect into HTML.
//
// Dialect (on top of normal Markdown):
//   ===                       on its own line: next slide
//   :::grey Title  ...  :::   callout (types: grey, tip, rule, note)
//   :::beginner Title ... ::: "New to this?" box, opened by default on the beginner path
//   [[hallucination]]         glossary term (id or any alias)
//   [[shown text|term-id]]    glossary term with custom text
//   [[rule:t-3b]]             link to a policy clause (opens the rules drawer)
//   [[rule:t-3b|clause 3B]]   ... with custom text
//   <div data-widget="name" data-x="..."></div>   interactive widget
//   <!-- slide: beginner -->  first line of a slide: only shown on the beginner path
//   <!-- slide: wide -->      wider slide layout
import { Marked } from 'marked';
import glossaryData from '../../content/glossary.json';

const chapterFiles = import.meta.glob('../../content/chapters/*.md', { query: '?raw', import: 'default', eager: true });
const ruleFiles = import.meta.glob('../../content/rules/*.md', { query: '?raw', import: 'default', eager: true });

const marked = new Marked({ gfm: true });

// ---------- front matter ----------
export function parseFrontMatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: src };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*?)\s*(#.*)?$/);
    if (!kv) continue;
    let v = kv[2];
    if (/^".*"$/.test(v) || /^'.*'$/.test(v)) v = v.slice(1, -1);
    else if (v === 'true' || v === 'false') v = v === 'true';
    else if (/^\d+$/.test(v)) v = Number(v);
    data[kv[1]] = v;
  }
  return { data, body: src.slice(m[0].length) };
}

// ---------- glossary ----------
export const glossary = new Map();
const aliasIndex = new Map();
for (const e of glossaryData) {
  glossary.set(e.id, e);
  aliasIndex.set(e.id, e.id);
  aliasIndex.set(e.term.toLowerCase(), e.id);
  for (const a of e.aliases || []) aliasIndex.set(a.toLowerCase(), e.id);
}
export function resolveTerm(s) { return aliasIndex.get(s.trim().toLowerCase()); }

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export { esc };

function inlineExtensions(md) {
  return md.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (all, a, b) => {
    if (a.startsWith('rule:')) {
      const id = a.slice(5).trim();
      const label = b || ruleLabel(id);
      return `<a class="rule-ref${b ? '' : ' auto'}" href="rules.html#${esc(id)}" data-rule="${esc(id)}">${esc(label)}</a>`;
    }
    // [[text|id]] or [[id-or-alias]]
    const id = resolveTerm(b || a);
    const text = a;
    if (!id) {
      if (import.meta.env.DEV) console.warn('Unknown glossary term:', a, b);
      return esc(text);
    }
    return `<button type="button" class="term" data-term="${id}">${esc(text)}</button>`;
  });
}

function ruleLabel(id) {
  const m = id.match(/^([ts])-(\w+)$/);
  if (!m) return id;
  const who = m[1] === 't' ? 'Teacher policy' : 'Student policy';
  const part = /^\d/.test(m[2]) ? m[2].toUpperCase() : m[2];
  return `${who} ${part}`;
}

const CALLOUT_TITLES = { grey: 'Grey area', tip: 'Tip', rule: 'The rule', note: 'Note' };

function blockExtensions(md) {
  // :::type Title\n ... \n:::   (no nesting)
  return md.replace(/^:::(\w+)[ \t]*(.*)\r?\n([\s\S]*?)\r?\n:::[ \t]*$/gm, (all, type, title, inner) => {
    const innerHtml = marked.parse(inlineExtensions(inner)).replace(/\n+/g, ' ');
    if (type === 'beginner') {
      const t = title || 'New to this? Read this first';
      return `<details class="beginner" data-beginner><summary>${esc(t)}</summary><div class="inner">${innerHtml}</div></details>\n\n`;
    }
    const t = title || CALLOUT_TITLES[type] || '';
    const tag = type === 'grey' ? '<span class="tag">Grey area</span>' : '';
    const head = t ? `<p class="callout-title">${tag}${esc(type === 'grey' && !title ? '' : t)}</p>` : '';
    return `<aside class="callout callout-${type}">${head}${innerHtml}</aside>\n\n`;
  });
}

export function renderMarkdown(md) {
  return marked.parse(inlineExtensions(blockExtensions(md)));
}

// ---------- chapters ----------
function buildChapters() {
  const list = [];
  for (const [path, raw] of Object.entries(chapterFiles)) {
    const { data, body } = parseFrontMatter(raw);
    const slides = body.split(/^===[ \t]*$/m).map((s) => s.trim()).filter(Boolean).map((src) => {
      const flags = (src.match(/^<!--\s*slide:\s*([^>]*?)\s*-->/) || [, ''])[1].split(/[\s,]+/).filter(Boolean);
      return { flags, html: renderMarkdown(src) };
    });
    list.push({
      id: data.id || path.split('/').pop().replace(/\.md$/, ''),
      num: data.num ?? '',
      title: data.title || 'Untitled',
      summary: data.summary || '',
      minutes: data.minutes || null,
      track: data.track || 'all',         // 'beginner' = optional for experienced users
      status: data.status || 'ready',     // 'soon' = placeholder
      file: path,
      slides,
    });
  }
  return list.sort((a, b) => a.file.localeCompare(b.file));
}
export const chapters = buildChapters();

// ---------- rules ----------
function buildRules() {
  const out = {};
  for (const [path, raw] of Object.entries(ruleFiles)) {
    const { data, body } = parseFrontMatter(raw);
    // headings with {#id}
    const withIds = body.replace(/^(#{2,4})\s+(.*?)\s*\{#([\w-]+)\}\s*$/gm, (all, hashes, text, id) => {
      const lvl = hashes.length;
      return `<h${lvl} id="${id}">${esc(text)}<a class="anchor-link" href="#${id}" aria-label="Link to this section">#</a></h${lvl}>\n\n`;
    });
    const html = marked.parse(withIds).replace(/<a href="http/g, '<a target="_blank" rel="noopener" href="http');
    out[data.id] = { ...data, html, text: body };
  }
  return out;
}
export const rules = buildRules();
export const rulesVersionKey = Object.values(rules).map((r) => `${r.id}:${r.version}:${r.revised}`).sort().join('|');
