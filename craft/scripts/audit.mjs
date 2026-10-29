#!/usr/bin/env node
// Measures a rendered page against the craft system and WCAG 2.2 AA, at each width.
//
//   node audit.mjs <url> [--widths 1440,375] [--scheme light|dark] [--json out.json]
//        [--ignore "<selector>"] [--setup "<js run after load>"] [--max-tabs 300]
//
// Checks, each PASS / WARN / FAIL with example elements (WARN pills: pill-shaped controls; FAIL grain: a noise layer above content; FAIL align: table content off its heading or row line):
//   cohesion   distinct radii, shadows, gradients, text colours, backgrounds, letter-spacing,
//              font families, sizes and weights (budgets from SKILL.md)
//   contrast   every text element against its real background (4.5:1, or 3:1 for large text)
//   focus      Tab through the page: every stop shows a ring, not clipped by an ancestor and not
//              hidden under a sticky or fixed element
//   targets    controls at least 24x24 CSS px (WCAG 2.5.8); under 44 on phones is a warning
//   text       nothing under 12px; no text set in a font weight under 300 at small sizes
//   overflow   no horizontal scroll at any width
//   motion     no animation that loops forever with reduced motion on
//   names      images have alt, controls have an accessible name
//   numbers    numeric columns use tabular figures (warning)
// Mark deliberate value scales (heat cells, chance bars, chart marks) with data-scale on a
// container, so their many greys don't count against the colour budgets. Mark third-party
// widgets you can't restyle with data-craft-ignore, and the light field and grain with data-craft-light.
import { writeFile } from 'node:fs/promises';
import { evaluate, goto, key, launch, parseArgs, setViewport, sleep } from './browser.mjs';

const args = parseArgs(process.argv.slice(2));
const url = args._[0];
if (!url) {
  console.error('Usage: node audit.mjs <url> [--widths 1440,375] [--scheme dark] [--json out.json]');
  process.exit(1);
}
const widths = String(args.widths || '1440,375').split(',').map(Number).filter(Boolean);
const ignore = ['[data-craft-ignore]', '[data-craft-light]', 'nextjs-portal', '#__next-build-watcher', '[data-nextjs-toast]', '[data-nextjs-dev-tools-button]']
  .concat([].concat(args.ignore || []).filter((s) => typeof s === 'string'))
  .join(', ');
const maxTabs = Number(args['max-tabs'] || 300);
const setup = typeof args.setup === 'string' ? args.setup : null;

export const BUDGETS = { radius: 5, shadow: 8, gradient: 0, color: 5, background: 9, tracking: 3, family: 2 };

// Runs in the page. Returns the static checks.
const STATIC = (ignoreSel) => `(() => {
  const IGN = ${JSON.stringify(ignoreSel)};
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const rgba = (c) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#000'; ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const over = (top, bottom) => { const a = top[3]; return [0, 1, 2].map((i) => top[i] * a + bottom[i] * (1 - a)).concat(1); };
  const label = (el) => { const parts = []; let e = el;
    for (let i = 0; e && e.nodeType === 1 && i < 3; i++, e = e.parentElement) {
      let s = e.tagName.toLowerCase(); if (e.id) s += '#' + e.id;
      const cls = typeof e.className === 'string' ? e.className.trim().split(/\\s+/).filter(Boolean).slice(0, 2) : [];
      if (cls.length) s += '.' + cls.join('.'); parts.unshift(s); }
    const text = (el.innerText || el.getAttribute('aria-label') || '').trim().replace(/\\s+/g, ' ').slice(0, 40);
    return parts.join(' > ') + (text ? ' "' + text + '"' : ''); };
  const visible = (el) => { if (el.closest('details:not([open]) > :not(summary)')) return false;
    const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false;
    if (el.checkVisibility) return el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
    const s = getComputedStyle(el); return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.01; };
  const ignored = (el) => IGN && el.closest(IGN);
  const scaled = (el) => el.closest('[data-scale]');
  const ownText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());

  const seen = { radius: {}, shadow: {}, gradient: {}, color: {}, background: {}, tracking: {}, family: {}, size: {}, weight: {} };
  const add = (k, v, el) => { if (!seen[k][v]) seen[k][v] = { count: 0, example: label(el) }; seen[k][v].count++; };
  const bgCache = new Map();
  const background = (el) => { // the colour actually behind el, or null over an image
    let colour = [0, 0, 0, 0]; const stack = [];
    for (let e = el; e; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.backgroundImage !== 'none' && !s.backgroundImage.startsWith('url("data:image/svg')) return null;
      const c = rgba(s.backgroundColor); if (c[3] > 0) stack.push(c);
      if (c[3] >= 0.99) break; }
    let base = rgba(getComputedStyle(document.documentElement).backgroundColor);
    if (base[3] < 0.99) base = over(base, [255, 255, 255, 1]);
    for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
    return base; };

  const contrast = [], small = [], thin = [], numbers = [], recess = [], pills = []; let glass = 0;
  for (const el of document.body.querySelectorAll('*')) {
    if (ignored(el) || !visible(el)) continue;
    const s = getComputedStyle(el);
    const inScale = scaled(el);
    // A corner at least half the element's shorter side is simply "round" (circles, knobs, tracks).
    if (s.borderRadius !== '0px') { const b = el.getBoundingClientRect(), half = Math.min(b.width, b.height) / 2;
      for (const part of new Set(s.borderRadius.split(/\\s|\\//).filter((p) => p && p !== '0px')))
        add('radius', part.endsWith('%') && parseFloat(part) >= 50 || parseFloat(part) >= half - 0.5 ? (Math.abs(b.width - b.height) < 1 ? 'round' : 'pill') : part, el);
      // Pill-shaped controls (buttons, inputs, links styled as buttons). Switches and slider parts are expected pills.
      const r0 = parseFloat(s.borderRadius), ctl = el.matches('button, input:not([type=range]):not([type=checkbox]):not([type=radio]), select, a[class], [role=button], [role=tab], [role=radio]');
      const shaped = !/rgba\\(0, 0, 0, 0\\)|transparent/.test(s.backgroundColor) || s.boxShadow !== 'none' || parseFloat(s.borderTopWidth) > 0;
      if (ctl && shaped && b.width - b.height > 4 && b.height >= 24 && r0 >= b.height / 2 - 0.5 && !el.matches('[role=switch], [role=slider], [aria-pressed][class*=switch], [class*=toggle], [class*=switch]')) pills.push(label(el)); }
    if (s.boxShadow !== 'none') { add('shadow', s.boxShadow, el);
      const layers = s.boxShadow.split(/,(?![^(]*\\))/);
      const blurred = s.backdropFilter && s.backdropFilter !== 'none';
      if (!blurred && layers.every((l) => /inset/.test(l)) && layers.some((l) => /inset/.test(l) && !/rgba?\\(255, 255, 255/.test(l) && !/oklch\\((9\\d|100)/.test(l))) recess.push(label(el)); }
    if ((s.backdropFilter && s.backdropFilter !== 'none') || (s.webkitBackdropFilter && s.webkitBackdropFilter !== 'none')) glass++;
    // A gradient whose stops are all one colour is a drawing trick (an underline that draws in), not decoration.
    const stops = (s.backgroundImage.match(/(rgba?|oklch|oklab|color)\\([^)]*\\)/g) || []);
    if (/gradient\\(/.test(s.backgroundImage) && !inScale && new Set(stops).size > 1) add('gradient', s.backgroundImage.slice(0, 90), el);
    if (rgba(s.backgroundColor)[3] > 0 && !inScale) add('background', s.backgroundColor, el);
    if (!ownText(el)) continue;
    if (!inScale) add('color', s.color, el);
    add('tracking', s.letterSpacing === 'normal' ? 'normal' : (Math.round(parseFloat(s.letterSpacing) / parseFloat(s.fontSize) * 200) / 200) + 'em', el);
    add('family', s.fontFamily.split(',')[0].trim(), el);
    add('size', s.fontSize, el); add('weight', s.fontWeight, el);
    const size = parseFloat(s.fontSize), weight = +s.fontWeight;
    if (size < 12) small.push(label(el) + ' ' + s.fontSize);
    if (size < 18 && weight < 300) thin.push(label(el) + ' ' + s.fontSize + '/' + weight);
    const bg = background(el);
    if (bg) { let fg = rgba(s.color); if (fg[3] < 1) fg = over(fg, bg);
      const r = ratio(fg, bg), large = size >= 24 || (size >= 18.66 && weight >= 700), need = large ? 3 : 4.5;
      if (r < need) contrast.push({ el: label(el), ratio: Math.round(r * 100) / 100, need }); }
    const t = el.textContent.trim();
    if (/^[+−\\-$£€]?[\\d.,]+\\s?(%|[KkMmBb]|gp|GP)?$/.test(t) && /\\d{2}/.test(t) && !/tabular/.test(s.fontVariantNumeric) && el.closest('table, [role=table], [role=grid], dl, ol, ul'))
      numbers.push(label(el));
  }

  const controls = [...document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=tab], [role=switch], [role=checkbox], [tabindex]:not([tabindex="-1"])')]
    .filter((el) => !ignored(el) && visible(el));
  const coarse = matchMedia('(pointer: coarse)').matches;
  const targets = [], smallTouch = [], unnamed = [];
  const rects = controls.map((el) => el.getBoundingClientRect());
  const undersized = rects.map((r) => r.width < 24 || r.height < 24);
  // WCAG 2.5.8's spacing exception: an undersized target passes if a 24px circle centred on it
  // touches no other target and no other undersized target's circle.
  const crowded = (i) => { const r = rects[i], cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    return rects.some((o, j) => { if (j === i || controls[j].contains(controls[i]) || controls[i].contains(controls[j])) return false;
      const dx = Math.max(o.left - cx, 0, cx - o.right), dy = Math.max(o.top - cy, 0, cy - o.bottom);
      if (Math.hypot(dx, dy) < 12) return true;
      if (undersized[j]) { const ox = o.left + o.width / 2, oy = o.top + o.height / 2; return Math.hypot(ox - cx, oy - cy) < 24; }
      return false; }); };
  for (const [i, el] of controls.entries()) {
    const r = rects[i];
    const inline = el.tagName === 'A' && el.parentElement && /^(P|LI|SPAN|DD|TD|LABEL)$/.test(el.parentElement.tagName) &&
      el.parentElement.textContent.trim().length > el.textContent.trim().length + 10;
    if (!inline && undersized[i] && crowded(i)) targets.push(label(el) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
    else if (coarse && !inline && (r.width < 44 || r.height < 44)) smallTouch.push(label(el) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
    const name = (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title') || el.innerText || el.value || el.getAttribute('placeholder') || '').trim()
      || [...el.querySelectorAll('img[alt]')].map((i) => i.alt).join('').trim()
      || (el.id && document.querySelector('label[for="' + CSS.escape(el.id) + '"]')?.textContent.trim());
    if (!name) unnamed.push(label(el));
  }
  for (const img of document.querySelectorAll('img:not([alt])')) if (!ignored(img) && visible(img)) unnamed.push(label(img) + ' (img without alt)');

  const doc = document.documentElement;
  const overflow = [];
  if (doc.scrollWidth > innerWidth + 1) {
    for (const el of document.body.querySelectorAll('*')) {
      if (ignored(el) || !visible(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.right > innerWidth + 1 && !(el.parentElement && el.parentElement.getBoundingClientRect().right > innerWidth + 1)) overflow.push(label(el) + ' right edge ' + Math.round(r.right));
      if (overflow.length > 8) break; } }

  // Grain belongs to the background: a noise layer (element or pseudo) that isn't behind content fails.
  // Alignment in tables: a centred or end-aligned column's content lines up with its heading (a block
  // svg ignores text-align), and every cell in a row shares the row's centre line.
  const align = [], alignNear = [];
  const contentBox = (cell) => { const range = document.createRange(); range.selectNodeContents(cell);
    const b = range.getBoundingClientRect(); return b.width && b.height ? b : null; };
  for (const table of document.querySelectorAll('table, [role=table], [role=grid]')) {
    if (ignored(table) || !visible(table)) continue;
    const rows = [...table.querySelectorAll('tr, [role=row]')];
    const head = rows.find((tr) => tr.querySelector('th[scope=col], [role=columnheader]')) || rows[0];
    if (!head) continue;
    const heads = [...head.children];
    for (const tr of rows) {
      if (tr === head || tr.closest('tfoot')) continue;
      const cells = [...tr.children];
      if (cells.length !== heads.length) continue;
      const mids = [];
      cells.forEach((cell, i) => {
        const box = contentBox(cell); if (!box) return;
        mids.push(box.top + box.height / 2);
        const want = getComputedStyle(heads[i]).textAlign, hb = contentBox(heads[i]); if (!hb) return;
        const centre = (b) => b.left + b.width / 2;
        const off = want === 'center' ? centre(box) - centre(hb) : (want === 'right' || want === 'end') ? box.right - hb.right : 0;
        const note = label(cell) + ' is ' + Math.round(off) + 'px off its heading' + (want === 'center' ? ' centre' : ' end');
        if (Math.abs(off) > 6) align.push(note); else if (Math.abs(off) > 3 && alignNear.length < 12) alignNear.push(note);
      });
      if (mids.length > 1 && Math.max(...mids) - Math.min(...mids) > 4) align.push(label(tr) + ' cells sit ' + Math.round(Math.max(...mids) - Math.min(...mids)) + 'px off one centre line');
      if (align.length > 12) break;
    }
  }

  const grainAbove = [];
  const noisy = (st) => /feTurbulence/.test(st.backgroundImage || '');
  const above = (st) => st.position === 'fixed' || st.position === 'absolute' ? (st.zIndex === 'auto' || parseInt(st.zIndex, 10) >= 0) : false;
  for (const host of [document.documentElement, document.body, ...document.querySelectorAll('body *')]) {
    for (const pseudo of [null, '::before', '::after']) {
      const st = getComputedStyle(host, pseudo);
      if (pseudo && (st.content === 'none' || st.content === 'normal')) continue;
      if (noisy(st) && above(st)) grainAbove.push(label(host) + (pseudo || '') + ' z-index ' + st.zIndex);
    }
    if (grainAbove.length > 4) break;
  }

  const summarize = (k) => Object.entries(seen[k]).sort((a, b) => b[1].count - a[1].count).map(([value, v]) => ({ value, count: v.count, example: v.example }));
  return { width: innerWidth, coarse, scrollWidth: doc.scrollWidth,
    cohesion: Object.fromEntries(Object.keys(seen).map((k) => [k, summarize(k)])),
    contrast, small, thin, numbers, recess, pills, grainAbove, align, alignNear, glass, light: !!document.querySelector('[data-craft-light]'), targets, smallTouch, unnamed, overflow, controls: controls.length };
})()`;

// Runs in the page before tabbing: remembers each control's resting outline and shadow.
const REMEMBER = `(() => { window.__craftRest = new WeakMap();
  for (const el of document.querySelectorAll('*')) { const s = getComputedStyle(el);
    window.__craftRest.set(el, s.outlineStyle + '|' + s.outlineWidth + '|' + s.boxShadow + '|' + s.borderColor + '|' + s.backgroundColor); }
  document.activeElement && document.activeElement.blur(); scrollTo(0, 0); return true; })()`;

// Runs in the page after each Tab: describes the focused element's ring.
const FOCUSED = (ignoreSel) => `(() => {
  const el = document.activeElement;
  if (!el || el === document.body || el === document.documentElement) return { done: true };
  if (${JSON.stringify(ignoreSel)} && el.closest(${JSON.stringify(ignoreSel)})) return { skip: true, key: el.tagName };
  const s = getComputedStyle(el);
  const rest = window.__craftRest.get(el) || '';
  const now = s.outlineStyle + '|' + s.outlineWidth + '|' + s.boxShadow + '|' + s.borderColor + '|' + s.backgroundColor;
  const outline = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0;
  const visibleRing = outline || now !== rest;
  const r = el.getBoundingClientRect();
  // How far the ring reaches outside the element: an inset ring (negative offset) can't be clipped.
  const reach = outline ? Math.max(0, parseFloat(s.outlineWidth) + (parseFloat(s.outlineOffset) || 0)) : /inset/.test(s.boxShadow) ? 0 : 2;
  let clipped = null;
  for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
    const as = getComputedStyle(a);
    if (/(hidden|clip|auto|scroll)/.test(as.overflow + as.overflowX + as.overflowY)) {
      const ar = a.getBoundingClientRect();
      if (r.left - reach < ar.left - 0.5 || r.right + reach > ar.right + 0.5 || r.top - reach < ar.top - 0.5 || r.bottom + reach > ar.bottom + 0.5) {
        clipped = a.tagName.toLowerCase() + (a.className && typeof a.className === 'string' ? '.' + a.className.trim().split(/\\s+/)[0] : ''); break; } } }
  const cx = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), cy = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
  const hit = document.elementFromPoint(cx, cy);
  const obscured = r.height > 0 && hit && !el.contains(hit) && !hit.contains(el) ? hit.tagName.toLowerCase() + (hit.className && typeof hit.className === 'string' ? '.' + hit.className.trim().split(/\\s+/)[0] : '') : null;
  const name = (el.getAttribute('aria-label') || el.innerText || el.value || el.getAttribute('placeholder') || el.tagName).trim().replace(/\\s+/g, ' ').slice(0, 40);
  return { key: el.tagName + ':' + name + ':' + Math.round(r.top + scrollY) + ':' + Math.round(r.left), name: el.tagName.toLowerCase() + ' "' + name + '"', visibleRing, clipped, obscured };
})()`;

const page = await launch();
const report = [];
let failed = false;
try {
  for (const width of widths) {
    await setViewport(page, { width, scheme: args.scheme, reducedMotion: true });
    await goto(page, url);
    if (setup) await evaluate(page, setup), await sleep(300);
    const result = await evaluate(page, STATIC(ignore));
    // A phone-width page whose layout is wider than the screen makes the browser zoom out, so it
    // reports no sideways scroll; compare against the width we asked for instead.
    if (result.width > width + 1 || result.scrollWidth > width + 1) {
      result.overflow.unshift(`the layout is ${Math.max(result.width, result.scrollWidth)}px wide on a ${width}px screen`);
      result.width = width;
    }
    const motion = await evaluate(
      page,
      `document.getAnimations().filter((a) => a.playState === 'running' && a.effect && a.effect.getComputedTiming().iterations === Infinity).map((a) => (a.effect.target ? a.effect.target.tagName.toLowerCase() + '.' + String(a.effect.target.className).split(' ')[0] : '?') + ' ' + (a.animationName || a.id || 'animation'))`
    );

    await evaluate(page, REMEMBER);
    const focus = { stops: 0, noRing: [], clipped: [], obscured: [] };
    const seenKeys = new Set();
    for (let i = 0; i < maxTabs; i++) {
      await key(page, 'Tab');
      await sleep(40);
      const f = await evaluate(page, FOCUSED(ignore));
      if (f.done) {
        if (i > 0) break;
        continue;
      }
      if (f.skip) continue;
      if (seenKeys.has(f.key)) break;
      seenKeys.add(f.key);
      focus.stops++;
      if (!f.visibleRing) focus.noRing.push(f.name);
      if (f.clipped) focus.clipped.push(`${f.name} by ${f.clipped}`);
      if (f.obscured) focus.obscured.push(`${f.name} under ${f.obscured}`);
    }
    report.push({ ...result, motion, focus });
  }
} finally {
  await page.close();
}

const line = (status, name, detail, examples = []) => {
  if (status === 'FAIL') failed = true;
  console.log(`  ${status.padEnd(4)} ${name.padEnd(10)} ${detail}`);
  for (const e of examples.slice(0, 6)) console.log(`         - ${typeof e === 'string' ? e : JSON.stringify(e)}`);
  if (examples.length > 6) console.log(`         … and ${examples.length - 6} more`);
};
for (const r of report) {
  console.log(`\n${url} at ${r.width}px${r.coarse ? ' (touch)' : ''}`);
  for (const [k, budget] of Object.entries(BUDGETS)) {
    const values = r.cohesion[k];
    const status = values.length > budget ? 'FAIL' : 'PASS';
    line(status, k, `${values.length} distinct (budget ${budget})`, status === 'FAIL' || k === 'radius' ? values.map((v) => `${v.value} ×${v.count}  e.g. ${v.example}`) : []);
  }
  line('INFO', 'type', `${r.cohesion.size.length} sizes, ${r.cohesion.weight.length} weights: ${r.cohesion.size.map((v) => v.value).join(' ')} | ${r.cohesion.weight.map((v) => v.value).join(' ')}`);
  line(r.contrast.length ? 'FAIL' : 'PASS', 'contrast', r.contrast.length ? `${r.contrast.length} text elements below AA` : 'all text meets AA', r.contrast.map((c) => `${c.ratio}:1 (needs ${c.need}) ${c.el}`));
  line(r.focus.noRing.length || r.focus.clipped.length ? 'FAIL' : 'PASS', 'focus', `${r.focus.stops} tab stops; ${r.focus.noRing.length} without a ring, ${r.focus.clipped.length} clipped`, [...r.focus.noRing.map((n) => 'no ring: ' + n), ...r.focus.clipped.map((n) => 'clipped: ' + n)]);
  if (r.focus.obscured.length) line('WARN', 'obscured', `${r.focus.obscured.length} focused controls covered by another element`, r.focus.obscured);
  line(r.targets.length ? 'FAIL' : 'PASS', 'targets', r.targets.length ? `${r.targets.length} controls under 24x24 and too close to another` : `${r.controls} controls meet 24x24 or its spacing rule`, r.targets);
  if (r.smallTouch.length) line('WARN', 'touch', `${r.smallTouch.length} controls under 44px on a touch screen`, r.smallTouch);
  line(r.small.length ? 'FAIL' : 'PASS', 'text', r.small.length ? `${r.small.length} elements under 12px` : 'nothing under 12px', r.small);
  if (r.thin.length) line('WARN', 'thin', `${r.thin.length} small texts lighter than weight 300`, r.thin);
  line(r.overflow.length ? 'FAIL' : 'PASS', 'overflow', r.overflow.length ? `page scrolls sideways (${r.scrollWidth}px wide)` : 'no sideways scroll', r.overflow);
  line(r.motion.length ? 'FAIL' : 'PASS', 'motion', r.motion.length ? `${r.motion.length} endless animations with reduced motion on` : 'nothing loops with reduced motion on', r.motion);
  line(r.unnamed.length ? 'FAIL' : 'PASS', 'names', r.unnamed.length ? `${r.unnamed.length} controls or images without a name` : 'every control and image is named', r.unnamed);
  if (r.recess && r.recess.length) line('WARN', 'recess', `${r.recess.length} recessed (inset-shadow) wells; use a flat fill`, r.recess);
  if (r.align) line(r.align.length ? 'FAIL' : 'PASS', 'align', r.align.length ? `${r.align.length} table cells off their column or row line` : 'table columns and rows line up', r.align);
  if (r.alignNear && r.alignNear.length) line('WARN', 'align', `${r.alignNear.length} table cells 3–6px off their heading (a sort arrow can do this): look, then decide`, r.alignNear);
  if (r.grainAbove) line(r.grainAbove.length ? 'FAIL' : 'PASS', 'grain', r.grainAbove.length ? `${r.grainAbove.length} grain layers above content; grain belongs behind every element` : 'grain (if any) sits behind content', r.grainAbove);
  if (r.pills && r.pills.length) line('WARN', 'pills', `${r.pills.length} pill-shaped buttons or inputs; use --r-ctl (pills only for switches and slider thumbs)`, r.pills);
  if (r.glass && !r.light) line('WARN', 'glass', `${r.glass} glass surfaces but no light field marked data-craft-light: glass over a flat ground reads as a grey box`);
  if (r.numbers.length) line('WARN', 'numbers', `${r.numbers.length} numbers in tables or lists without tabular figures`, r.numbers);
}
if (args.json) await writeFile(String(args.json), JSON.stringify(report, null, 1));
console.log(failed ? '\nResult: FAIL. Fix each FAIL, or record why it stays, before calling the work done.' : '\nResult: PASS on every hard check. WARN lines still need a look.');
process.exitCode = failed ? 1 : 0;
