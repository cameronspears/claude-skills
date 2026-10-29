# Tokens

Every value as a token on the theme root; components use tokens only. Ship every theme the site offers, and only those. Neutrals carry a faint tint of the brand hue (chroma 0.005–0.02 in OKLCH) so the whole page reads as one light; if the brand already tints its neutrals (Stripe's navy, Mercury's violet), keep that tint.

`assets/specimen.html` is this file working: copy from it.

## Surfaces at a glance

Every element sits on exactly one surface.

| Surface | For | Treatment |
| --- | --- | --- |
| **Ground** | Page background, headings, prose, simple lists | `--bg`, the light field, and the grain on them, behind all content. No borders or shadows; structure from type and space. |
| **Glass** | Nav, panels, cards, the featured result, menus, popovers, tooltips, toasts, sheets, segmented thumbs, secondary buttons | `--glass` (or `--glass-strong` for dense text), `backdrop-filter: var(--blur)`, top edge and rim, `--glass-shadow`, radius `--r` (`--r-ctl` for controls). |
| **Fill** | Inputs, search, tracks, chips, wells inside a panel, keycaps, skeletons | Flat `--fill`, no border, no inset shadow. |
| **Solid** | The primary button; long reading text | The accent fill; or the ground with no glass for articles and docs. |

- Never glass inside glass (except a small glass control, like a secondary button or thumb, on a glass panel). Inside a panel, group with space, hairlines or a fill well.
- At most about three blurred layers overlap at any point.
- Sections themselves are never boxed. Only objects get surfaces.

## Values at a glance

Full tokens, light and dark, follow below; `assets/specimen.html` uses every one.

- **Radius family:** soft, never near-square. `--r` 14px for panels, cards and menus; `--r-in` (outer minus padding, about 10px) for rows and wells inside them; `--r-sm` 8px for small rectangles (checkboxes, keycaps); `--r-ctl` 10px for buttons, inputs and segmented tracks. **No pill-shaped buttons, inputs or chips**: the owner finds them too soft and generic. Full pills only where the platform expects them: switches and slider thumbs.
- **Glass:** one recipe (Glass, below): translucent fill, `blur(22px) saturate(1.7)`, inset top edge, 1px rim, a three-layer soft shadow. `prefers-reduced-transparency` makes it opaque.
- **Light and grain:** two or three barely tinted patches of the brand hue (chroma about 0.015) plus one near-white, fixed, drifting over 35–60s; heavy film grain on the background only, behind every element, at overlay 0.55–0.75. Text, buttons and glass are never grainy.
- **Depth:** glass floats on soft shadows; buttons sit on a shadow underneath and sink into it when pressed. No top-edge highlights on buttons.
- **Text:** `--strong`, `--text`, `--muted` (neutrals tinted by the brand hue), plus the accent where allowed. No opacity on text. At least 4.5:1 on every surface, glass included.
- **Accent** = the brand colour exactly, on the primary action, selected and on states, focus rings, the one highlighted data mark, and links if the brand does that. Hover and pressed from `color-mix`, never another hue.
- **Space:** 4, 8, 16, 24, 48, 80, 120. Padding 16–24, gaps in panels 8–16, heading to content 16–24, between sections 80 or 120, alternating, with one deliberate pause.
- **Type:** the brand's typefaces, or one modern grotesk (Geist, Inter Display, Schibsted Grotesk; not Roboto). Big and light, small and firm: display 300 at `clamp(44px, 6vw, 76px)` with −0.025em tracking, sections 300 at `clamp(28px, 3.4vw, 40px)` with −0.02em, titles 500–600 at 15–20px, labels and buttons 500, body 400 at 15–17px with line-height 1.55. Tracking only from that table. Mono only for data (IDs, codes, keys). No all caps, no italics for emphasis.
- **Numbers:** `tabular-nums`, right-aligned in columns, units with a non-breaking space, two-tone values (number `--strong`, context `--muted`). Key numbers roll into place.
- **Motion:** `--spring` on objects that move, `--spring-soft` on big ones, `--out` on colour and opacity, a JS spring with the pointer's velocity for anything dragged. Press 80ms down, spring back 350ms. Details, touch and the joy kit in `references/motion.md`.

## Contents
1. Mapping the brand
2. Token CSS (light and dark)
3. Rules for using them
4. The light field
5. Glass
6. The grain
7. Browser surfaces
8. Moving an existing site onto the tokens

## 1. Mapping the brand

Find the brand before choosing anything: the logo or wordmark, primary buttons and links, CSS variables or theme config (Tailwind `primary`, `--brand`, `--accent`), any brand guide, the favicon and social images. Write the exact values down.

- `--accent` = the brand colour, exactly. `--hue` = its OKLCH hue; the neutrals and the light field are built from it.
- `--on-accent` = near-white or near-black, whichever passes 4.5:1 on the accent. If neither does, the accent is for fills only, and text links use `--strong` with an underline (tell the owner).
- Hover and pressed shades: `color-mix(in oklch, var(--accent), black 10%)` (or white for dark brands). Never another hue.
- Focus ring: the accent. On a dark ground where it's under 3:1, lighten it with `color-mix(in oklch, var(--accent), white 30%)` and check again.
- Brand typefaces replace `--font`. The wordmark keeps its own lettering.
- No brand colour at all: the accent is `--strong`, the light field is neutral, and the page is monochrome.
- One theme only (the brand has no switch): ship that theme on the page root, not behind a class.
- **The brand must be recognisable at rest.** In the first screen, without hovering or scrolling, the accent appears on at least the primary action and the brand mark. Minimal colour is not no colour: a page where the brand only shows up on hover has lost it.

## 2. Token CSS

Light values on `:root`; dark values redefine the same tokens. Replace `--hue`, `--accent` and `--font` with the brand's.

```css
:root {
  --font: "Geist", "Helvetica Neue", Arial, system-ui, sans-serif;
  --mono: "Geist Mono", ui-monospace, Menlo, monospace;   /* data only: IDs, codes, keys */

  /* shape: soft but defined corners. Pills only where the platform expects them (switches, slider thumbs). */
  --r: 14px;        /* panels, cards, featured result, menus, toasts */
  --r-in: 10px;     /* rows and wells inside a panel (concentric: --r minus the padding) */
  --r-ctl: 10px;    /* buttons, inputs, search, segmented tracks (their thumbs: --r-sm) */
  --r-sm: 8px;      /* small rectangles: chips, nav links, keycaps, checkboxes, thumbnails */
  --pill: 999px;    /* switches and slider thumbs only */

  --s1: 4px; --s2: 8px; --s3: 16px; --s4: 24px; --s5: 48px; --s6: 80px; --s7: 120px;

  /* motion (references/motion.md) */
  --spring: linear(0, .013 .6%, .05 1.2%, .2 2.5%, .43 4.1%, .72 6.3%, .94 8.6%, 1.06 10.7%, 1.11 12.7%, 1.12 14.3%, 1.1 16.4%, 1.05 19.6%, 1.01 23%, .99 27%, .995 34%, 1.002 45%, 1);
  --spring-soft: linear(0, .06 4%, .24 9%, .53 16%, .83 25%, 1.01 34%, 1.04 41%, 1.03 49%, 1.005 62%, 1);
  --out: cubic-bezier(.23, 1, .32, 1);

  --hue: 236;
  --bg: oklch(97% .008 var(--hue));
  --strong: oklch(19% .02 var(--hue));
  --text: oklch(27% .02 var(--hue));
  --muted: oklch(46% .02 var(--hue));
  --rule: oklch(25% .03 var(--hue) / .09);
  --fill: oklch(25% .04 var(--hue) / .055);        /* flat controls: inputs, tracks, chips, segmented track */
  --fill-hover: oklch(25% .04 var(--hue) / .09);
  --accent: oklch(52% .17 var(--hue));
  --accent-hover: color-mix(in oklch, var(--accent), black 10%);
  --on-accent: oklch(99% 0 0);
  --accent-soft: color-mix(in oklch, var(--accent) 12%, transparent);
  /* depth from below: buttons sit on a shadow and sink into it when pressed */
  --press-shadow: 0 1px 0 oklch(25% .04 var(--hue) / .14), 0 2px 3px -1px oklch(25% .05 var(--hue) / .14), 0 6px 14px -6px oklch(25% .06 var(--hue) / .22);
  --press-shadow-down: 0 0 0 oklch(25% .04 var(--hue) / .14), 0 1px 1px oklch(25% .05 var(--hue) / .16);
  --ok: oklch(55% .13 155); --warn: oklch(62% .13 70); --bad: oklch(55% .17 25);   /* status dots only */

  --glass: oklch(99.5% .004 var(--hue) / .62);
  --glass-strong: oklch(99.5% .004 var(--hue) / .8);
  --glass-edge: oklch(100% 0 0 / .7);              /* the bright top rim */
  --glass-rim: oklch(25% .04 var(--hue) / .1);     /* the 1px ring */
  --glass-shadow: 0 1px 1px oklch(25% .05 var(--hue) / .05), 0 8px 24px -6px oklch(30% .08 var(--hue) / .14), 0 24px 60px -20px oklch(30% .1 var(--hue) / .18);
  --sheen: oklch(100% 0 0 / .55);                  /* the light that follows the pointer */
  --blur: blur(22px) saturate(1.7);

  /* the light is hardly perceptible: you notice the page feels lit, not that it's coloured */
  --light-a: oklch(93% .014 var(--hue) / .9);
  --light-b: oklch(91% .016 calc(var(--hue) + 15) / .7);
  --light-c: oklch(100% 0 0 / .9);
  --grain-opacity: .6;
  --grain-size: 160px;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { /* same as [data-theme="dark"] below */ } }
:root[data-theme="dark"] {
  color-scheme: dark;
  --bg: oklch(15% .02 var(--hue));
  --strong: oklch(97% .005 var(--hue)); --text: oklch(89% .01 var(--hue)); --muted: oklch(70% .02 var(--hue));
  --rule: oklch(100% 0 0 / .09); --fill: oklch(100% 0 0 / .06); --fill-hover: oklch(100% 0 0 / .1);
  --accent: oklch(68% .15 var(--hue)); --on-accent: oklch(15% .03 var(--hue));
  --ok: oklch(78% .14 155); --warn: oklch(82% .13 75); --bad: oklch(72% .16 25);
  --glass: oklch(24% .025 var(--hue) / .5); --glass-strong: oklch(24% .025 var(--hue) / .72);
  --glass-edge: oklch(100% 0 0 / .14); --glass-rim: oklch(100% 0 0 / .1);
  --glass-shadow: 0 1px 1px oklch(0% 0 0 / .3), 0 12px 32px -8px oklch(0% 0 0 / .5), 0 30px 70px -24px oklch(0% 0 0 / .6);
  --sheen: oklch(100% 0 0 / .14);
  --press-shadow: 0 1px 0 oklch(0% 0 0 / .45), 0 2px 4px -1px oklch(0% 0 0 / .4), 0 8px 16px -6px oklch(0% 0 0 / .5);
  --press-shadow-down: 0 0 0 oklch(0% 0 0 / .45), 0 1px 1px oklch(0% 0 0 / .4);
  --light-a: oklch(25% .022 var(--hue) / .9); --light-b: oklch(23% .02 calc(var(--hue) + 15) / .8); --light-c: oklch(24% .006 var(--hue) / .7);
  --grain-opacity: .7;
}
```

**Which theme leads.** Follow the brand. When the brand leaves it open, tools, dashboards and anything used for long sessions lead in dark, with a light theme behind a switch; marketing and reading pages lead in whichever the brand's existing pages use. Either way, ship both if the site has a switch.

A dark-mode accent may be a lighter step of the brand hue when the exact brand colour fails 3:1 on the dark ground; say so in the report.

## 3. Rules

- **Minimal colour.** The palette is the accent plus tinted neutrals. Status colours (`--ok`, `--warn`, `--bad`) appear only as a 6–8px dot beside a word, never as a filled pill, a coloured row or a red-to-green scale. The light field is barely tinted (chroma 0.02 or less): if someone looking at the page would describe its colour, it's too strong. If a screen shows a third hue anywhere bigger than a dot, cut it.
- **Accent sparingly.** In any one screen the accent covers a small fraction of the area: the primary action, the selected state, one or two marks. A warm or loud brand colour (orange, red, yellow) gets fewer places still. If the first impression of a screen is the accent colour, pull some out.
- **Three text colours** (`--strong`, `--text`, `--muted`) plus the accent where allowed. No opacity on text. Each at least 4.5:1 on `--bg`, on `--glass` over the brightest part of the light field, and on `--fill`.
- **The accent goes** on the primary action, selected states, switches that are on, focus rings, the one highlighted data mark, and links if the brand colours them. Not on backgrounds, decoration or large areas.
- **Flat, never recessed.** Inputs, tracks, wells and chips are `--fill` with no inset shadow and no border at rest. Depth comes from glass floating above, never from wells pressed into the page.
- **Hairlines** use `--rule`.
- **Value scales** (heat, likelihood, intensity): `color-mix(in oklch, var(--strong) N%, transparent)` with N 25–100, always with the number beside it. Mark the container `data-scale`.
- **Gradients** only in the light field, the pointer sheen on glass, and the grain. Never on buttons, text or panels.
- **Radius:** a nested element's radius is the outer radius minus the padding between them. A child's radius is never larger than its parent's.

## 4. The light field

Glass is only glass when something lit sits behind it. Over a flat grey ground it reads as a plain white box. So the ground gets light: two or three large, soft patches built from the brand hue at very low chroma (plus one near-white), fixed behind the page, drifting very slowly. The light should be hardly perceptible: the page feels lit and alive, but nobody would call it blue or orange. The texture comes from the grain over it, not from colour.

```css
.light { position: fixed; inset: -20vmax; z-index: -2; pointer-events: none; overflow: hidden; }
.light i { position: absolute; width: 80vmax; height: 80vmax; border-radius: 50%; }
.light i:nth-child(1) { left: -5vmax; top: -12vmax; background: radial-gradient(closest-side, var(--light-a), transparent); animation: drift-a 38s ease-in-out infinite alternate; }
.light i:nth-child(2) { right: -6vmax; top: 26vmax; background: radial-gradient(closest-side, var(--light-b), transparent); animation: drift-b 46s ease-in-out infinite alternate; }
.light i:nth-child(3) { left: 22vmax; bottom: -22vmax; background: radial-gradient(closest-side, var(--light-c), transparent); animation: drift-c 52s ease-in-out infinite alternate; }
@keyframes drift-a { to { transform: translate(12vmax, 8vmax) scale(1.08); } }
@keyframes drift-b { to { transform: translate(-14vmax, -6vmax) scale(.94); } }
@keyframes drift-c { to { transform: translate(-8vmax, -12vmax) scale(1.1); } }
@media (prefers-reduced-motion: reduce) { .light i { animation: none !important; } }   /* !important: the nth-child rules above are more specific */
```

- Mark it `aria-hidden="true"` and `data-craft-light` (the audit skips it).
- Use `radial-gradient(closest-side, …)` rather than `filter: blur()`: same look, far cheaper.
- Drift is slow enough that nobody notices it moving (35–60s per leg), only that the page feels alive.
- Keep the field quiet behind dense data. On a tool page, the light can sit mostly behind the header and the hero and fade toward the working area.
- No purple-to-pink, no rainbow, no saturated blobs: that's the most recognisable AI look of the moment. The light belongs to the brand.
- **Check it:** in a capture, sample the strongest point of the light. Its chroma should be within about 0.02 of `--bg`. A visible coloured blob means turn it down.

## 5. Glass

```css
.glass {
  background: var(--glass); border-radius: var(--r);
  -webkit-backdrop-filter: var(--blur); backdrop-filter: var(--blur);
  box-shadow: inset 0 1px 0 var(--glass-edge), inset 0 0 0 1px var(--glass-rim), var(--glass-shadow);
  isolation: isolate; position: relative;
}
.glass.lit::after {   /* a soft light that follows the pointer */
  content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: -1;
  background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), var(--sheen), transparent 45%);
  opacity: 0; transition: opacity .3s var(--out);
}
@media (hover: hover) and (pointer: fine) { .glass.lit:hover::after { opacity: 1; } }
@media (prefers-reduced-transparency: reduce) { .glass { background: var(--glass-strong); -webkit-backdrop-filter: none; backdrop-filter: none; } }
@supports not (backdrop-filter: blur(1px)) { .glass { background: var(--glass-strong); } }
```

- **Where glass goes:** chrome and floating objects: the nav (a full-width bar across the top), panels and cards, the featured result, menus, popovers, toasts, sheets, the segmented control's thumb, secondary buttons. **Not** on long reading text (articles, docs), and not on a table so long the light can't be seen through it (use `--glass-strong` there).
- **Readable first.** Text on glass must pass 4.5:1 over the *brightest* point the light field can put behind it (light theme) or the darkest (dark theme). Raise the glass opacity until it does; never lower the text contrast.
- **Cost.** Each `backdrop-filter` is a GPU pass. At most about three blurred layers overlapping at once (nav + panel + menu is fine); never blur every row or every card in a long grid. Lighter blur (12–16px) on phones.
- The bright top rim (`--glass-edge`) and the 1px ring are what make it read as a pane rather than a fog. Don't drop them.

## 6. The grain

Grain is a signature of this system, not a whisper: a grainy gradient, like light on film or risograph paper. **It belongs to the background only.** It sits on the ground and the light field, behind every element, and never on top of text, buttons, glass, inputs or anything else on screen: those stay perfectly clean. It makes the muted light read as texture rather than colour, and hides banding. Glass may show the grainy background blurred through it; that is the background, not grain on the glass.

```css
.grain {
  position: fixed; inset: 0; z-index: -1; pointer-events: none;   /* above the light field (-2), below every element */
  opacity: var(--grain-opacity); mix-blend-mode: overlay;
  background-size: var(--grain-size);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='linear' slope='1.4'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

- One layer, still (never animated), `aria-hidden`, `data-craft-light`, behind all content: never a fixed overlay with a high z-index, never `::after` on `body` above the page. Clearly visible on the open ground at a glance: overlay at 0.55–0.75.
- Check a 3x zoom of body text, a button and a glass panel: none of them may show speckle. If they do, the grain is above them; move it behind.
- Grain is strongest where the light is: that's the grainy-gradient look. Large soft areas of the ground (the hero, empty space) are where it shows.
- A blend mode only blends with what's in the same stacking context; keep the grain a direct child of `body`.

## 7. Browser surfaces

Set these per theme; they separate a finished product from a styled page.

```css
:root { accent-color: var(--accent); }
::selection { background: color-mix(in oklch, var(--accent) 28%, transparent); color: var(--strong); }
input, textarea { caret-color: var(--accent); }
html { scrollbar-color: var(--fill-hover) transparent; }
a { text-underline-offset: 3px; text-decoration-thickness: 1px; }
.num, td, [data-num] { font-variant-numeric: tabular-nums; }
```

Plus `<meta name="theme-color">` matching `--bg` per theme (two metas with `media`), `color-scheme` on the root, and explicit colours on `<select>` and its options in dark themes.

## 8. Moving an existing site onto the tokens

- Replace tokens in the site's theme layer first (CSS variables, Tailwind theme, design tokens) so components inherit them. Then hunt every hard-coded colour, radius and shadow; `audit.mjs` lists each distinct value with an example element.
- **Inset shadows** on inputs, tracks and wells (`box-shadow: inset …`) all go. Replace with `--fill`.
- **Tailwind v4:** utilities read CSS variables at use time (`--color-neutral-500`, `--radius-lg`), so a scope can remap the palette for a whole subtree. Unlayered CSS (modules, plain stylesheets) beats layered utilities regardless of specificity, which is useful and also how overrides leak: scope remaps to a class only the redesigned page carries.
- **CSS modules rename ids and classes.** `:not(#market *)` inside a module matches nothing; write `:not(:global(#market) *)`.
- **Shared components:** before restyling one, grep every page that renders it and add those pages to the blast radius.
