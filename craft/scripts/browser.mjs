// Minimal headless Chrome driver over the DevTools protocol. No dependencies: Node 22+ has
// fetch and WebSocket built in. Shared by capture.mjs and audit.mjs.
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].filter(Boolean);

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) args[key] = true;
      else {
        args[key] = args[key] === undefined ? next : [].concat(args[key], next);
        i++;
      }
    } else args._.push(a);
  }
  return args;
}

export async function launch() {
  if (typeof WebSocket === 'undefined') throw new Error('Node 22 or later is needed (built-in WebSocket).');
  const exe = CANDIDATES.find((p) => existsSync(p));
  if (!exe) throw new Error('Chrome not found. Set CHROME_PATH to a Chrome or Chromium binary.');
  const profile = mkdtempSync(path.join(tmpdir(), 'craft-chrome-'));
  const port = 9300 + Math.floor(Math.random() * 600);
  const proc = spawn(
    exe,
    [
      '--headless=new',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--font-render-hinting=none',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );
  let wsUrl;
  for (let i = 0; i < 100 && !wsUrl; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      wsUrl = list.find((t) => t.type === 'page')?.webSocketDebuggerUrl;
    } catch {}
    if (!wsUrl) await sleep(150);
  }
  if (!wsUrl) throw new Error('Chrome did not start.');
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });
  let id = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(`${msg.error.message} ${msg.error.data ?? ''}`));
      else resolve(msg.result);
    } else if (msg.method) for (const fn of listeners) fn(msg);
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const i = ++id;
      pending.set(i, { resolve, reject });
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  const page = {
    send,
    on: (fn) => listeners.add(fn),
    off: (fn) => listeners.delete(fn),
    async close() {
      try {
        ws.close();
      } catch {}
      proc.kill();
      await sleep(200);
      try {
        rmSync(profile, { recursive: true, force: true });
      } catch {}
    },
  };
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  return page;
}

/**
 * Sets the viewport and media features. A width under 768 also emulates a touch phone, so
 * `(hover: hover)` styles don't apply, as on a real phone.
 */
export async function setViewport(page, { width, height = 900, dpr = 1, scheme, reducedMotion }) {
  const mobile = width < 768;
  await page.send('Emulation.setDeviceMetricsOverride', {
    width,
    height: mobile ? 812 : height,
    deviceScaleFactor: dpr,
    mobile,
  });
  await page.send('Emulation.setTouchEmulationEnabled', mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false });
  const features = [];
  if (scheme) features.push({ name: 'prefers-color-scheme', value: scheme });
  if (reducedMotion) features.push({ name: 'prefers-reduced-motion', value: 'reduce' });
  await page.send('Emulation.setEmulatedMedia', { features });
}

/** Navigates and waits for load, then for the network to go quiet and fonts to be ready. */
export async function goto(page, url, { settle = 800, timeout = 45000 } = {}) {
  let inflight = 0;
  let lastActivity = Date.now();
  const track = (msg) => {
    if (msg.method === 'Network.requestWillBeSent') inflight++, (lastActivity = Date.now());
    if (msg.method === 'Network.loadingFinished' || msg.method === 'Network.loadingFailed')
      (inflight = Math.max(0, inflight - 1)), (lastActivity = Date.now());
  };
  page.on(track);
  const loaded = new Promise((resolve) => {
    const fn = (msg) => {
      if (msg.method === 'Page.loadEventFired') page.off(fn), resolve();
    };
    page.on(fn);
  });
  const start = Date.now();
  await page.send('Page.navigate', { url });
  await Promise.race([loaded, sleep(timeout)]);
  while (Date.now() - start < timeout) {
    if (inflight <= 0 && Date.now() - lastActivity > 500) break;
    await sleep(100);
  }
  page.off(track);
  const where = await evaluate(page, 'location.href');
  if (where.startsWith('chrome-error:') || where === 'about:blank') {
    throw new Error(`The page didn't load: ${url}. Use an absolute file:// path or a running server's URL.`);
  }
  await evaluate(page, 'document.fonts ? document.fonts.ready.then(() => true) : true');
  await sleep(settle);
}

export async function evaluate(page, expression) {
  const res = await page.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
    userGesture: true,
  });
  if (res.exceptionDetails) {
    throw new Error(res.exceptionDetails.exception?.description || res.exceptionDetails.text);
  }
  return res.result?.value;
}

export async function pageHeight(page) {
  const { cssContentSize, contentSize } = await page.send('Page.getLayoutMetrics');
  return Math.ceil((cssContentSize || contentSize).height);
}

/** Saves a PNG/JPEG of a CSS-pixel rectangle of the page (can extend beyond the viewport). */
export async function shoot(page, file, clip, { format = 'png', scale = 1 } = {}) {
  const { data } = await page.send('Page.captureScreenshot', {
    format,
    quality: format === 'jpeg' ? 80 : undefined,
    captureBeyondViewport: true,
    clip: { ...clip, scale },
  });
  const { writeFile } = await import('node:fs/promises');
  await writeFile(file, Buffer.from(data, 'base64'));
  return file;
}

/** Saves exactly what the viewport shows. Use it for scrolled states: a beyond-viewport clip
 * re-lays out fixed and sticky elements (nav bars, sheets, toasts) in the wrong place. */
export async function shootViewport(page, file, { format = 'png' } = {}) {
  const { data } = await page.send('Page.captureScreenshot', {
    format,
    quality: format === 'jpeg' ? 80 : undefined,
    captureBeyondViewport: false,
  });
  const { writeFile } = await import('node:fs/promises');
  await writeFile(file, Buffer.from(data, 'base64'));
  return file;
}

/** Bounding box (page coordinates) of the nth match of a selector, scrolled into view. */
export async function box(page, selector, nth = 0) {
  return evaluate(
    page,
    `(() => {
      const el = document.querySelectorAll(${JSON.stringify(selector)})[${nth}];
      if (!el) return null;
      el.scrollIntoView({ block: 'center', inline: 'center' });
      const r = el.getBoundingClientRect();
      return { x: r.left + scrollX, y: r.top + scrollY, vx: r.left, vy: r.top, width: r.width, height: r.height };
    })()`
  );
}

export async function mouse(page, type, x, y, { buttons } = {}) {
  // A move with buttons: 1 is a drag (the left button held), so pointermove handlers see it.
  const held = type === 'mouseMoved' && buttons;
  await page.send('Input.dispatchMouseEvent', {
    type,
    x,
    y,
    button: type === 'mouseMoved' && !held ? 'none' : 'left',
    buttons: held || type === 'mousePressed' ? 1 : 0,
    clickCount: type === 'mouseMoved' ? 0 : 1,
  });
}

export async function key(page, keyName) {
  const codes = { Shift: 16, Tab: 9, Enter: 13, Escape: 27, ArrowDown: 40, ArrowUp: 38, ArrowLeft: 37, ArrowRight: 39, ' ': 32 };
  const base = { key: keyName, code: keyName === ' ' ? 'Space' : keyName, windowsVirtualKeyCode: codes[keyName] };
  await page.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...base });
  await page.send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
}

/** Focuses an element the way a keyboard user would, so :focus-visible applies. */
export async function keyboardFocus(page, selector, nth = 0) {
  await key(page, 'Shift');
  return evaluate(
    page,
    `(() => {
      const el = document.querySelectorAll(${JSON.stringify(selector)})[${nth}];
      if (!el) return false;
      el.focus({ focusVisible: true });
      return document.activeElement === el && el.matches(':focus-visible');
    })()`
  );
}
