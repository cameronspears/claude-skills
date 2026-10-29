#!/usr/bin/env bash
# Build every format from one content file and check the result.
#
#   scripts/render.sh <content.json> <out-base>
#
# Writes <out-base>.{txt,html,docx,pdf,png} and <out-base>.measure.json, then prints:
#   pages=<n>  bullets_over_2_lines=<n>  orphans=<n>  overflow=<n>  wrapped=<n>
# The PDF is printed by headless Chrome from the HTML, so the PNG preview is exactly what
# gets submitted. Exit code is 0 only when every check passes (one page, all counts zero), else 1.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
content="$1"; base="$2"
mkdir -p "$(dirname "$base")"
abs_base="$(cd "$(dirname "$base")" && pwd)/$(basename "$base")"

# docx dependency, installed once into a cache outside any project.
deps="${XDG_CACHE_HOME:-$HOME/.cache}/resume-hillclimb"
if [ ! -d "$deps/node_modules/docx" ]; then
  mkdir -p "$deps" && npm install --prefix "$deps" docx@9 --silent >/dev/null 2>&1 || echo "warn: could not install docx; .docx output skipped" >&2
fi
export NODE_PATH="$deps/node_modules${NODE_PATH:+:$NODE_PATH}"

node "$here/build_resume.js" "$content" "$abs_base" --text
node "$here/build_resume.js" "$content" "$abs_base" --html
node "$here/build_resume.js" "$content" "$abs_base" --measure
node "$here/build_resume.js" "$content" "$abs_base" --docx 2>/dev/null || echo "warn: .docx not written" >&2

chrome=""
for c in "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "/Applications/Chromium.app/Contents/MacOS/Chromium" "$(command -v google-chrome || true)" "$(command -v chromium || true)" "$(command -v chromium-browser || true)"; do
  if [ -n "$c" ] && [ -x "$c" ]; then chrome="$c"; break; fi
done
if [ -z "$chrome" ]; then echo "error: Chrome or Chromium is needed to print the PDF" >&2; exit 2; fi

"$chrome" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="$abs_base.pdf" "file://$abs_base.html" >/dev/null 2>&1
"$chrome" --headless=new --disable-gpu --virtual-time-budget=3000 --dump-dom "file://$abs_base.measure.html" 2>/dev/null \
  | python3 -c "import sys,re,html;d=sys.stdin.read();m=re.search(r'MEASURE_JSON(.*?)END_MEASURE',d,re.S);print(html.unescape(m.group(1)) if m else '[]')" > "$abs_base.measure.json"
rm -f "$abs_base.measure.html"

# Preview image of page 1 (macOS Quick Look, or poppler when available).
rm -f "$abs_base.png"
if command -v pdftoppm >/dev/null 2>&1; then
  pdftoppm -png -r 110 -f 1 -l 1 -singlefile "$abs_base.pdf" "$abs_base" >/dev/null 2>&1 || true
elif command -v qlmanage >/dev/null 2>&1; then
  ( cd "$(dirname "$abs_base")" && qlmanage -t -s 1400 -o . "$(basename "$abs_base").pdf" >/dev/null 2>&1 & )
  for _ in 1 2 3 4 5 6 7 8 9 10; do [ -f "$abs_base.pdf.png" ] && break; sleep 1; done
  [ -f "$abs_base.pdf.png" ] && mv "$abs_base.pdf.png" "$abs_base.png"
fi

python3 - "$abs_base" <<'PY'
import json, re, sys
base = sys.argv[1]
pdf = open(base + ".pdf", "rb").read()
pages = len(re.findall(rb"/Type\s*/Page[^s]", pdf))
m = json.load(open(base + ".measure.json"))
bul = [x for x in m if x["kind"] == "bullet"]
over2 = [x for x in bul if x["lines"] > 2]
# An orphan is a wrapped line holding only a word or two: under ~15% of the line.
orph = [x for x in m if x["lines"] > 1 and x["lastLineFill"] < 0.15]
overflow = [x for x in m if x.get("overflow")]
# Contact, company descriptor, skills and education lines must each fit on one line;
# the summary gets at most three.
wrapped = [x for x in m if (x["kind"] in ("contact", "org", "skill", "education") and x["lines"] > 1)
           or (x["kind"] == "summary" and x["lines"] > 3)]
print(f"pages={pages}  bullets_over_2_lines={len(over2)}  orphans={len(orph)}  overflow={len(overflow)}  wrapped={len(wrapped)}")
for x in wrapped: print(f"  wrapped ({x['kind']}, {x['lines']} lines): {x['text']}")
for x in over2: print(f"  over 2 lines ({x['lines']}): {x['text']}")
for x in orph: print(f"  orphan ({x['kind']}, last line {int(x['lastLineFill']*100)}% full): {x['text']}")
for x in overflow: print(f"  overflow ({x['kind']}): {x['text']}")
sys.exit(0 if pages == 1 and not (over2 or orph or overflow or wrapped) else 1)
PY
