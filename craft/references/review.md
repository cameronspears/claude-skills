# Review

Reviewers find what the builder can't see. They must be fresh: a subagent that has never seen your reasoning, given only the captures, the live URL (if it can reach one), the brief and the bar. Hand them evidence, not your conclusions; an agent handed your hypothesis tends to confirm it.

Round 1: run the demanding owner and the breaker in parallel. Rounds 2 and 3: one fresh **verifier**. Never more than three rounds. Save each round's reports to `reviews/round-N.md` (the verdict line first).

## The rubric

Score each 1–10. Be stingy: most competent pages score 5–7. A 9 means a design lead at Linear or Apple would ship it untouched.

| Dimension | What a 9 looks like |
| --- | --- |
| **Brand fidelity** | The brand's colour, type, logo and voice are intact and feel at home in the system. |
| **Cohesion** | One radius family, one glass recipe, three text colours, the motion tokens; every element on one surface (ground, glass, fill); nothing from the old system visible. |
| **Light and material** | Glass reads as glass (light behind it, the rim, the blur), the light is barely tinted, the grain is rich and visible on the background only, never on text, buttons or glass, buttons have depth from below, corners are soft, no recessed wells, the accent used sparingly and the brand recognisable at rest. |
| **First screen** | At 1440 and 375 the first screen works as a poster: one focal point, headline, line and action grouped, balanced, the brand present. |
| **Hierarchy** | Each surface answers its one question with its largest, most careful element; the eye knows where to go, even with the capture blurred (the squint test); copy says one thing per section. |
| **Finish** | Shared edges, consistent padding, icons on the text centre, real punctuation, tabular numbers, no one-word lines, every zoom clean. |
| **States** | Every control and data view has designed hover, press, focus, disabled, loading, empty and error states, and they were captured. |
| **Joy and touch** | It feels magical and physical to use: buttons sink under the pointer and spring back, what can be grabbed follows the hand and settles with its flick, objects spring and settle, numbers roll, a signature moment someone would screen-record, a small celebration on a meaningful action; nothing that blocks or annoys the tenth time. Judged by using the live page and reading motion frames, never from stills. A page whose only motion is a fade scores at most 4. |
| **Substance** | Nothing thin: removed ornament replaced by real data, worked examples, full content and confident scale. |

**Caps** (they override the arithmetic):
- Any text below WCAG AA contrast, or a focus ring missing or clipped: overall at most 6.
- A light panel in a dark page (or the reverse), or the brand changed without the owner's say-so: verdict *rebuild*.
- States not captured: *States* at most 4, whatever the resting page looks like.
- Text on glass below AA over the bright part of the light field: overall at most 6.
- Recessed wells, filled status pills or a second accent hue left in: *Light and material* at most 5.
- A floating pill nav (unless it was the site's own), a light field you'd describe by its colour, or top-edge highlights on buttons: *Light and material* at most 6.
- No moment on the page you'd screen-record and send a friend: *Joy and touch* at most 6, and a Persuade page can't get *ship*. Name the moment, or say there isn't one.
- Grain visible on text, buttons or glass (it belongs to the background only): *Light and material* at most 5.
- Glass you could swap for a grey fill without anyone noticing: *Light and material* at most 6.
- Pill-shaped buttons, inputs or chips: *Cohesion* at most 6.
- A column's content visibly off its heading, or a row's cells off one centre line: *Finish* at most 5.
- Restyle where the brief says overhaul (old sections, long copy and plain lists left in): *Substance* at most 5.
- *Joy and touch* scored without using the live page or reading motion frames: say so and cap it at 5 until someone has.
- If your first instinct is 9 or 10, rescore as the juror who didn't build it and has seen Linear this morning.

## Verdicts

- **ship**: no high or medium findings. Polish suggestions may remain.
- **fix**: at most 8 fixes, ordered by impact, each with the capture that shows it and a concrete change.
- **rebuild**: the direction is wrong (wrong brand, wrong surface model, the product isn't the hero). Say what direction instead.
- **recapture**: the evidence is missing or unusable (states not captured, wrong widths). Say what to capture.

Each report also names one thing to **keep**: the best decision on the page, so later fixes don't break it.

## Brief: the demanding owner (round 1)

```
You are the owner of this product seeing the redesign for the first time. Your bar is Apple, Linear,
Stripe and Vercel, and you notice everything. You have not seen how it was built and you don't care
how hard it was. Do not edit files.

Evidence:
- The live page, if you can reach it: <url>. Use it, don't just look at it.
- Captures (open every file listed, at full size): <work>/shots/after-index.md, and before-index.md to compare.
- What the page is for and the brand facts: <work>/brief.md (read the brand facts and the one question
  each surface answers; ignore the builder's opinion of their own work).
- The bar: <path-to-skill>/SKILL.md sections "What good means" and "House style", and
  <path-to-skill>/assets/specimen.html in a browser if you can.

1. The first ten seconds. Look at the first screen at 1440 and at 375 as if you'd just opened it. Write
   down everything you'd circle before reading anything else: anything misaligned, off its column or row
   line, unevenly spaced, clipped, cramped, bland, ugly, confusing, or not like the brand. Trust your
   eye; you don't need a rule to call something wrong.
2. The rest of the page. Every section, every capture, every zoom, the same way.
3. Use it, and ask the question that matters as much as any bug: is this magic, or merely nice? Read
   <path-to-skill>/references/magic.md. Name the moment you'd screen-record and send a friend, or say
   plainly there isn't one. Name each section's plus, or say it has none. Where did you get bored? What
   broke the spell? Press, toggle, drag, flick, hover, tab through.
4. Only then, read <path-to-skill>/references/traps.md and check whether any of those traps are on the
   page.

Score the rubric in <path-to-skill>/references/review.md, apply its caps, give a verdict (ship, fix,
rebuild, recapture). List findings most important first, each with severity (high/medium/low), the
capture or place that shows it, what's wrong and the fix. End with one "keep" line: the best decision on
the page. First line of your report: "Verdict: <word>". Under 600 words.
```

## Brief: the breaker (round 1)

```
Your job is to break this web UI and to find anything a user would trip over. Be adversarial. Do not
edit files; you may run read-only commands and drive the live page.

Evidence: live page <url>; captures <work>/shots/after-index.md; the code (the files in <work>/brief.md
or the git diff); the audit <work>/audit-after.json; the tools in <path-to-skill>/scripts/.

Use the page until something fails. Every control: hover, press, release outside it, focus by keyboard,
activate twice fast. Every draggable thing: drag to both ends and past them, flick it, grab it
mid-animation. Every data view: no data, one item, far too much, long words. Every width: 1440, 768,
375, 320. Reduced motion and reduced transparency. Open the console and watch for errors. Measure
alignment rather than eyeballing it (getBoundingClientRect): columns under their headings, rows on one
centre line. Check contrast on every surface, focus rings present and unclipped, touch targets, keyboard
paths through menus, tabs and dialogs, and the blast-radius pages in brief.md.

Return findings, most important first: severity, where (file:line or capture), what failed, the fix.
Say what you tried that held up. First line: "Verdict: <ship|fix>". Under 600 words.
```

## Brief: verifier (rounds 2 and 3)

```
You verify fixes to a web UI with fresh eyes. Be adversarial; do not edit files. This is round <N>.
The previous findings are in <work>/reviews/round-<N-1>.md and <work>/ledger.md. New captures:
<work>/shots/round-<N>-index.md. Live page, if you can reach it: <url>. The rubric:
<path-to-skill>/references/review.md.

1. For each previous high and medium finding, mark it resolved, partial or unresolved, judged ONLY from
   the new captures or the live page. The builder's description is not evidence.
2. Then look at the page as its owner would for the first time: what would they circle in ten seconds?
   Fixes often break something nearby, at another width or in another state. Use the live page too.
3. Re-score the rubric and give a verdict (ship, fix). First line: "Verdict: <word>".
List any new findings with severity, capture, problem and fix. Under 500 words.
```

## If you can't run subagents

Do the review yourself as a separate pass: close the code, open only the captures, read the rubric, and score as if someone else built it. Say in your report that the review wasn't independent.

## Sources and licences

The skill paraphrases and adapts ideas and values from these. Code samples are original.

- Anthropic, frontend-design skill (Apache 2.0): plan-then-critique, the AI-look list, "spend boldness in one place".
- Paul Bakaus, Impeccable (Apache 2.0): surface modes, the direction contract, fresh-context finish review with ship/fix verdicts, browser surfaces, motion ranges.
- Emil Kowalski, skills and essays (MIT): easing values, press and entry scales, origin-aware popovers, the frequency rule, Sonner's details.
- Jakub Krehel, skills (MIT): the "before you finish" table, concentric radii, exact values over ranges, the state workbench.
- Leonxlnx, taste-skill (MIT): measure-in-a-browser gates, the fill rule (restraint needs substance), capped scoring, rescoring as an outsider.
- Dammyjay93, interface-design (MIT): rejected defaults, the signature test.
- Vercel, Web Interface Guidelines (MIT) and Geist; Rauno Freiberg, interfaces and interaction-design essays; Apple Human Interface Guidelines; Josh W. Comeau on shadows and `linear()`; Linear's redesign posts; Stripe on accessible colour; Radix tooltip timing; Every Layout; Utopia; NN/g; WCAG 2.2.
