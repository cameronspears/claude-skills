# The bullet gate

Every line on the page has to earn its slot. A bullet that's accurate, well written and impressive can still fail here, and the most expensive failures look exactly like that.

## The three questions

Ask all three of every bullet, the summary and the headline. A "no" to any one means rewrite or replace.

**1. So what, for whom?** Does it say what changed for a customer, user, team or the business? Or does it only describe how something was built or what the job involved?

Implementation and duties fail. The test: could a non-specialist hiring manager say who was better off afterwards?

- Fails: "Migrated the order service from REST to gRPC and added retries with exponential backoff." Accurate, technical, and it reads well to an engineer. But it's a task. Nobody can tell from it who benefited, and a candidate who directed the build rather than wrote it couldn't comfortably walk through it in an interview.
- Passes: "Cut checkout drop-off for first-time buyers from 18% to 11% by removing the account step, after watching 40 recorded sessions." A decision, with the people it helped and how much.

**2. Is it theirs?** Can the candidate tell the story behind it in their own words in about 30 seconds: what the problem was, what they decided, what happened? If they'd have to memorise an explanation, it isn't theirs. This matters most for anyone who builds by directing AI agents or teams: claim the decisions, the judgment and the outcomes, not the mechanics.

You can't answer this one alone. That's what the candidate check in phase 2 is for. Until the candidate confirms, mark the bullet `candidate_ok: false`.

**3. Does this reader care?** Would the target hiring manager for this variant want this in this slot more than anything else in the ledger? The same fact can be the best bullet for one role and noise for another. A PM's pricing win matters to a growth-stage CEO, not to a design-engineering lead.

## Then: is it the best thing for this slot?

Compare it against the ledger, not against the current page. The first draft is always anchored on what the candidate already wrote. Typical upgrades:

- A decision with a visible trade-off beats a delivered feature. Kept prices against pressure because the funnel data said traffic was the problem.
- A result someone else confirmed beats self-assessment. "The largest merchant renewed early and cited the new risk controls."
- Judgment about AI (how it was tested, when it refuses, what it costs) beats "used AI."
- Honesty that cost something beats a bigger number. "Paused a launch after the pilot showed refunds rising, and shipped two weeks later with the fix."

## Writing rules

- **Front-load the value.** Readers skim in an F shape and read the first 3 to 6 words of a bullet. Start with the result or a strong verb: "Cut duplicate-charge disputes by 40% by…" rather than "Redesigned the payment flow, and disputes dropped."
- **One idea per bullet,** at most two lines, at most two numbers.
- **Past tense for finished work,** present tense only for ongoing duties, and never mixed in one bullet.
- **No first person in bullets.** In the summary, "I" is fine if used consistently.
- **Plain words.** If a reader outside the specialty wouldn't know a term, replace it with what it does. Keep the terms the target reader uses daily (a fraud team knows "chargeback ratio"; a design-tool hiring manager doesn't).
- **Absolute claims invite a fight.** "Can't lose a payment" gets argued with; "records every payment once" doesn't.
- **Label modeled results.** "In backtest", "in replay", "projected".
- **Counts must mean something to the reader.** Test, commit, PR and epic counts read as padding, especially when agents produced the work. Customers, users, money, time saved and error rates read as outcomes.
- **"Only" and "first" are peer comparisons.** They read as digs at former colleagues, who may be references. Show the behaviour instead.
- **Banned:** em dashes, "not X but Y" constructions, colon-then-list sentences, buzzwords (the linter has the list), and filler like "successfully", "various", "responsible for".

## Patterns that read as AI-written

Reviewers flag these immediately, and so do hiring managers:
- a bold lead-in on every bullet
- arrows and math symbols in prose (→, ≈, ×)
- a manifesto summary ("I believe great products start with empathy…")
- stacked metrics in one line
- jargon used to sound rigorous ("multi-armed orchestration layer")
- "built with AI agents" repeated in several places (say it once, in the summary, as a method)
- a skills section labelled "Built with AI:", which reads as "can't do this without AI"

## What blind judges have rewarded

- **Owned decisions beat asserted results.** "Set the launch criteria for the new model at…" beat "Launched the model once it performed well", because the second invites "how well?".
- **Name process you can defend, not perfection.** "Reviewed 200 flagged orders by hand each week" beat "Verified every flag the model raised", because the second cracks under "every one?".
- **Unquantified benefit tails lose.** "…improving the merchant experience" read as padding next to a hard number.
- **One precise deliverable beats a broad claim.** "Wrote the refund policy every support agent now works from" beat "Improved support processes".
- **Repeated verbs lose.** Two adjacent bullets starting "Launched…", or "Built… a build", lost to versions that varied them.
- **"Duty" lines can carry domain proof.** Cutting a partner-integration bullet lost every time, because readers valued it as evidence of scope, even after a panel called it a duty.
- **Plain words for outsiders.** An executive outside the field penalized an internal product name opening the summary. Saying what the product does won.
- **The same phrase can win with one reader and lose with another.** Keep each variant's wording separate rather than syncing them.

## Change menu for hill-climb rounds

1. Swap: replace a bullet with a stronger ledger fact for that reader.
2. Lead: rewrite an opening so the value is in the first five words.
3. Cut: remove a bullet. A shorter role often wins, because readers stop after about three bullets.
4. Merge: fold two thin bullets into one with proof attached, such as an award attached to the behaviour it rewarded.
5. Order: strongest first within each role, for this variant's reader.
6. Summary or headline: change the story the top third tells.
7. Descriptor: rewrite a company's one-line description so an outsider knows its scale and domain.
8. Layout: a change within `layout.md`, such as bold placement, spacing or section order.

One change per round, so the judges are judging one thing.
