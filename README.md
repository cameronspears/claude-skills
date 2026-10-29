# resume-hillclimb

A [Claude Code](https://claude.com/claude-code) skill that builds a one-page resume from evidence, then improves it in measured rounds. A change stays only if blind judges, playing the people who'd read your resume, prefer it.

Most AI resume help polishes what you already wrote. This skill starts by finding what you actually did, and it won't put a claim on the page that it can't trace to a source or to you.

## How it works

1. **Evidence first.** It reads your old resume, docs, repos and anything else you point it at, and writes a ledger: one entry per fact, with its source and whether you've confirmed it. Then it asks you the questions the sources can't answer, in one batch.
2. **A first draft, reviewed hard.** It drafts one page per target role. Seven reviewers critique it, including one that asks of every line "so what, and is it really yours?" You confirm every bullet before the climb starts.
3. **Hard gates.** Every version is printed to PDF by Chrome and measured: one page, no bullet over two lines, no one-word last lines, no wrapped header lines. A linter blocks excluded names, buzzwords, em dashes and any bullet that doesn't point to a fact in the ledger. Fail a gate and the change is gone, whatever the judges think.
4. **Blind judges.** Each change is judged by reader personas (a hiring manager skimming for six seconds, the same manager reading for a minute, a recruiter, a skeptical interviewer). They see two neutral files labelled A and B, never which one is new, and judge twice with the labels swapped. A change wins only if it's preferred both times, or once with a tie.
5. **Slot tournaments.** When word-by-word polish stops paying, it writes several rewrites of a weak line and has two judges rank them in context, each seeing a different shuffled order. The winners are then confirmed in pairs.
6. **Held-out readers.** Two personas never pick a change. Every few kept changes they compare the current best against the starting draft. If they disagree with the climbing judges, the climb is overfitting and the skill stops to fix its rubric.
7. **Escapes.** When it gets stuck, it diagnoses why (wrong target, thin evidence, structure, the judges) and can make bigger structural moves instead of more polishing.

It saves its state after every round, so a long run can stop and resume. It ends by delivering a PDF and DOCX of each version and a short list of things only you can confirm.

## Requirements

- Claude Code, with subagents available
- Node.js 18 or later (the DOCX builder installs one npm package into `~/.cache`)
- Python 3
- Google Chrome or Chromium (for the PDF and layout measurement)
- macOS or Linux. On Linux, install `pdftoppm` (poppler-utils) for the page previews the skim judges look at.
- Web access, if you want it to tailor for a named company

## Install

```bash
git clone https://github.com/cameronspears/resume-hillclimb.git
```

```bash
mkdir -p ~/.claude/skills && cp -R resume-hillclimb/resume-hillclimb ~/.claude/skills/
```

## Use

From a folder that holds your old resume and any notes:

```
/resume-hillclimb 1
```

The number is the time budget in hours. Runs live in `resume-hillclimb/<date-slug>/` inside that folder: the ledger, every round, the judges' verdicts and a journal of what was tried and why. Run `/resume-hillclimb` again to resume.

To tailor for one company, name it. The skill reads the company's posting and public hiring pages, mines your evidence against what they ask for, and judges with that company's readers. It uses one of its executives as a held-out reader.

## Cost

Each judge verdict costs roughly 70K tokens, mostly fixed overhead. A one-hour run with tournaments and checkpoints can use several million tokens. The skill tells you the budget at the start and stops early when the climb flattens out.

## Your data

Everything stays in the run folder on your machine, apart from what Claude Code sends to the model. Run folders hold personal details, so keep them out of any public repo.

## What's in the box

- `SKILL.md`: the workflow
- `references/`: the bullet gate, evidence interview, review panel, reader personas and judge prompts, layout rules
- `scripts/build_resume.js`, `render.sh`: build TXT, HTML, PDF, DOCX and PNG from one JSON file, and measure the layout
- `scripts/lint_resume.py`: the wording and evidence gates
- `scripts/slot.py`: slot tournaments and blind A/B folders
- `assets/`: an example resume, ledger and constraints for a made-up candidate

## License

MIT
