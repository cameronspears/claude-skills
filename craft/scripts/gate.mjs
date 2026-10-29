#!/usr/bin/env node
// The definition of done, checked from the evidence in the work folder (see SKILL.md, Workflow).
//
//   node gate.mjs <workdir>
//
// Prints READY, or each thing that's missing. It can't judge quality; it checks that the
// looking, measuring and reviewing really happened.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const dir = path.resolve(process.argv[2] || '.');
const missing = [];
const notes = [];
const read = (f) => (existsSync(path.join(dir, f)) ? readFileSync(path.join(dir, f), 'utf8') : null);
const need = (ok, message) => {
  if (!ok) missing.push(message);
};

// brief.md: brand facts, direction card, inventory, blast radius.
const brief = read('brief.md');
need(brief, 'brief.md is missing.');
if (brief) {
  const lower = brief.toLowerCase();
  for (const [word, what] of [
    ['brand', 'brand facts'],
    ['mode', 'the mode of each surface'],
    ['question', 'the one question each surface answers'],
    ['thesis', 'a thesis'],
    ['signature', 'the signature element'],
    ['joy', 'the joy kit (named moments with triggers and timings)'],
    ['glass', 'the light and glass plan'],
    ['→', 'three rejected defaults ("default → instead")'],
    ['inventory', 'the component inventory'],
    ['blast radius', 'the blast radius (pages sharing what you changed)'],
  ])
    need(lower.includes(word), `brief.md has no ${what} (looked for "${word}").`);
  const rejected = (brief.match(/→/g) || []).length;
  need(rejected >= 3, `brief.md names ${rejected} rejected defaults; it needs three.`);
}

// Captures: before and after at four widths; states and zooms in the after set.
const shots = path.join(dir, 'shots');
const files = existsSync(shots) ? readdirSync(shots) : [];
need(files.length, 'shots/ is empty or missing.');
const widthsOf = (label) => new Set(files.filter((f) => f.startsWith(`${label}-`)).map((f) => f.match(/-(\d{3,4})-s\d+\./)?.[1]).filter(Boolean));
const before = widthsOf('before');
const after = widthsOf('after');
need(before.size >= 4, `before captures cover ${before.size} widths (${[...before].join(', ') || 'none'}); capture 1440, 768, 375 and 320.`);
need(after.size >= 4, `after captures cover ${after.size} widths (${[...after].join(', ') || 'none'}); capture 1440, 768, 375 and 320.`);
const afterStates = files.filter((f) => /^after-state-/.test(f)).length;
const afterZooms = files.filter((f) => /^after-zoom-.*-(focus|press)\.png$/.test(f)).length;
need(afterStates >= 5, `only ${afterStates} after state captures; script every state from your inventory in states.json.`);
need(afterZooms >= 8, `only ${afterZooms} after zoom captures in focus or press; zoom every kind of control.`);
const motionSeqs = new Set(files.filter((f) => /^(after|round-\d+)-motion-/.test(f)).map((f) => f.replace(/-f\d+-\d+ms\.png$/, ''))).size;
need(motionSeqs >= 4, `only ${motionSeqs} motion frame sequences; add "frames" states for the signature moment, a press, a toggle and a drag or toast, and read them (references/motion.md, Feel it).`);
need(files.some((f) => f === 'after-index.md'), 'shots/after-index.md is missing (capture.mjs writes it).');

// Audit: no FAIL left unless declined in the ledger.
const ledger = read('ledger.md') || '';
const audit = read('audit-after.json');
need(audit, 'audit-after.json is missing (node audit.mjs <url> --json audit-after.json).');
if (audit) {
  const checks = { contrast: (r) => r.contrast.length, focus: (r) => r.focus.noRing.length + r.focus.clipped.length, targets: (r) => r.targets.length, text: (r) => r.small.length, overflow: (r) => r.overflow.length, motion: (r) => r.motion.length, names: (r) => r.unnamed.length };
  const budgets = { radius: 5, shadow: 8, gradient: 0, color: 5, background: 9, tracking: 3, family: 2 }; // keep in step with audit.mjs BUDGETS
  const failing = new Set();
  for (const r of JSON.parse(audit)) {
    for (const [name, count] of Object.entries(checks)) if (count(r) > 0) failing.add(name);
    if (r.recess && r.recess.length) failing.add('recess');
    for (const [name, budget] of Object.entries(budgets)) if ((r.cohesion[name] || []).length > budget) failing.add(name);
  }
  for (const name of failing) {
    const declined = new RegExp(`^- \\[~\\].*\\b${name}\\b`, 'im').test(ledger);
    need(declined, `audit-after.json fails "${name}" and the ledger doesn't decline it with a reason.`);
  }
  if (!failing.size) notes.push('audit: every hard check passes.');
}

// Ledger: nothing open; fixed items cite evidence; declined items give a reason.
need(read('ledger.md'), 'ledger.md is missing.');
const items = ledger.split('\n').filter((l) => /^- \[[ x~]\]/i.test(l));
need(items.length >= 5, `ledger.md has ${items.length} findings; a real pass finds more. Look again at the zooms and states.`);
const open = items.filter((l) => /^- \[ \]/.test(l));
need(!open.length, `${open.length} ledger items still open:\n    ${open.slice(0, 5).join('\n    ')}`);
const fixedNoEvidence = items.filter((l) => /^- \[x\]/i.test(l) && !/evidence:/i.test(l));
need(!fixedNoEvidence.length, `${fixedNoEvidence.length} fixed items cite no evidence (add "Evidence: <capture>"):\n    ${fixedNoEvidence.slice(0, 3).join('\n    ')}`);
const declinedNoReason = items.filter((l) => /^- \[~\]/.test(l) && !/declined:/i.test(l));
need(!declinedNoReason.length, `${declinedNoReason.length} declined items give no reason (add "Declined: <why>").`);

// Reviews: at least two rounds; the last verdict is ship.
const reviews = path.join(dir, 'reviews');
const rounds = existsSync(reviews) ? readdirSync(reviews).filter((f) => /^round-\d+\.md$/.test(f)).sort((a, b) => parseInt(a.slice(6)) - parseInt(b.slice(6))) : [];
need(rounds.length >= 2, `${rounds.length} review rounds in reviews/; run at least two (the second checks the first's fixes).`);
if (rounds.length) {
  const last = readFileSync(path.join(reviews, rounds.at(-1)), 'utf8');
  const verdict = last.match(/verdict\W+(ship|fix|rebuild|recapture)/i)?.[1]?.toLowerCase();
  need(verdict === 'ship' || rounds.length >= 3, `the last review (${rounds.at(-1)}) says "${verdict || 'no verdict'}"; fix and review again (up to three rounds).`);
  if (verdict !== 'ship' && rounds.length >= 3) notes.push(`three rounds done without a ship verdict: say what's still open in your report.`);
}

// The next mile.
const nextMile = read('next-mile.md');
need(nextMile, 'next-mile.md is missing (the next mile, step 6).');
if (nextMile) {
  const ideas = nextMile.split('\n').filter((l) => /^- \[[ x~]\]/i.test(l));
  need(ideas.length >= 10, `next-mile.md has ${ideas.length} items; find at least ten.`);
  const openIdeas = ideas.filter((l) => /^- \[ \]/.test(l));
  need(!openIdeas.length, `${openIdeas.length} next-mile items still open.`);
}

for (const n of notes) console.log(`note: ${n}`);
if (missing.length) {
  console.log(`NOT READY (${missing.length}):`);
  for (const m of missing) console.log(`  - ${m}`);
  process.exitCode = 1;
} else console.log('READY: the evidence is complete. Now confirm the judgement items in SKILL.md and report.');
