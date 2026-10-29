#!/usr/bin/env python3
"""Deterministic content gates for a resume content file.

    python3 scripts/lint_resume.py <content.json> [--constraints constraints.json] [--ledger ledger.json]

GATE lines fail the run (exit 1). WARN lines are for the writer to weigh.
These catch the mechanical problems that adversarial reviewers kept finding by hand,
so the judges can spend their attention on substance.

constraints.json (all optional):
  {"exclude": ["Acme Corp", "Project X"],          # confidential or off-limits terms (GATE)
   "vanity": ["commits", "pull requests", "tests"],# counts that read as padding (WARN)
   "banned": ["ninja"],                             # extra banned words (GATE)
   "max_bold_per_role": 1, "max_bullets_per_role": 7}
ledger.json: {"E1": {...}, "E2": {...}} or [{"id": "E1", ...}]
"""
import json, re, sys

BANNED = [
    "spearheaded", "leveraged", "leveraging", "synergy", "synergies", "passionate", "results-driven",
    "robust", "seamless", "seamlessly", "cutting-edge", "world-class", "best-in-class", "dynamic",
    "innovative", "utilize", "utilized", "utilizing", "go-getter", "rockstar", "ninja", "guru",
    "thought leader", "detail-oriented", "team player", "proven track record", "responsible for",
    "various", "plethora", "myriad", "delve", "tapestry", "landscape", "game-changer", "game-changing",
]
WEAK_OPENERS = ["responsible", "helped", "worked", "assisted", "participated", "involved", "tasked",
                "the ", "a ", "an ", "successfully"]


def args():
    a = sys.argv[1:]
    if not a:
        print(__doc__); sys.exit(2)
    opts = {"content": a[0], "constraints": None, "ledger": None}
    for flag in ("--constraints", "--ledger"):
        if flag in a:
            opts[flag[2:]] = a[a.index(flag) + 1]
    return opts


def main():
    o = args()
    R = json.load(open(o["content"]))
    C = json.load(open(o["constraints"])) if o["constraints"] else {}
    ledger_ids = None
    if o["ledger"]:
        L = json.load(open(o["ledger"]))
        ledger_ids = set(L.keys()) if isinstance(L, dict) else {x["id"] for x in L}
    banned = BANNED + [w.lower() for w in C.get("banned", [])]
    exclude = C.get("exclude", [])
    vanity = [w.lower() for w in C.get("vanity", [])]
    max_bold = C.get("max_bold_per_role", 1)
    max_bullets = C.get("max_bullets_per_role", 7)

    gates, warns = [], []
    everything = json.dumps(R, ensure_ascii=False)
    for term in exclude:
        if re.search(re.escape(term), everything, re.I):
            gates.append(f"excluded term on the page: {term!r}")

    def check_prose(where, text):
        low = text.lower()
        for w in banned:
            if re.search(r"(?<![a-z])" + re.escape(w) + r"(?![a-z])", low):
                gates.append(f"{where}: banned word {w!r}")
        if "—" in text:
            gates.append(f"{where}: em dash (rewrite as two sentences or a comma)")
        if re.search(r"\bnot\b[^.;]{0,50}\bbut\b", low) or re.search(r", not (just |only )?\w+", low):
            gates.append(f"{where}: 'not X but Y' construction")
        for w in vanity:
            if re.search(r"(?<![a-z])" + re.escape(w) + r"(?![a-z])", low):
                warns.append(f"{where}: vanity count {w!r}")

    check_prose("summary", R.get("summary", ""))
    for where, text in [("headline", R.get("headline", ""))] + \
            [(f"{e['org']} descriptor", e.get("desc", "")) for s in R.get("sections", []) for e in s["entries"]] + \
            [(f"skills {k.get('label', '')}", k.get("items", "")) for k in R.get("skills", [])] + \
            [("education", x) for x in R.get("education", [])]:
        if "\u2014" in text:
            gates.append(f"{where}: em dash (rewrite as two sentences or a comma)")
    if len(R.get("summary", "").split()) > 60:
        warns.append(f"summary: {len(R['summary'].split())} words (aim for 2-3 lines, about 40-55 words)")
    if len(R.get("headline", "")) > 70:
        warns.append("headline: over 70 characters")

    for s in R.get("sections", []):
        for e in s["entries"]:
            for r in e["roles"]:
                where_role = f"{e['org']} / {r['title']}"
                bullets = r["bullets"]
                if len(bullets) > max_bullets:
                    warns.append(f"{where_role}: {len(bullets)} bullets (readers stop after about {max_bullets})")
                bold = sum(len(re.findall(r"\*\*[^*]+\*\*", b if isinstance(b, str) else b["text"])) for b in bullets)
                if bold > max_bold:
                    gates.append(f"{where_role}: {bold} bold phrases (max {max_bold}; bold stops working when it's everywhere)")
                for i, b in enumerate(bullets, 1):
                    text = b if isinstance(b, str) else b["text"]
                    plain = text.replace("**", "")
                    where = f"{where_role} #{i}"
                    check_prose(where, plain)
                    low = plain.lower()
                    if any(low.startswith(w) for w in WEAK_OPENERS):
                        warns.append(f"{where}: weak opener ({plain.split()[0]!r}); lead with the result or a strong verb")
                    if re.search(r":[^:]*,[^,]*,", plain):
                        gates.append(f"{where}: colon then a list (reads generated; write it as a sentence)")
                    elif ":" in plain:
                        warns.append(f"{where}: colon in a bullet")
                    nums = re.findall(r"\d[\d,.]*", plain)
                    if len(nums) > 2:
                        warns.append(f"{where}: {len(nums)} numbers (one or two land; more blur)")
                    unquoted = re.sub(r"\"[^\"]*\"", "", plain)
                    if re.search(r"(?<![\w-])(I|me|my|My|we|We|our|Our|us)(?![\w-])", unquoted):
                        warns.append(f"{where}: first person in a bullet")
                    if plain.count(";") > 0:
                        warns.append(f"{where}: semicolon (usually two ideas in one bullet)")
                    ev = [] if isinstance(b, str) else b.get("evidence", [])
                    if not ev:
                        (gates if ledger_ids is not None else warns).append(f"{where}: no evidence ids")
                    elif ledger_ids is not None:
                        missing = [x for x in ev if x not in ledger_ids]
                        if missing:
                            gates.append(f"{where}: evidence ids not in ledger {missing}")
                    if not isinstance(b, str) and b.get("candidate_ok") is False:
                        warns.append(f"{where}: candidate has not confirmed this bullet")

    for g in gates: print("GATE", g)
    for w in warns: print("WARN", w)
    print(f"\n{len(gates)} gate failures, {len(warns)} warnings")
    sys.exit(1 if gates else 0)


if __name__ == "__main__":
    main()
