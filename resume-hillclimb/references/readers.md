# Readers: the blind judges

## Personas

Tailor each to the run's target roles. Write the tailored set into the journal in round 0 and keep it fixed for the run, so verdicts stay comparable.

**Climbing readers** (rotate across rounds):
- **R1, the 6-second skimmer.** The hiring manager for the variant's target role, scanning the PNG for six seconds before deciding whether to read on. Judges: does the right story land at a glance?
- **R2, the 60-second reader.** The same hiring manager, reading the text properly for a minute. Judges: is it convincing, specific and free of padding?
- **R3, the recruiter screen.** A technical recruiter matching the page to a job description for the target role. Judges: is it obvious the candidate fits, and does the page use the role's language?
- **R4, the skeptical interviewer.** Preparing questions to test the candidate's claims. Judges: which version has fewer claims that would crack under a follow-up question, and more that invite a strong story?

**Held-out readers** (never used to choose a change, only at checkpoints):
- **H1, a hiring manager at a different company** hiring for the same role family, with a different emphasis (a smaller startup instead of a scale-up, or the reverse).
- **H2, a non-specialist executive** (a CEO or VP outside the candidate's field) reading the shortlist. Judges: can someone outside the specialty tell why this person is strong?

## Keeping judges blind

Blindness is the whole point of a judge, and it leaks easily:
- **Neutral copies.** Copy the two versions into a fresh temporary folder as `A.png`/`B.png` (skim) or paste the text inline (read). Paths like `best/` or `rounds/7/` tell the judge which one is new.
- **No tools beyond looking.** A judge that runs `diff` is testing tool use, not judgment. For text judging, paste both versions in the prompt and say not to use tools. For skim judging, allow only reading the two image files.
- **Random order.** Flip a coin for which version is A in the first run, then swap for the second. Position bias is real and strong: in testing, most split decisions went to whichever version was labelled A. Tell judges the labels are random, and treat a split (one run each way) as a tie, never as half a win.
- **A smaller model is fine.** Each verdict is one word and one sentence. Run judges on a lighter model (for example `model: "sonnet"` on the Agent tool) to cut cost several-fold. Keep the first-draft panel on the default model, where depth matters.

## Judge prompts

**Skim (R1, and any persona in a 6-second scenario):**

> You are <persona>. The target role: <role and company type>. You have about six seconds with each page, the way you'd skim a stack of resumes. Read the two images <A.png path> and <B.png path> once each, using only the Read tool, and don't compare them line by line. Identical pages should be a tie.
> Which candidate would you be more likely to read further, and why? If neither stands out, say tie.
> VERDICT: A | B | tie
> REASON: one sentence naming what caught your eye.

**Read (R2 to R4):** paste both texts inline, or, cheaper for you, copy them to a fresh folder as `A.txt` and `B.txt` and let the judge read only those two files.

> You are <persona>. The target role: <role and company type>. Below are two versions of the same candidate's resume, A and B. The A/B labels were assigned at random and carry no meaning. Read both properly, about a minute each. Don't use any tools (or: read only these two files with the Read tool). Identical versions should be a tie, and small differences may matter, but don't invent a preference.
> Which version makes you more likely to move this candidate forward, judged as <persona> on: the strength and relevance of the work, how quickly the right story comes across, credibility, and clarity?
> VERDICT: A | B | tie
> REASON: one sentence naming the specific line that decided it.
> --- A ---
> <text>
> --- B ---
> <text>

Then run it again in a new subagent with the order swapped.

**Rank (slot tournaments):** the folder holds `context.txt` (the whole current page) and `options.txt` (the options for one slot, the current line among them, numbered at random).

> You are <persona>. The target role: <role and company type>. Read only context.txt and options.txt with the Read tool and use no other tools. Option numbers are random and carry no meaning. Rank every option from most to least likely to make you move this candidate forward, judging the line in the context of the whole page: strength and relevance to this role, credibility, and clarity. Options that are equally good may tie.
> RANKING: <option numbers, best first, e.g. 3 > 1 = 2>
> REASON: one sentence on what made the top option win.

Run two rankers with different personas and different shuffles. Decode with the key `slot.py` writes. An option advances only if both put it first and above the current line.


**Win rule:** the candidate change wins if preferred in both runs, or preferred once and tied once. Anything else is a loss or a tie, so revert.

## Calibration (round 0)

Use the real judge prompts, with tools restricted as above, so calibration tests judgment rather than file comparison. Give each prompt (skim and read) the same version as both A and B, three times. If it picks a side in more than one of three, the rubric is too loose: make it name the deciding line, and re-check.

## Reading the reasons

- If a judge's reason names something that isn't on the page, or doesn't match the actual change, distrust the verdict and re-run.
- If wins keep citing one surface feature (bold numbers, a buzzword) rather than substance, the judges are being gamed by that feature. Check the held-out readers early.
- A win that looks bigger than the change could explain deserves a look before keeping.
