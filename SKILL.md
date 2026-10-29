---
name: craft
description: Design, build, redesign or polish any web page, site or app UI (landing pages, tools, dashboards, data tables, settings, forms, modals, pricing, docs) to the standard of Apple, Linear, Stripe and Vercel. The result works without bugs, has nothing a careful eye would circle, and feels like magic, staged the way Disney's Imagineers stage a park: glass over barely tinted light, rich grain on the background, physical motion you can grab and flick, and a real wow moment, with the brand intact and every interaction state designed and seen. Use it whenever someone asks to make a UI look better, premium, polished, cleaner or more professional, to restyle or redesign a page, to fix a design that feels generic or AI-made, to build a new page or component that should look great, or to review a UI's design quality, even if they don't say "design".
---

# Craft

Make interfaces that work perfectly, look right to the most demanding eye, and feel like magic. The bar is Apple, Linear, Stripe and Vercel for craft and Disney's Imagineers for delight: judge the work against what they ship, not against the page you started from, and against what a demanding owner would notice in the first ten seconds.

This skill works by judgement, not by ticking rules. Rules can't list every way a page goes wrong, and an agent that only checks rules stops once they're ticked while the page still has a bug or something that looks off. So the skill gives you a few principles, a house style, a workflow that makes you look properly, and fresh eyes that try to break the result. The specific mistakes past runs made are in `references/traps.md`, as examples of what to look for, not as the whole list.

**This is long work, by design.** A redesign done properly takes hours, many renders and a few review rounds. Done is a matter of evidence on disk, checked by `scripts/gate.mjs`. Don't report until it prints READY.

## What good means

Seven principles, all equally important. Every decision and every review comes back to these; a page that misses any one of them isn't done.

1. **It works.** No bugs. Every control does what it says, at every width, in every state, at the extremes: clicked twice fast, dragged past its end, given no data, given too much. Nothing escapes its container, blocks input or breaks another page. If you changed it, you reloaded it and watched the console.
2. **Nothing looks off.** A careful designer looking at the page finds nothing to circle: things that should line up do (columns under their headings, rows on one centre line, siblings on a shared edge), spacing is consistent, nothing is clipped, wraps badly or sits alone. The first screen reads as a balanced poster. This is judged by looking at full-size captures and zooms, not by reading the CSS.
3. **Every state is designed and seen.** Hover, press, focus, disabled, loading, empty, error, open, long content. A state you haven't rendered and looked at is a state you don't know works.
4. **It's magic, not just nice.** Stage the page the way Imagineers stage a park (`references/magic.md`): walk it in the guest's shoes; give every screen a *wienie*, one luminous thing the eye goes to and the hand wants to touch; compress, then *reveal*; make the waits part of the show; tell one story per section; *plus* every section with one delight nobody asked for; reward the people who look closely; keep the world quietly alive; and never break the spell (*the berm*: one jump, unstyled flash or broken state undoes ten good moments). Every page gets one **wow moment**, about the product itself, that someone would screen-record and send a friend.
5. **It's a joy to touch.** It feels physical and alive: things press, spring, follow your hand and settle; numbers roll; lines draw; glass catches the light. Frequent actions respond instantly and never wait; rare ones get room. Copy is short; nobody reads long-form copy on a product page. Motion is judged by using it, never from stills.
6. **The brand leads, and the product is the hero.** The brand's colour, type, logo and voice stay intact and recognisable at rest. The element that answers the visitor's question gets the most care. Removed ornament is replaced by real substance: data, worked examples, real content.
7. **Accessible, fast and honest.** WCAG 2.2 AA everywhere, reduced motion and reduced transparency respected, no invented proof, nothing heavier than it needs to be.

## House style

The owner's taste, applied unless the brand says otherwise. Values and recipes are in `references/tokens.md`; `assets/specimen.html` shows all of it working.

- **Light, glass and grain.** A ground lit so faintly you feel it rather than see it (brand hue at very low chroma). Heavy film grain on the **background only**, behind every element: text, buttons and glass stay clean. Chrome and floating objects are glass you can see is glass, because something sits visibly behind it.
- **Shape and depth.** Soft, defined corners from one radius family; no pill-shaped buttons, inputs or chips (pills only for switches and slider thumbs). Buttons get depth from a shadow underneath and sink into it when pressed. Flat fills, never recessed wells. A full-width nav bar (or the site's own nav when it's good), never a floating pill.
- **Colour.** The brand accent plus tinted neutrals, used sparingly but never so little that the brand only shows on hover. Status as a dot and a word. Dark-first for tools when the brand leaves it open.
- **Motion and touch.** Springs on things that move, ease-out on light and colour, a velocity spring on anything dragged, rubber-banding inside its container. The joy kit and the touch plan are in `references/motion.md`.
- **Few values.** One radius family, one glass recipe, three text colours, one spacing scale, two springs and one ease. Cohesion is measured by the audit.

## Tools

Scripts in `scripts/` need Node 22+ and Chrome or Chromium (set `CHROME_PATH` if it's elsewhere). No installs. Run one at a time: each opens a headless Chrome.

| Script | What it does |
| --- | --- |
| `capture.mjs <url> --out <dir> --label <name>` | Every section at each width (`--widths 1440,768,375,320`); scripted states, including motion frames (`--states`); 3x zooms of controls at rest, hover, focus and press (`--zoom "<selector>"`); writes `<label>-index.md`. `--setup "<js>"` runs after each load; `--scheme dark` per theme. |
| `audit.mjs <url> --json <file>` | Mechanical checks: contrast against real backgrounds, a Tab walk for focus rings, target sizes, small text, sideways overflow, reduced motion, unnamed controls, table alignment, grain above content, pill-shaped controls, recessed wells, tabular numbers and cohesion budgets. Exit code 1 on any FAIL. It catches what's measurable; it can't tell you the page is good. |
| `gate.mjs <workdir>` | Checks the evidence for done and prints READY or what's missing. |

Mark deliberate value scales with `data-scale` and third-party widgets you can't restyle with `data-craft-ignore`.

## Workflow

Keep a work folder: the session's scratch directory if you have one, otherwise `.craft/` in the project (add it to `.git/info/exclude`).

```
<work>/
  brief.md        brand facts, direction card, inventory, blast radius
  states.json     the interaction states to capture
  ledger.md       every finding and what happened to it
  next-mile.md    the last pass
  shots/          before-*, after-*, round-N-* captures and their index files
  audit-before.json, audit-after.json
  reviews/        round-1.md, round-2.md, ...
```

### 1. Look

Before touching anything, render the page (`capture.mjs --label before` at four widths, `audit.mjs --json audit-before.json`) and open every capture. In `brief.md`, write what's wrong section by section; **inventory** every component, colour use and interactive element; list every **state** each control and data view can be in, scripting the interactive ones in `states.json` and adding a temporary flag or route for states the live page can't reach (remove it at the end); and list the **blast radius**: every other page that shares a file, class, token or component you'll touch.

### 2. Decide

- **Restyle or overhaul?** On a redesign, ask the owner before planning, and wait. *Restyle* keeps the sections, order, copy and elements and brings them into the system. *Overhaul* rethinks the page: short copy, sections cut or merged, each section's form chosen fresh (a list of steps can become a stage you swipe), the visitor's path reordered, with the product's data, functions and facts kept. Owners often want more overhaul than they ask for. If nobody can answer, overhaul the persuading and reading surfaces and restyle working tools, and say so in the report.
- **Brand facts.** The logo, the colours on buttons and links, theme variables, typefaces, light or dark default, with exact values in `brief.md`. Ask when unclear; if nobody can answer, keep every brand value and list the open questions. Reread the brand files before calling something open.
- **Direction card**, short and specific: the **mode** of each surface (*Operate*: a tool in use, precise and fast; *Persuade*: deciding, room for the wow moment; *Read*: learning, measure and rhythm); the **one question** each surface answers and the element that answers it; a **thesis** a competitor couldn't reuse; the **signature** element and the **wow moment** (read `references/magic.md` first, and plan the moment before anything else: it shapes the page, it isn't a garnish added at the end); a **joy kit** of 5–8 named moments with triggers and timings; the **light and glass plan**; the **touch plan**; and three defaults you're rejecting, as "default → instead".

### 3. Plan and build

Map every inventoried component to a surface (`references/components.md`); anything that maps to nothing gets cut or merged. Plan the rhythm (section order, alternating the two large spacing steps with one deliberate pause, one left edge). Plan the copy short: a restyle cuts explanatory text by about a third; an overhaul keeps headlines under 8 words, supporting lines under 20, about 40 words of prose per section and no paragraph over two sentences. Plan each section's form and its **plus**: ask what form would make the idea a joy (a list of steps can become a stage you swipe, free-versus-paid a comparison that draws itself) and what one delight would make someone smile there. Size the cost on a real product (requests, client JS, anything per request). Then build in this order, so each layer inherits from the one before:

1. Tokens, light field, glass and grain into the site's theme layer, with the brand mapped in; then hunt every hard-coded colour, radius and shadow. A light panel inside a dark page, or the reverse, is the worst failure.
2. Browser surfaces: `color-scheme`, `theme-color`, `::selection`, `caret-color`, scrollbar colours, `tabular-nums`.
3. The product surface first and most carefully, then everything else in page order.
4. Every state of every control and data view.
5. Motion, touch and the wow moment, with reduced-motion and reduced-transparency fallbacks.
6. Shared changes scoped so the blast-radius pages only change on purpose.

Reload after every meaningful change and read the console and server log. A page that throws is the worst result.

### 4. Use it, then look at it

- **Use it.** With a pointer at 1440 and by touch emulation at 375: press every kind of control, toggle things twice fast, drag everything to both ends and flick it, trigger the wow moment twice, empty the data, overfill it, shrink to 320. Anything that breaks or escapes goes in the ledger.
- **Capture** `--label after` at four widths and every theme, with your states, motion frames for the wow moment, a press, a toggle and a drag release, and 3x zooms of one of each kind of control.
- **First screen first.** The top 900px at 1440 and 812px at 375, as a poster: one focal point, the headline, line and action as one group, balanced, the brand visible. Fix this before polishing details.
- **Look like the owner will.** Open every capture at full size. Ask of each: what would a demanding owner circle in ten seconds? Misaligned columns, rows off their line, uneven padding, clipped rings, grain on text, glass that reads as a grey card, a bland section, a state that looks like another. Then read `references/traps.md` and the starred items in `references/details.md`, and search the code and captures for each pattern.
- **The wow test** (`references/magic.md`). Name the wow moment and use it twice: would someone really show a friend? Name each section's plus. Walk the page on a phone as a first-time guest and mark where you got bored: that's where the next moment goes. Find every berm break. If the honest answer is "nice", you're not done.
- **Audit** each theme. Fix every FAIL or decline it in the ledger with a reason; look at every WARN.
- Render every blast-radius page before and after, and compare.

Everything you find goes in `ledger.md` and gets fixed, then re-captured.

### 5. Fresh eyes, in rounds

You can't see your own mistakes; a reviewer who hasn't seen your reasoning can. Round 1 uses two fresh subagents with the briefs in `references/review.md`: a **demanding owner** who looks at the captures and the live page the way the person paying for this would, and a **breaker** who uses the live page until something fails. Rounds 2 and 3 use one fresh **verifier** that checks each previous finding from new captures only (your account of a fix isn't evidence) and looks for anything new. Save each report to `reviews/round-N.md`, put every finding in the ledger, and stop when a round says *ship* with nothing high or medium open. Never more than three rounds. Without a subagent tool, do the review yourself from the captures alone and say so.

Ledger lines:

```
- [x] F7 high: ticks sit 90px left of their headings. Fixed: inline-block svg. Evidence: shots/round-2-1440-s05.png
- [~] F9 low: header nav underline is a second blue. Declined: the header is shared site-wide; raised with the owner.
- [ ] F12 medium: empty Favorites state not designed.
```

`[ ]` open, `[x]` fixed with evidence, `[~]` declined with a reason. The gate fails while anything is open.

### 6. The next mile

When the rest passes, look once more as the most demanding designer you know. Write `next-mile.md` with at least ten specific things that would make it better, from a spacing step to a stronger wow moment. Do every one that's in scope and cheap; mark the rest with why not. This pass is where good becomes stellar.

### 7. Report

When `gate.mjs` prints READY, give the owner a page they can use (a dev URL, a preview or a published artifact), because motion and touch can't be judged from screenshots. Report what changed per section, what was cut, the brand values kept, open questions, audit counts before and after, the review verdicts, and what you declined and why.

## Definition of done

`gate.mjs` checks: `brief.md` with brand facts, the direction card, inventory and blast radius; before and after captures at four widths with states, zooms and motion frames; an audit with no undeclared FAIL; at least two review rounds ending in *ship*; no open ledger items; a next mile of ten or more, none open.

Only you can confirm the rest, against the seven principles: it works, nothing looks off, every state was seen, it's magic (someone would say "wow", and you can name the moment), it's a joy to touch, the brand leads, it's accessible. Also: every section was brought into the system with nothing from the old one left visible, the product surface is the most carefully made thing on the page, and one theme shows at a time with every theme the site offers working. If any of those is in doubt, you're not done.

## References

- `references/traps.md`: specific mistakes past runs made, by principle. Read before looking at your captures and before the next mile.
- `references/magic.md`: **read it before the direction card and again before the next mile.** From nice to wow: Disney Imagineering's rules for a page, the wow moves products known for magic make, making glass visible, and the wow test.
- `references/tokens.md`: surfaces and values at a glance, then the token CSS for light and dark, mapping a brand into it, glass and the grain.
- `references/components.md`: recipes and full state specs for buttons, inputs, segmented controls, tables, featured results, menus, toasts, empty states and more.
- `references/motion.md`: the motion system, exact values, the frequency rule, touch, the joy kit.
- `references/details.md`: the finishing checklist, the most-missed items starred.
- `references/exemplars.md`: observable details from Linear, Stripe, Vercel, Apple, Raycast, Things, Family and others.
- `references/review.md`: reviewer briefs, the rubric and verdicts.
- `assets/specimen.html`: the whole house style working in light and dark. Open it in a browser to see the bar, and copy from it.
