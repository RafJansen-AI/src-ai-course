# AI in your course

An interactive web course on generative AI for teaching staff at the Stockholm Resilience Centre (SRC).
Teachers work through short chapters and leave with a **Course AI Kit**: text for their syllabus and
assignment briefs saying how students may use AI.

## Editing content (no coding needed)

| What | Where |
| --- | --- |
| Chapter text | `content/chapters/NN-name.md` |
| SRC policies shown in the Rules drawer | `content/rules/teacher.md`, `content/rules/student.md` |
| Glossary (hover explanations) | `content/glossary.json` |

Chapter files are Markdown with a few extras:

```
===                         new slide
:::grey Optional title      grey-area callout (also :::tip, :::rule, :::note)
...
:::
:::beginner Title           "New to this?" box, open by default for beginners
...
:::
[[hallucination]]           glossary term (id or any alias from glossary.json)
[[shown text|term-id]]      glossary term with your own wording
[[rule:t-3b]]               link to a policy clause, opens the Rules drawer
[[rule:t-3b|clause 3B]]     same, with your own wording
<div data-widget="dial"></div>   interactive widget (see src/widgets/index.js)
<!-- slide: beginner -->    first line of a slide: only on the beginner path
<!-- slide: wide -->        wider layout
```

Front matter per chapter: `id`, `num`, `title`, `summary`, `minutes`, optionally `track: beginner`
(skipped for experienced users) and `status: soon` (placeholder).

**When the SRC policy changes:** update the Markdown in `content/rules/` (keep the `{#t-3b}` ids stable)
and bump `version` / `revised` in the front matter. Returning visitors then see an "updated rules" banner.

Learner answers are stored only in the visitor's browser (localStorage). No accounts, no tracking.

## What's where in the code

| Widget | Chapter | File |
| --- | --- | --- |
| Check-in, course setup | 0 | `src/widgets/checkin.js`, `course-setup.js` |
| Spot the AI | 1 | `src/widgets/spot.js` |
| "What can AI do" cards | 2 | `src/widgets/flipcards.js` (cards are in the chapter file) |
| Rules scenarios | 3 | `src/widgets/scenarios.js` (the 12 cases and verdicts are at the top) |
| Rules per assessment | 4 | `src/widgets/dial.js`, practical rules per assessment type in `practice.js` |
| Stress test | 5 | `src/widgets/stress.js` |
| Fix this brief | 6 | `src/widgets/brief.js` |
| Misuse case | 7 | `src/widgets/branch.js` |
| Disclosure line | 8 | `src/widgets/disclosure.js` |
| Course AI Kit, first-lecture script | 6, 9 | `src/widgets/kit.js`, exercises in `practice.js` |

Standalone pages (like About) live in `content/pages/` and are shown at `#/p/<id>`.

## Development

```
npm install
npm run dev          # local dev server
npm run build        # static site in dist/
npm run preview:artifact   # single-file preview in dist-single/preview.html
```

## Deploying on Cloudflare

In the Cloudflare dashboard: **Workers & Pages → Create → Import a repository**, pick this repo,
build command `npm run build`, deploy command `npx wrangler deploy` (uses `wrangler.jsonc`).
Every push to `main` then deploys; branches get preview URLs. Free plan is enough.

### Link-only access

A small Worker (`worker/index.js`) sits in front of the static files. Visitors need the link
with the key, `https://<site>/?k=<ACCESS_KEY>`; it sets a cookie for a year and removes the key
from the address bar. Without key or cookie they see a short "only available through its link" page.
Everything is served with `noindex`, and `robots.txt` disallows all.

Set the key once: **Worker → Settings → Variables and Secrets → Add → Secret**, name `ACCESS_KEY`,
a long random value (e.g. `openssl rand -hex 16`). Until it's set, the site shows "not set up yet".
To lock out everyone who has the old link, change the secret and send the new link.

This is a shared link, not per-person access: anyone who has the link can get in and pass it on.
