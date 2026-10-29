#!/usr/bin/env python3
"""Slot tournaments for the hill-climb. Run from the run folder.

  slot.py build <base.json> <round> <spec.json>
      spec: {"slots": [{"id": "b3", "where": "<bullet prefix>" | "summary" | "headline",
                        "label": "the third bullet of the side project",
                        "options": ["text", ...]}]}
      For every option, writes rounds/<round>/<slot>-<n>.json with the option swapped in,
      renders and gates it, and keeps only options that pass every gate. Then writes two
      ranking folders per slot (judge/r<round>-<slot>-rank-{1,2}) holding context.txt (the
      current page) and options.txt (current + passing options, shuffled differently in
      each), and records the label key in judge/r<round>-key.json.

  slot.py pair <round> <name> <new.txt> <old.txt>
      Writes judge/r<round>-<name>-{1,2}/A.txt,B.txt with the order swapped between runs.

  slot.py key <round>
      Prints the key so verdicts can be decoded after the judges answer.
"""
import json, os, random, shutil, subprocess, sys

# Run from the run folder (the one holding constraints.json, ledger.json, judge/, render/, rounds/).
RUN = os.getcwd()
SK = os.path.dirname(os.path.abspath(__file__))


def load_key(rnd):
    p = f'judge/r{rnd}-key.json'
    return json.load(open(p)) if os.path.exists(p) else {}


def save_key(rnd, key):
    json.dump(key, open(f'judge/r{rnd}-key.json', 'w'), indent=1)


def swap(d, where, text):
    if where in ('summary', 'headline'):
        d[where] = text
        return True
    for s in d['sections']:
        for e in s['entries']:
            for r in e['roles']:
                for b in r['bullets']:
                    if b['text'].startswith(where):
                        b['text'] = text
                        return True
    return False


def gate(path, out):
    r = subprocess.run(['bash', f'{SK}/render.sh', path, out], capture_output=True, text=True)
    lint = subprocess.run(['python3', f'{SK}/lint_resume.py', path, '--constraints', 'constraints.json',
                           '--ledger', 'ledger.json'], capture_output=True, text=True)
    ok = r.returncode == 0 and 'GATE' not in lint.stdout
    detail = (r.stdout.strip().splitlines() or [''])[-1]
    return ok, detail + ('' if ok else ' | ' + ' '.join(l for l in lint.stdout.splitlines() if 'GATE' in l))


def build(base, rnd, spec):
    os.makedirs(f'rounds/{rnd}', exist_ok=True)
    key = load_key(rnd)
    subprocess.run(['bash', f'{SK}/render.sh', base, f'render/r{rnd}-base'], capture_output=True)
    for slot in json.load(open(spec))['slots']:
        sid, current = slot['id'], None
        passing = []
        for n, text in enumerate(slot['options'], 1):
            d = json.load(open(base))
            if current is None:
                current = d[slot['where']] if slot['where'] in ('summary', 'headline') else next(
                    b['text'] for s in d['sections'] for e in s['entries'] for r in e['roles']
                    for b in r['bullets'] if b['text'].startswith(slot['where']))
            if not swap(d, slot['where'], text):
                print(f'{sid}-{n}: slot not found'); continue
            p = f'rounds/{rnd}/{sid}-{n}.json'
            json.dump(d, open(p, 'w'), indent=1, ensure_ascii=False)
            ok, detail = gate(p, f'render/r{rnd}-{sid}-{n}')
            print(f'{sid}-{n}: {"PASS" if ok else "FAIL"} {detail}')
            if ok:
                passing.append((f'{sid}-{n}', text))
        entries = [('current', current)] + passing
        first = None
        for run in (1, 2):
            order = entries[:]
            random.shuffle(order)
            while run == 2 and len(order) > 1 and order == first:
                random.shuffle(order)
            first = first or order
            dd = f'judge/r{rnd}-{sid}-rank-{run}'
            os.makedirs(dd, exist_ok=True)
            shutil.copy(f'render/r{rnd}-base.txt', f'{dd}/context.txt')
            with open(f'{dd}/options.txt', 'w') as f:
                f.write(f'Options for {slot["label"]} (the line currently on the page is one of them):\n\n')
                for i, (_, t) in enumerate(order, 1):
                    f.write(f'Option {i}: {t}\n\n')
            key[dd] = {str(i): name for i, (name, _) in enumerate(order, 1)}
    save_key(rnd, key)


def pair(rnd, name, new, old):
    key = load_key(rnd)
    first = random.choice(['new', 'old'])
    for run in (1, 2):
        dd = f'judge/r{rnd}-{name}-{run}'
        os.makedirs(dd, exist_ok=True)
        a = first if run == 1 else ('old' if first == 'new' else 'new')
        src = {'new': new, 'old': old}
        shutil.copy(src[a], f'{dd}/A.txt')
        shutil.copy(src['old' if a == 'new' else 'new'], f'{dd}/B.txt')
        key[dd] = {'A': a}
    save_key(rnd, key)


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'build':
        build(sys.argv[2], sys.argv[3], sys.argv[4])
    elif cmd == 'pair':
        pair(*sys.argv[2:6])
    elif cmd == 'key':
        print(json.dumps(load_key(sys.argv[2]), indent=1))
