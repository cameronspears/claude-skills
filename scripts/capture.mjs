#!/usr/bin/env node
// Screenshots for design work: every section of the page at each width, any interaction states
// you script, and zoomed close-ups of elements at rest, hover, keyboard focus and press.
//
//   node capture.mjs <url> --out <dir> [--label after] [--widths 1440,768,375,320]
//        [--scheme light|dark] [--reduced-motion] [--section 1200]
//        [--states states.json] [--zoom "<selector>" --zoom "<selector>::2" ...]
//        [--setup "<js run after every load, e.g. to dismiss a cookie banner>"]
//
// Sections: <label>-<width>-sNN.png, about one screen each (phones at 2x, as a phone shows them).
// States:   <label>-state-<name>-<width>.png, each from a fresh page load. states.json is a list:
//   [{ "name": "search-open", "widths": [1440, 375],
//      "steps": [{ "click": "#search" }, { "type": "rune" }, { "wait": 500 }],
//      "shot": "viewport" | "full" | { "selector": ".menu", "pad": 24 } }]
//   Steps: click, hover, focus (keyboard focus), type, key ("Escape", "Tab", "ArrowDown"),
//   scroll (selector), wait (ms), eval (JavaScript run in the page),
//   press (pointer held down on a selector, not released), release (lets go where the pointer is),
//   drag ({ "drag": ".sheet", "by": [0, 240], "ms": 220, "release": true }: a pointer drag in
//   real time, so velocity-based physics see a real flick).
// Motion: add "frames": [0, 60, 120, 200, 320, 500, 800] to a state and the last step's motion is
//   shot at those milliseconds as <label>-motion-<name>-<width>-fNN-<ms>ms.png, so springs,
//   overshoot, staggers and draws can be checked frame by frame (a still state shot can't show them).
// Zooms:    <label>-zoom-<slug>-<width>-<state>.png at 3x: rest, hover (desktop), focus, press.
// An index.md beside them lists every file, so nothing captured goes unopened.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  box,
  evaluate,
  goto,
  key,
  keyboardFocus,
  launch,
  mouse,
  pageHeight,
  parseArgs,
  setViewport,
  shoot,
  shootViewport,
  sleep,
} from './browser.mjs';

const args = parseArgs(process.argv.slice(2));
const url = args._[0];
if (!url || !args.out) {
  console.error('Usage: node capture.mjs <url> --out <dir> [--label name] [--widths 1440,375] [--states file] [--zoom selector]');
  process.exit(1);
}
const out = path.resolve(args.out);
const label = args.label || 'shot';
const widths = String(args.widths || '1440,375')
  .split(',')
  .map(Number)
  .filter(Boolean);
const sectionHeight = Number(args.section || 0);
const zooms = [].concat(args.zoom || []).filter((z) => typeof z === 'string');
const states = args.states ? JSON.parse(await readFile(args.states, 'utf8')) : [];
const media = { scheme: args.scheme, reducedMotion: Boolean(args['reduced-motion']) };
const setup = typeof args.setup === 'string' ? args.setup : null;
const load = async () => {
  await goto(page, url);
  if (setup) {
    await evaluate(page, setup);
    await sleep(300);
  }
};
const written = [];
// Motion frames take longer to shoot than a spring takes to settle, so while frames are taken the
// page's clock runs at a tenth of real speed: CSS and Web Animations through CDP's playback rate,
// and requestAnimationFrame-driven JS (springs, drags) through this shim of performance.now.
const SLOW = 0.1;
const CLOCK_SHIM = `(() => {
  const realNow = performance.now.bind(performance), realRaf = window.requestAnimationFrame.bind(window);
  let scale = 1, baseReal = 0, baseVirtual = 0;
  const now = () => baseVirtual + (realNow() - baseReal) * scale;
  window.__craftSlow = (s) => { baseVirtual = now(); baseReal = realNow(); scale = s; };
  performance.now = now;
  window.requestAnimationFrame = (cb) => realRaf(() => cb(now()));
  // Timers slow down with the clock, so a toast's 5s timeout still lasts 5 virtual seconds in frames.
  const realSetTimeout = window.setTimeout.bind(window), realSetInterval = window.setInterval.bind(window);
  window.setTimeout = (cb, ms = 0, ...a) => realSetTimeout(cb, ms / scale, ...a);
  window.setInterval = (cb, ms = 0, ...a) => realSetInterval(cb, ms / scale, ...a);
})();`;
await mkdir(out, { recursive: true });

const slug = (s) =>
  s
    .replace(/::\d+$/, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
    .toLowerCase() || 'el';
const dprFor = (w) => (w < 768 ? 2 : 1);
const file = (name) => {
  const f = path.join(out, name);
  written.push(path.basename(f));
  return f;
};

const page = await launch();
await page.send('Animation.enable');
await page.send('Page.addScriptToEvaluateOnNewDocument', { source: CLOCK_SHIM });
try {
  // 1. Sections of the resting page at each width.
  for (const width of widths) {
    await setViewport(page, { width, dpr: dprFor(width), ...media });
    await load();
    const viewportH = width < 768 ? 812 : 900;
    const step = sectionHeight || viewportH;
    const total = await pageHeight(page);
    let n = 1;
    for (let y = 0; y < total; y += step) {
      const h = Math.min(step, total - y);
      await shoot(page, file(`${label}-${width}-s${String(n++).padStart(2, '0')}.png`), { x: 0, y, width, height: h });
    }
    console.log(`${width}px: ${n - 1} sections, page ${total}px tall`);
  }

  // 2. Scripted states, each from a fresh load.
  for (const state of states) {
    for (const width of state.widths || widths) {
      await setViewport(page, { width, dpr: dprFor(width), ...media });
      await load();
      const steps = state.steps || [];
      for (const [i, stepDef] of steps.entries()) {
        if (state.frames && i === steps.length - 1) {
          // Slow the clock before the last step, so timers it schedules (a toast's timeout) slow too.
          await page.send('Animation.setPlaybackRate', { playbackRate: SLOW });
          await evaluate(page, `window.__craftSlow && window.__craftSlow(${SLOW})`);
        }
        const [action, value] = Object.entries(stepDef)[0];
        if (action === 'wait') await sleep(Number(value));
        else if (action === 'release') {
          const p = await evaluate(page, 'window.__craftPointer || { x: 1, y: 1 }');
          await mouse(page, 'mouseReleased', p.x, p.y);
        }
        else if (action === 'eval') await evaluate(page, value);
        else if (action === 'key') await key(page, value);
        else if (action === 'type') await page.send('Input.insertText', { text: String(value) });
        else if (action === 'focus') {
          const [sel, nth] = String(value).split('::');
          if (!(await keyboardFocus(page, sel, Number(nth || 0)))) console.warn(`  ${state.name}: could not focus ${value}`);
        } else {
          const [sel, nth] = String(value).split('::');
          const b = await box(page, sel, Number(nth || 0));
          if (!b) {
            console.warn(`  ${state.name}: no element for ${value}`);
            continue;
          }
          await sleep(150);
          const fresh = await box(page, sel, Number(nth || 0));
          const cx = fresh.vx + fresh.width / 2;
          const cy = fresh.vy + fresh.height / 2;
          await evaluate(page, `window.__craftPointer = { x: ${cx}, y: ${cy} }`);
          if (action === 'hover') await mouse(page, 'mouseMoved', cx, cy);
          if (action === 'press') {
            await mouse(page, 'mouseMoved', cx, cy);
            await mouse(page, 'mousePressed', cx, cy);
          }
          if (action === 'drag') {
            const [dx, dy] = stepDef.by || [0, 0];
            const ms = Number(stepDef.ms || 250);
            const n = Math.max(6, Math.round(ms / 16));
            await mouse(page, 'mouseMoved', cx, cy);
            await mouse(page, 'mousePressed', cx, cy);
            for (let k = 1; k <= n; k++) {
              await mouse(page, 'mouseMoved', cx + (dx * k) / n, cy + (dy * k) / n, { buttons: 1 });
              await sleep(ms / n);
            }
            await evaluate(page, `window.__craftPointer = { x: ${cx + dx}, y: ${cy + dy} }`);
            if (stepDef.release !== false) await mouse(page, 'mouseReleased', cx + dx, cy + dy);
          }
          if (action === 'click') {
            await mouse(page, 'mouseMoved', cx, cy);
            await mouse(page, 'mousePressed', cx, cy);
            await mouse(page, 'mouseReleased', cx, cy);
          }
        }
        if (state.frames && i === steps.length - 1) break; // frames start the moment the last step lands
        await sleep(120);
      }
      if (state.frames) {
        if (!steps.length) {
          await page.send('Animation.setPlaybackRate', { playbackRate: SLOW });
          await evaluate(page, `window.__craftSlow && window.__craftSlow(${SLOW})`);
        }
        const t0 = Date.now();
        const { scrollX, scrollY, h } = await evaluate(page, '({ scrollX, scrollY, h: innerHeight })');
        let clip = { x: scrollX, y: scrollY, width, height: h };
        if (state.shot && state.shot.selector) {
          const b = await evaluate(page, `(() => { const el = document.querySelector(${JSON.stringify(state.shot.selector)}); if (!el) return null;
            const r = el.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height }; })()`);
          const pad = state.shot.pad ?? 24;
          if (b) clip = { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: Math.min(width, b.width + pad * 2), height: b.height + pad * 2 };
        }
        for (const [k, ms] of state.frames.entries()) {
          const wait = ms / SLOW - (Date.now() - t0);
          if (wait > 0) await sleep(wait);
          const actual = Math.round((Date.now() - t0) * SLOW);
          await shoot(page, file(`${label}-motion-${slug(state.name)}-${width}-f${String(k).padStart(2, '0')}-${actual}ms.png`), clip);
        }
        await page.send('Animation.setPlaybackRate', { playbackRate: 1 });
        await evaluate(page, 'window.__craftSlow && window.__craftSlow(1)');
        continue;
      }
      await sleep(400);
      const name = `${label}-state-${slug(state.name)}-${width}.png`;
      const shot = state.shot || 'viewport';
      if (shot === 'full') {
        await shoot(page, file(name), { x: 0, y: 0, width, height: await pageHeight(page) });
      } else if (shot === 'viewport') {
        await shootViewport(page, file(name));
      } else {
        const b = await evaluate(
          page,
          `(() => { const el = document.querySelector(${JSON.stringify(shot.selector)}); if (!el) return null;
            const r = el.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height }; })()`
        );
        if (!b) console.warn(`  ${state.name}: no element for shot ${shot.selector}`);
        else {
          const pad = shot.pad ?? 24;
          await shoot(page, file(name), {
            x: Math.max(0, b.x - pad),
            y: Math.max(0, b.y - pad),
            width: Math.min(width, b.width + pad * 2),
            height: b.height + pad * 2,
          });
        }
      }
    }
  }
  if (states.length) console.log(`${states.length} states captured`);

  // 3. Close-ups of elements in each interaction state.
  for (const width of zooms.length ? widths : []) {
    await setViewport(page, { width, dpr: 3, ...media });
    await load();
    const phone = width < 768;
    for (const z of zooms) {
      const [sel, nth] = z.split('::');
      const b = await box(page, sel, Number(nth || 0));
      if (!b) {
        console.warn(`  zoom: no element for ${z} at ${width}px`);
        continue;
      }
      await sleep(200);
      const pad = 16;
      const clip = { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: b.width + pad * 2, height: b.height + pad * 2 };
      const cx = b.vx + b.width / 2;
      const cy = b.vy + b.height / 2;
      const base = `${label}-zoom-${slug(sel)}${nth ? `-${nth}` : ''}-${width}`;
      await mouse(page, 'mouseMoved', 1, 1);
      await evaluate(page, 'document.activeElement && document.activeElement.blur()');
      await sleep(250);
      await shoot(page, file(`${base}-rest.png`), clip);
      if (!phone) {
        await mouse(page, 'mouseMoved', cx, cy);
        await sleep(350);
        await shoot(page, file(`${base}-hover.png`), clip);
        await mouse(page, 'mouseMoved', 1, 1);
      }
      await keyboardFocus(page, sel, Number(nth || 0));
      await sleep(250);
      await shoot(page, file(`${base}-focus.png`), clip);
      await evaluate(page, 'document.activeElement && document.activeElement.blur()');
      await mouse(page, 'mouseMoved', cx, cy);
      await mouse(page, 'mousePressed', cx, cy);
      await sleep(180);
      await shoot(page, file(`${base}-press.png`), clip);
      // Release outside the element, so the press doesn't click (no navigation, no toggling).
      await mouse(page, 'mouseMoved', 1, 1);
      await mouse(page, 'mouseReleased', 1, 1);
      await sleep(150);
    }
  }
  if (zooms.length) console.log(`${zooms.length} elements zoomed at ${widths.join(', ')}px`);
} finally {
  await page.close();
}

const index = [`# ${label}: ${url}`, '', `Captured ${new Date().toISOString()}. Open every file below.`, '', ...written.map((f) => `- ${f}`)];
await writeFile(path.join(out, `${label}-index.md`), index.join('\n') + '\n');
console.log(`${written.length} files in ${out} (list: ${label}-index.md)`);
