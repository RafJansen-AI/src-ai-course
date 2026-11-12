// Everything the learner enters is kept in their own browser only.
const KEY = 'srcai.v1';
const defaults = () => ({
  beginner: null,          // null = not decided yet
  checkin: {},
  course: { name: '', level: '', assessments: [] },
  progress: {},            // chapterId -> highest slide index seen
  scenarios: {},           // scenarioId -> chosen answer
  rulesSeen: '',
  last: '',                // last location hash
});

let state = defaults();
try {
  const raw = localStorage.getItem(KEY);
  if (raw) state = { ...defaults(), ...JSON.parse(raw) };
} catch { /* private mode etc. */ }

const listeners = new Set();
export function get() { return state; }
export function update(fn) {
  fn(state);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  for (const l of listeners) l(state);
}
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function reset() {
  state = defaults();
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  for (const l of listeners) l(state);
}
