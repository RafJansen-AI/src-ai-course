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
<div data-widget="dial"></div>   interactive widget (checkin, course-setup, scenarios, dial, kit)
<!-- slide: beginner -->    first line of a slide: only on the beginner path
<!-- slide: wide -->        wider layout
```

Front matter per chapter: `id`, `num`, `title`, `summary`, `minutes`, optionally `track: beginner`
(skipped for experienced users) and `status: soon` (placeholder).

**When the SRC policy changes:** update the Markdown in `content/rules/` (keep the `{#t-3b}` ids stable)
and bump `version` / `revised` in the front matter. Returning visitors then see an "updated rules" banner.

Learner answers are stored only in the visitor's browser (localStorage). No accounts, no tracking.

## Development

```
npm install
npm run dev          # local dev server
npm run build        # static site in dist/
```

## Deploying on Cloudflare

The site is fully static. In the Cloudflare dashboard: **Workers & Pages → Create → Import a repository**,
pick this repo, build command `npm run build`, deploy command `npx wrangler deploy` (uses `wrangler.jsonc`,
which serves `dist/`). Every push to `main` then deploys; branches get preview URLs.
