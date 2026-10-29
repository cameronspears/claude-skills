# Evidence: gathering it, recording it, asking for it

## Why first

The usual resume process rewrites what the candidate already said. Their old resume is the best sample of their voice, but a poor index of what they did: people forget their best work, undersell it, or describe duties instead of outcomes. The strongest lines in a good resume almost always come from a source the candidate didn't think to mention (a repo's history, a launch doc, a postmortem) or from a direct question.

## Sources to look for

- the old resume and LinkedIn: voice, titles, dates, and claims the candidate already stands behind
- accomplishment summaries, performance reviews, award write-ups, promotion docs
- project repositories: git history, PRs and their descriptions, READMEs, docs, research folders, test suites
- published work: product changelogs, blog posts, talks, public sites
- memory notes and past conversations with the candidate
- job postings for the target roles: what readers will scan for

## Investigator brief (for large sources)

Send one subagent per large source, in parallel. Each gets a brief like this, filled in:

> Goal: build the evidence file for <name>'s job search (<target roles>). Read <source paths>. READ-ONLY: don't edit, run or publish anything; never print secrets, emails or customer names.
> Return verified facts only, each with its source (file path, PR number, commit, page): scale (users, customers, money, volume), what they built and why it was hard, decisions and the evidence behind them, measured results (before and after, with dates), incidents they handled, and how they worked. Flag anything uncertain, modeled or estimated. Then rank the 10 most resume-worthy facts, each in one plain, factual line.

Ask for facts, not resume lines. Resume lines written by investigators anchor on what sounds good rather than what's true and best for the reader.

## Ledger format (`ledger.json`)

```json
{
  "E1": {"fact": "Dispute win rate rose from 38% to 51% after evidence templates launched",
         "number": "38% -> 51%", "source": "candidate's original resume",
         "confidence": "candidate-stated", "candidate_ok": true, "public": true},
  "E2": {"fact": "Fraud model retrained weekly instead of quarterly after the pipeline rebuild",
         "number": "quarterly -> weekly", "source": "repo: PR #212 (2025-10-08)",
         "confidence": "verified", "candidate_ok": true, "public": true}
}
```

- `confidence`: verified (seen in a source), candidate-stated, modeled (backtest or projection, which must be labelled on the page), or uncertain.
- `public: false` for anything confidential or excluded. The linter's `exclude` list should cover the words that would leak it.

## Questions for the candidate

Batch the ones the sources can't answer into one message, and say rough numbers are fine. Skip what you already know.

**Scope and scale**
- How many customers or users does the product serve? What kinds of companies (industries, size)?
- Who did you work with: how many engineers, designers, other teams? Who did you report to?
- What did you own outright, and what did you influence?

**Outcomes**
- For your top three projects: what was the problem, what did you decide, and what changed afterwards? Any numbers, even rough (time saved, tickets reduced, adoption, revenue, retention)?
- Which of your features or reports do people use most? How do you know?
- What would break, or get worse, if you left?

**Judgment**
- How did you decide something was ready to ship? Especially for AI features: what did you test it on, what bar did it have to clear, how does it behave when it's wrong, and what did it cost to run?
- What's something you killed or said no to, and why?
- What did you get wrong, and what did you change because of it?

**Recognition and path**
- Awards, promotions, and what they were for? Exact names and dates if you have them.
- Your title history at each company, as HR would record it?

**Boundaries**
- Anything confidential, such as customer names, unreleased work, or internal tools?
- Anything you don't want featured, even if it's impressive?
- Any side projects that could look like competition with your current employer?
- Which roles are you targeting, and what's your remote and pay floor?

**Voice**
- What are you proudest of that isn't written down anywhere?
- How would a colleague describe what you're good at?

## Constraints file

Record the boundaries in `constraints.json` for the linter (`exclude`, `vanity`, `banned`) and in the journal for the judgment calls a script can't make (for example "keep the reorg project off the page" or "no customer logos, even well-known ones").
