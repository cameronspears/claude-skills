---
name: resume-hillclimb
description: Start or resume a long, measured hill-climb that builds and polishes a resume from evidence. Gathers proof of the candidate's work first, drafts one-page versions per target role, then runs rounds that each make one change, check it against hard gates, and keep it only if blind hiring-reader judges prefer it. Saves state so a multi-hour run can resume. Run only when the user types /resume-hillclimb.
argument-hint: '[time budget in hours, default 1]'
disable-model-invocation: true
---

<starting_or_resuming>
Arguments: "$ARGUMENTS". A number sets the time budget in hours (default 1). Nothing else is expected.

Judges answer in seconds, so a round takes only 1 to 3 minutes and an hour is 10 to 20 rounds. Budget by judge calls as well as time: each judge costs roughly 70K tokens even on a light model, so 150 judge calls is about 10 million tokens. Tell the user the budget at the start, and stop early when the climb plateaus rather than spending the clock on ties.

Paths like `scripts/render.sh` and `references/readers.md` are relative to this skill's base directory. Runs live in `resume-hillclimb/` inside the current working directory. `resume-hillclimb/current.json` points at the latest run: its id, time budget, start time, round count and whether it has finished. Below, `<run>` means `resume-hillclimb/<run id>/`.

- **Unfinished run:** resume it. Read `<run>/state.json` and `<run>/journal.md`, re-render the current best versions, and carry on from the next round. Say in one line which round you're resuming at and how much time is left.
- **No run, or the last one finished:** start a new run. The id is today's date plus a short slug. If a finished run exists, offer to start from its best versions and evidence ledger instead of from scratch.
</starting_or_resuming>

<goal>
Produce the best honest one-page resume for each target role: one that a hiring manager skimming for six seconds sees the right story in, a careful reader believes, and the candidate can defend line by line in an interview.

"Best" has three parts, and each needs its own defence:
- **True.** Every claim traces to evidence. Numbers are the candidate's or the sources', never invented, and modeled or estimated results say so.
- **Theirs.** The candidate can tell the story behind every bullet in their own words in about 30 seconds. A line they couldn't explain is a liability, however impressive it reads.
- **Chosen for the reader.** Each line is the strongest thing that could go in that slot for that role, written so its first few words carry the value.

A hill-climb gets stuck polishing words while the real problem (the wrong story, the wrong order, a weak role framing) never gets looked at. The ways out, under <escaping_local_maxima>, are part of the job.
</goal>

<phase_1_evidence>
Read `references/evidence.md` before starting. Do not write a single bullet until this phase is done: the main failure of resume writing, human or AI, is polishing what the candidate already said instead of finding what they actually did.

1. **Intake.** Learn the target roles (one variant per distinct role family, usually one or two), location and remote needs, pay floor if relevant, and anything off-limits: confidential customer names, work the candidate doesn't want featured, side projects that could conflict with their employer. Write these to `<run>/constraints.json` (format in `scripts/lint_resume.py`).
2. **Sources.** Collect everything: the old resume (also the best sample of the candidate's voice), accomplishment docs, performance reviews, project repos, published work, memory notes, past conversations. For large sources such as code repositories, send parallel investigators with a brief from `references/evidence.md`; they return facts with sources, not prose.
3. **Ledger.** Write `<run>/ledger.json`: one entry per fact, with an id, the fact, the number if any, the source, a confidence, whether the candidate confirmed it, and whether it may appear on the page.
4. **Interview.** Ask the candidate the questions from `references/evidence.md` that the sources can't answer: scale, team, outcomes, how they validated things, awards, what they're proudest of. Batch them into one message. Rough numbers are fine. Record answers in the ledger as candidate-sourced. Facts from the candidate's own old resume count as candidate-stated. If there's no old resume or writing sample, ask for one, or use the candidate's own messages as the voice reference.
5. **Starting from an existing draft?** Convert it to a content file, link each bullet to ledger ids, and list every bullet whose facts no source backs. Ask the candidate to confirm those in one batch before round 1. Unbacked claims are the commonest way a polished resume fails a reference check.
</phase_1_evidence>

<phase_2_first_draft>
1. Draft each variant as a content file, `<run>/v/<variant>.resume.json` (format: `assets/example.resume.json`). Write every bullet through the gate in `references/bullet-gate.md`, link it to ledger ids, and follow the layout rules in `references/layout.md`.
2. Render and check: `scripts/render.sh <content.json> <run>/render/<variant>` (one page, no orphans, no bullet over two lines) and `python3 scripts/lint_resume.py <content.json> --constraints <run>/constraints.json --ledger <run>/ledger.json`. Look at the PNG preview yourself.
3. Run the first-draft panel from `references/panel.md`: all seven seats in parallel, each given the plain text (and the PNG for the layout seat), never your reasoning. Merge their findings, rewrite, re-render, and run a second, smaller round with fresh reviewers on the rewrite. Where reviewers disagree, decide by the goal above and note why in the journal.
4. **Candidate check.** Show the candidate every bullet as a numbered list and ask which ones they couldn't tell as their own story, which overstate, and which miss something. This is the step that catches lines that read well but aren't theirs. Mark each bullet `candidate_ok` in the content file.
5. Save the result as round 0: a fixed copy in `<run>/rounds/0/` (held-out checkpoints always compare against it) and the working copy in `<run>/best/`.

`candidate_ok` means two different things in two places. In the ledger, the candidate confirmed the fact. In the content file, they confirmed the bullet as written (they can tell that story). A bullet can use only confirmed facts and still be unconfirmed.
</phase_2_first_draft>

<measuring>
A resume has no single score, so each round is measured three ways.

1. **Gates.** A candidate change that fails any gate is reverted, whatever the judges think:
   - `render.sh` exits 0: one page, `bullets_over_2_lines=0`, `orphans=0`, `overflow=0`, `wrapped=0` (contact, descriptor, skills and education lines on one line each; summary at most three lines).
   - `lint_resume.py` reports zero gate failures, with the run's constraints and ledger. Its WARN lines are advice, not rules. When a judge prefers a version the linter warns about (an ownership phrase like "Owned the launch criteria" can be the value), the judge wins.
   - Every new or changed fact is in the ledger. New facts the candidate hasn't confirmed go on the "for the candidate" list and the bullet is marked `candidate_ok: false`; the run may keep it provisionally, but the final delivery must say so.
   - The bullet gate in `references/bullet-gate.md` passes for every changed line.

2. **Blind pairwise judges.** Read `references/readers.md` and use its prompts exactly, including its rules for keeping judges blind: neutral file names, no tools beyond looking, random order, and a lighter model. Each round, one reader persona judges the before and after versions as A and B. Never tell it the change, your reason, or which one is new: you wrote the change, so you're the least reliable judge of it. Run it again with the order swapped. The change wins only if preferred both times, or once with a tie. Rotate personas across rounds.

3. **Held-out readers.** Keep 2 personas from `references/readers.md` held out. Never choose a change because of them. Every 5 kept changes, judge the round-0 baseline against the current best with them, both label orders. If the climbing readers keep preferring the new version while held-out readers don't, you're climbing the judges, not the resume: stop and fix the rubric before going on.

In round 0, calibrate: show a judge the same version as both A and B a few times. If it often prefers one of two identical versions, tighten the rubric before trusting it.
</measuring>

<the_loop>
Each round:

1. **Pick a target.** Usually the weakest slot by the last panel or audit: the bullet most likely to be skipped, the role whose first two bullets don't carry it, the summary, the order. Check the journal's tried list first and don't repeat a rejected idea unless something changed. A draft that has already been through review rounds has little word-level headroom left. Start such runs with evidence work (a better fact for a slot) and a leap, and treat wording polish as the last resort.
2. **Write a hypothesis** in the journal: which reader it helps, why, what changes, and what could get worse.
3. **Make one change, done well.** The kinds of change, from the menu in `references/bullet-gate.md`: swap a weaker bullet for a stronger ledger fact, rewrite an opening so the value comes first, cut a bullet (a shorter page can win), merge two thin bullets, reorder within a role, rewrite the summary or headline, change a descriptor line, or adjust layout within `references/layout.md`.
4. **Gates, then judges.**
5. **Keep or revert.** On a win, copy the content file to `<run>/best/` and record it. On a loss or tie, restore the best version and log the judges' reasons.
6. **Update** the journal and state, and post one line in chat.

**Two candidates per variant per round.** Rounds are cheap in wall-clock time, so run two independent changes per variant at once, each touching a different slot and each judged against the current best. Keep every winner, combine the winners into the best, and run the gates again on the combination.

**Accuracy is not judged.** When the risk seat or a fact-check finds a claim the evidence doesn't support, fix it directly as a gate fix. First check the finding against the full sources: reviewers working from a compressed ledger raise false alarms, and some of their flags will be wrong.

**Audiences can disagree.** If climbing readers and held-out readers prefer opposite versions along audience lines (an engineering lead wants technical depth first; a recruiter wants titles and scope first), don't pick one. Keep the safer version as the default and ship the other as a named variant for that audience.

**Slot tournaments beat one-at-a-time rewrites.** Once wording polish is all that's left, pairwise rounds mostly return ties. Instead, for each weak slot write two or three rewrites drawn from the ledger, gate them, and run the skill's `scripts/slot.py build` with the run folder as the working directory: it writes ranking folders where a judge sees the whole current page plus every option for that slot, shuffled differently for each of two judges (prompt in `references/readers.md`). A rewrite advances only if it tops both rankings. Combine every advancing rewrite into one version, gate it again, and confirm it pairwise against the best with two personas that didn't rank (the skill's `scripts/slot.py pair`). In testing, six slots took 12 ranking judges and 4 confirmations, and five of the six rewrites were kept, where earlier pairwise rounds on the same page were mostly ties. To add a bullet rather than replace one, rank the candidates for the new bullet against the page without it, then confirm the winner pairwise.

**Feed the generator, not just the judges.** The best rewrites come from three inputs run in parallel before a round: a hiring-lead "honest read" (what the eye lands on in 10 seconds, what's skipped or doubted, what's missing, would you advance it; no rewriting), the "is that really the best line?" critic with the ledger in hand, and an evidence miner sent back to the sources with the target's own values as its search list. Check every fact a critic proposes against the ledger and sources before using it. Critics recombine facts into claims the evidence doesn't make, and they reuse ideas the tried list already rejected.

**Tailoring to one company.** When the candidate names a target company, read its own hiring material first: the live posting, its careers or engineering blog pages, and its interview process. Turn the stated requirements into the miner's search list and the judges' persona text. Make the company's version a named variant with its own personas: a hiring lead, a talent screener, a skeptical technical interviewer, and a peer engineer. Use that company's exec as a held-out reader, plus a similar leader at another company, to catch overfitting to one company's words. Tell the candidate plainly what the interview process will test that the resume can't fix.

**Watch what wins.** If most winning reasons quote the same line, judges may be rewarding one surface feature. Check that the held-out readers agree before keeping more changes of that kind.

**Reviewers click links.** Hiring-lead readers say they check a GitHub or portfolio link before deciding. Look at the candidate's public footprint (repos, profile, live product) and tell them what a reviewer will find there. It isn't part of the page, but it can sink it.

Every 5 kept changes, also re-run two panel seats from `references/panel.md` (the "so what, and is it yours?" seat and the risk seat) on the current best. Judges reward what reads well; these two catch what reads well but shouldn't be there.
</the_loop>

<escaping_local_maxima>
Signs you're stuck:
- 3 rounds in a row with no win on the same target, or 5 overall.
- 4 kept changes in a row that were all word-level polish with narrow wins.
- The same weakness keeps coming back in panel findings after you "fixed" it.

When one fires, spend the next round diagnosing, and act on the biggest cause:

| Why you're stuck | Tell | What to do |
| --- | --- | --- |
| Wrong target | That slot is already strong | Move to the slot with the most headroom |
| Structural | The story or order is the problem, not the wording | Make a leap (below) |
| Thin evidence | Every rewrite of a slot ties because there's nothing better to say | Go back to the ledger, investigate a source further, or add a question for the candidate |
| Judge | Changes you believe in keep tying, or the reasons don't match the page | Fix the rubric, re-judge the last 3 rounds, say what changed |
| Candidate rule | The better version breaks a constraint | Put it on the "for the candidate" list and move on |

**The leap.** Build 3 versions of the stuck variant that differ in structure, not wording: a different headline and summary story, a different order of roles or sections, a different choice of which 3 accomplishments lead. At least one cuts something that looks important. At least one is written for the persona the current version serves worst. Judge each against the best, and the winners against each other. A leap may be adopted on a tie if it has more headroom; then it has 3 rounds to win outright or it's reverted and logged.

**Scheduled exploration.** Every 8 rounds, spend one round on one of: a leap on the variant touched least, a fresh investigation of a source the ledger covers thinly, or reading real job postings for the target roles and checking the page against what they ask for.
</escaping_local_maxima>

<state>
The run will outlast your context window and maybe this session. After every round, keep on disk in `<run>` everything you'd need to resume:
- `journal.md`: a status table at the top (round, variant, change in one line, gates, both verdicts, kept or reverted), then the tried list with reasons, the "for the candidate" list, held-out checkpoint results, and a short paragraph on where things stand, rewritten every round.
- `state.json`: round, start time, time budget, best file paths, open leap with rounds left, next scheduled exploration.
- `best/` (current best content files), `rounds/<n>/` (candidate content and renders), `ledger.json`, `constraints.json`.
When the run ends, set `finished` in `current.json`.
</state>

<subagents>
Use subagents where independence matters: the two blind judge runs per round, the first-draft panel, held-out checkpoints, and source investigators in phase 1. Brief each one completely the first time (it knows only what you give it) and never hand it your conclusion. Do the rest yourself.

Cost: a judge costs roughly 70K tokens per verdict, mostly fixed overhead from the subagent's own context, so a lighter model saves money per token rather than tokens. A pairwise round is about 140K, a two-slot tournament with confirmation about 400K. Tell the user the rough budget at the start (see <starting_or_resuming>).
</subagents>

<communication>
After each round, post one line in plain words: "Round 9, PM variant: the pricing bullet now leads with the revenue change. Kept, won both judge runs." When a stuck sign fires or a leap starts, say so in a sentence. Make routine writing calls yourself. Stop for the candidate only for facts only they know, anything on the constraints list, and the final bullet check.
</communication>

<stopping>
Stop when the time budget is spent, when two full escape cycles in a row produce no kept change, or when a held-out checkpoint loses to the baseline and fixing the rubric doesn't explain it. If nothing was kept, the best is still round 0: skip the final checkpoint and say plainly that the run found no improvement, and what that suggests (usually that the evidence, not the wording, is the limit).

When you stop:
1. Run the full gates and a final held-out checkpoint against round 0 on every variant.
2. Run the candidate check again on any bullet that changed since they last saw it.
3. Deliver the PDF of each variant (the submission file) and the DOCX (for portals that demand it), named `First-Last-Resume.pdf` style for upload.
4. Report in a few sentences: what got better and for which readers, what was tried and failed, what's on the "for the candidate" list, and where a next run should aim.

If the user stops the run early, save state first so `/resume-hillclimb` can resume it.
</stopping>
