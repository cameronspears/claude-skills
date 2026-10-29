# claude-skills

[Claude Code](https://claude.com/claude-code) skills I build and use. Each one takes a job I care about, sets a high bar for it, and checks the result against that bar instead of trusting the first draft.

| Skill | What it does |
| --- | --- |
| [**craft**](craft) | Designs, builds and polishes web UI that works without bugs, has nothing a careful eye would circle, and feels like magic to use. Screenshots every state and width, then reviews its own work. |
| [**resume-hillclimb**](resume-hillclimb) | Builds a one-page resume from evidence, then improves it one change at a time. A change stays only if blind judges, playing the people who'd read it, prefer it. |

## Install

Clone once:

```bash
git clone https://github.com/cameronspears/claude-skills ~/claude-skills
```

Then link the skills you want into Claude Code:

```bash
mkdir -p ~/.claude/skills && ln -s ~/claude-skills/craft ~/.claude/skills/craft && ln -s ~/claude-skills/resume-hillclimb ~/.claude/skills/resume-hillclimb
```

Run `git pull` in `~/claude-skills` to update. Each skill's README has its requirements and how to use it.

## License

MIT. See [`LICENSE`](LICENSE).
