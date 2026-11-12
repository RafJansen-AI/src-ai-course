import { renderMarkdown, esc } from '../lib/content.js';

// A branching case. Each node: text (Markdown), choices [{label, to}], or end: true with a verdict.
// Kept deliberately close to what SU rules allow; legal points are marked where they matter.
const NODES = {
  start: {
    text: `**Week 6 of a master's course.** Sam hands in a policy brief on Baltic fisheries. It's fluent, well structured, and better than anything Sam has written before. In the seminar, you ask Sam to explain the *regime shift* idea the brief leans on. Sam can't, and changes the subject.

Checking the references, you find that one of the six doesn't seem to exist.

The course follows the SRC student rules, and the brief spelled them out: AI may explain concepts and give feedback on your own draft, but may not write the text. It was in the syllabus and you went through it in the first lecture.

**What do you do first?**`,
    choices: [
      { label: 'Run the brief through an AI detector to see what it says', to: 'detector' },
      { label: 'Fail the brief for AI misuse', to: 'failnow' },
      { label: 'Invite Sam to a short conversation about the brief', to: 'invite' },
      { label: 'Let it go and grade the brief as written', to: 'ignore' },
    ],
  },
  detector: {
    text: `**Not an option.** SRC teachers must not use AI detectors ([[rule:t-3c|teacher policy 3C]]). They're unreliable, and a score is not evidence you could use anyway. A detector result would also colour how you read everything Sam says next.`,
    choices: [{ label: 'Go back', to: 'start' }],
  },
  failnow: {
    text: `**Not yet.** You don't know what happened, and a fail "for AI misuse" is a misconduct finding you're not allowed to make yourself. In Sweden, deciding whether a student cheated is the job of the disciplinary board, not the teacher.

You *can* assess the brief on its merits, but you don't have enough to go on yet. And the missing reference needs explaining whatever its cause.`,
    choices: [{ label: 'Go back', to: 'start' }],
  },
  ignore: {
    text: `**This is the option that does the most damage.** Sam learns that it works, other students notice, and the next cohort hears about it. Grading a brief you have good reason to doubt as if it were Sam's own also isn't fair to the students who did the work.

You don't need certainty to ask questions. You need a reason, and you have two.`,
    choices: [{ label: 'Go back', to: 'start' }],
  },
  invite: {
    text: `Good. You email Sam: "I'd like to talk through your policy brief before I grade it. 15 minutes, any time this week."

Sam comes. **How do you open?**`,
    choices: [
      { label: '"Did you use ChatGPT to write this?"', to: 'askdirect' },
      { label: '"Walk me through how you built the argument in section 2. And where does reference 4 come from?"', to: 'askwork' },
    ],
  },
  askdirect: {
    text: `Sam says "only for grammar", and now you're stuck: you can't prove otherwise, and the conversation has become about AI instead of about the work.

A yes/no question about tools invites a yes/no answer. Questions about the *work* tell you far more, and they're fair to a student who did it honestly.`,
    choices: [{ label: 'Try the other opening', to: 'askwork' }],
  },
  askwork: {
    text: `You ask Sam to explain the argument and the missing source.

**What happens next?**`,
    choices: [
      { label: 'Sam explains it well. The reference was a typo in the year and author order.', to: 'fine' },
      { label: 'Sam struggles, then says AI "helped a lot" with the writing and the references.', to: 'admits' },
      { label: 'Sam can\'t explain the argument but insists it\'s all their own work.', to: 'denies' },
      { label: 'Sam says openly that ChatGPT wrote parts of it, and didn\'t think that was cheating since it was "just help".', to: 'unaware' },
    ],
  },
  fine: {
    end: 'good',
    text: `**Grade the brief as normal.** Some students write better than they talk, especially in a second language. Tell Sam to fix the reference and maybe to check the reference list against the sources next time.

You've lost 15 minutes and gained a student who knows you read their work. That's a good trade, and it's why the conversation should come before any conclusion.`,
  },
  admits: {
    end: 'report',
    text: `**This is now a well-founded suspicion, and you must report it.** Under the Higher Education Ordinance (chapter 10, section 2), a teacher who has *well-founded* reasons to suspect cheating has to report it to the vice-chancellor. At SU that goes through the disciplinary procedure. You don't get to settle it informally, even kindly.

What to do:
- Write down what you asked and what Sam said, the same day.
- Keep the brief, the reference check and the seminar notes.
- Tell Sam it will be reported and that the disciplinary board decides, not you.
- Don't grade the brief until the case is decided.

Reporting isn't punishing. The board looks at whether the student *intended* to mislead, and Sam gets to give their side.`,
  },
  unaware: {
    end: 'assess',
    text: `**Be understanding, but be clear.** The rules are new, and plenty of students honestly don't see where "help" ends. Sam told you openly, which doesn't look like an attempt to mislead. Cheating needs that intent.

What to do:
- Explain the rule and why it's there. Point to the line in the brief.
- Assess the brief on its merits. The parts AI wrote don't show the learning outcomes. If your course allows a resubmission, this is a good case for one.
- Write down what was said, in case it comes up again.
- If you're unsure whether this still counts as a well-founded suspicion, ask the director of studies before deciding. Here, the rule was in the brief and the first lecture, which makes "I didn't know" weaker than it would be in a course that said nothing.

As the rules settle in, this excuse should get rarer, and your patience with it can shrink accordingly.`,
  },
  denies: {
    end: 'assess',
    text: `**You have a doubt, but maybe not a well-founded suspicion.** Talk to the examiner or director of studies before deciding whether to report. A fabricated reference with no explanation can be enough on its own; check SU's guidance.

Separately: **does the brief show the learning outcomes?** If the assessment includes being able to explain and defend the argument (an oral part, a seminar defence), you can assess that and fail it on its merits if Sam can't. If the assessment is only the written brief, you can't fail it for what Sam couldn't say in a meeting.

That's the lesson for the next course: examine the important part in the room (chapter 5), and the question of "did they use AI" matters much less.`,
  },
};

const ENDS = { good: 'Good outcome', report: 'Report it', assess: 'Grey area' };

export default function branch(el, { store }) {
  let path = ['start'];
  const draw = (focus) => {
    const id = path[path.length - 1];
    const n = NODES[id];
    el.innerHTML = `<div class="card branch">
      ${path.length > 1 ? `<p class="branch-trail hint">Step ${path.length}</p>` : ''}
      ${n.end ? `<p><span class="verdict-tag end-${n.end}">${ENDS[n.end]}</span></p>` : ''}
      <div class="branch-text" tabindex="-1">${renderMarkdown(n.text)}</div>
      ${n.choices ? `<div class="branch-choices">${n.choices.map((c, i) => `<button type="button" class="branch-choice" data-to="${c.to}">${esc(c.label)}</button>`).join('')}</div>`
        : `<p style="margin:0;display:flex;gap:.5rem;flex-wrap:wrap"><button type="button" class="btn small" data-back>Try another answer</button><button type="button" class="btn small secondary" data-restart>Start the case again</button></p>`}
    </div>`;
    el.querySelectorAll('[data-to]').forEach((b) => b.addEventListener('click', () => {
      const to = b.dataset.to;
      if (to === 'start') path = ['start'];
      else if (path.includes(to)) path = path.slice(0, path.indexOf(to) + 1);
      else path.push(to);
      if (NODES[to].end) store.update((s) => { s.branchEnds = [...new Set([...(s.branchEnds || []), NODES[to].end])]; });
      draw(true);
    }));
    el.querySelector('[data-back]')?.addEventListener('click', () => { path.pop(); draw(true); });
    el.querySelector('[data-restart]')?.addEventListener('click', () => { path = ['start']; draw(true); });
    if (focus) el.querySelector('.branch-text').focus({ preventScroll: false });
  };
  draw(false);
}
