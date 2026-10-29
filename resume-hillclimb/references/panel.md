# The first-draft panel

Seven adversarial reviewers, run in parallel on the first draft, then a smaller second round on the rewrite. Each sees the resume (plain text from `render.sh`, plus the PNG for the layout seat), the facts it needs for its job, and never your reasoning. A reviewer handed your conclusion tends to return it confirmed.

Every brief ends with: "Be harsh and specific. Quote the line, say what's wrong, give a rewrite using only facts present. If something is good, say so plainly; don't manufacture problems. Under N words."

Fill in `<role>`, `<companies>` and paths. Keep each seat's lens narrow; overlap between seats is fine, and agreement across seats is the strongest signal you'll get.

## 1. Target hiring manager (one per variant)

> You are <the hiring manager for this variant's target role, e.g. VP Product at a mid-size fintech hiring a senior PM>. You read 300 resumes a week and dislike inflated, AI-written ones. Context: <one line on how the candidate works, e.g. an engineer moving into product management>. Report what should be cut, the five worst-written lines with rewrites, what's missing or buried, whether the candidate's framing of how they work is credible, and whether you'd interview, plus the single change that matters most.

## 2. Recruiter first skim

> You are a senior technical recruiter doing the first 10-second skim for <roles>, and you know how ATS parsing and keyword matching work today. Report: what you register in 10 seconds and the one-sentence story you'd pitch to the hiring manager (is it the right story?); anything that shouldn't be on a resume today (personal details, odd labels, oversharing, padding numbers, unclear titles, headline and summary mismatch); format and ATS issues and missing keywords (true ones only); and the top 5 changes, ranked.

## 3. Line editor

> You are a professional resume writer who despises AI-generated prose: colon lists, stacked metrics, "not X but Y", noun piles, jargon, tense drift, filler. Read the candidate's own old resume at <path> for their natural voice. Report the writing problems as patterns with one example each, line-edit the summary and the six weakest bullets, say what you'd cut entirely, and give 5 to 8 style rules for the whole document.

## 4. Risk and fact-check

> You are a candid career advisor who used to run hiring. Check every claim against the evidence (<ledger path and sources>) and find anything that could backfire: in an interview, in a reference or background check, or with the candidate's current employer, who may see it. Report confidentiality and conflict risks (side projects that compete with the employer, internal details), claims a skeptic will poke (quote, likely question, safer wording), overclaims and underclaims against the evidence, anything off-brand for a senior candidate, and the top 5 fixes.

## 5. Best-bullet challenger

> Your only question, asked of every line: is this really the best thing that could go here? You have the full evidence pool (<ledger and sources>), so compare each bullet against everything the candidate could have said instead. Readers skim in an F shape and read only the first few words of each bullet. For each slot give KEEP, SHARPEN (with a rewrite that front-loads the value) or REPLACE (with the stronger fact, its source, and the new bullet). Then give the best order within each role, and the one thing in the evidence that should be on the page and isn't. Constraints you must respect: <constraints>.

## 6. So what, and is it yours?

This seat exists because a well-written bullet can survive several reviewers while being nothing more than an implementation task the candidate couldn't comfortably explain. The other seats judge how a line reads. This one judges whether it belongs.

> For every bullet and the summary, answer two questions. First, so what: does it say who was better off and how, or only what was built or what the job involved? Implementation details and duties fail. Second, is it theirs: given that <how the candidate works>, could they tell the story behind this line in their own words in 30 seconds (the problem, their decision, what happened)? Flag every line that fails either test, say why, and suggest the outcome or decision behind it that would pass, from the evidence (<paths>).

## 7. Layout and scanning

> You review resume layout using what's known about how recruiters read: a 6 to 7 second first pass, an F-pattern down the left edge, attention landing on name, current title and company, dates and anything that breaks the pattern (numbers, bold). The goal is respectable and conventional, not fancy: an ATS-safe, single-column page that steers the skimming eye to the strongest information. Look at the PNG preview (<path>), which is exactly the submitted PDF. Report what the eye lands on in the first six seconds and whether that's right; concrete layout changes ranked by impact (sizes, spacing, emphasis, order, what to bold), within `layout.md`'s constraints; anything unpolished or inconsistent; and whether any section earns its space.

## Merging the findings

- Agreement across seats beats any single strong opinion.
- When seats conflict (one wants a technical bullet kept as proof of skill, another says it's an implementation task), decide by the goal in SKILL.md: true, theirs, chosen for the reader. Seat 6 wins ties about whether a line belongs.
- Seats can be wrong about facts they weren't given. Check before cutting a line a reviewer says is unsupported.
- Log each decision and its reason in the journal, so the hill-climb doesn't undo it.
