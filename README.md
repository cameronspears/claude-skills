# craft

A [Claude Code](https://claude.com/claude-code) skill for designing, building and redesigning web UI to the standard of Apple, Linear, Stripe and Vercel: pages that work without bugs, have nothing a careful eye would circle, and feel magical to use.

It works by judgement, not by ticking rules. `SKILL.md` gives Claude six principles, a house style, and a workflow that makes it actually look at its work: render every state at four widths, use the page by pointer and touch, fix what it finds, then hand the result to fresh reviewers who judge it like a demanding owner and try to break it. Specific mistakes from past runs live in `references/traps.md` as examples, not as the whole list.

## What you get

- **Six principles:** it works; nothing looks off; every state is designed and seen; it's a joy to use; the brand leads; accessible, fast and honest.
- **A house style:** glass over faintly lit backgrounds, film grain on the background only, soft defined corners, buttons that sink into a shadow, springy motion you can grab and flick, and one "wow" moment per page. The brand's own colours, type and logo always come first.
- **Tools** (Node 22+ and Chrome, no installs):
  - `scripts/capture.mjs`: captures every section at each width, scripted interaction states, motion frames and 3x zooms.
  - `scripts/audit.mjs`: checks contrast, focus rings, target sizes, overflow, reduced motion, table alignment, grain placement and more.
  - `scripts/gate.mjs`: checks that the evidence for "done" exists before reporting.
- **References:** tokens, components, motion, a guide to going from "nice" to "wow" drawn from Disney Imagineering, exemplars from great products, reviewer briefs, and the known traps.
- **A specimen** (`assets/specimen.html`) showing the whole style working in light and dark.
- **Evals** (`evals/`): three test cases with graders, in the layout `claude plugin eval` reads.

## Install

As a personal skill, available in every Claude Code session on your machine:

```bash
git clone https://github.com/cameronspears/craft-skill ~/.claude/skills/craft
```

Or for one project, so everyone working on it gets it:

```bash
git clone https://github.com/cameronspears/craft-skill .claude/skills/craft
```

Then ask Claude to redesign, polish or build a page, or type `/craft`.

## Using it

Expect long runs. A full redesign takes Claude one to two hours: it captures hundreds of screenshots, fixes what it finds, and runs up to three review rounds. It ends with a page you can use, not just screenshots, because motion and touch can't be judged from stills.

On a redesign it asks first whether you want a **restyle** (same sections and copy, new look) or an **overhaul** (shorter copy, sections rethought). If nobody can answer, it overhauls persuading pages and restyles working tools.

The scripts open headless Chrome. Run them one at a time on machines with limited memory.

## Credits

The skill paraphrases and adapts ideas from Anthropic's frontend-design skill, Paul Bakaus's Impeccable, Emil Kowalski, Jakub Krehel, Leonxlnx's taste-skill, Dammyjay93's interface-design, Vercel's Web Interface Guidelines, Rauno Freiberg, Apple's Human Interface Guidelines, Josh W. Comeau and others. Full list with licences in `references/review.md` ("Sources and licences"). The code is original.

## Licence

MIT. See `LICENSE`.
