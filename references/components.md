# Components

Every component shares five genes: token colours, the radius family, one surface (ground, glass or fill), the glass shadow or none, and the motion tokens. For anything not listed, find the closest entry and inherit its rules. `assets/specimen.html` has a working version of each.

Each entry ends with its **states**. A component isn't done until every state listed is built and captured.

## Contents
Buttons and links · Icon buttons · Segmented controls and tabs · Inputs, search, selects · Switches, checkboxes, radios, ranges · Chips and status · Tables, lists and feeds · Featured result · Cards, features, comparisons · Accordions and FAQs · Charts and data · Navigation · Menus and popovers · Tooltips · Modals and sheets · Toasts · Empty, loading, error · Footer

## Buttons and links

- **Primary:** `--accent` fill, `--on-accent` text, radius `--r-ctl` (a defined soft corner, not a pill), height 42 (34 compact, 44 on touch), padding 0 18px, weight 500. **Depth comes from below:** a firm 1px shadow along the bottom edge in a darker step of the accent (`0 1px 0 color-mix(in oklch, var(--accent), black 30%)`), a small contact shadow and a soft shadow tinted with the accent (`0 6px 16px -6px color-mix(in oklch, var(--accent) 60%, transparent)`). No highlight line on the top edge: it reads as odd, not as depth. One primary per view.
- **Secondary:** `--glass-strong` with the 1px rim and `--press-shadow` underneath (no top highlight), `backdrop-filter: blur(14px)`, `--strong` text, same size and shape.
- **Press:** the button sinks into its shadow: `translateY(1px) scale(.97)` and the shadow shrinks to `--press-shadow-down` in 80ms; on release it springs back. Dragging off before release cancels.
- **Quiet:** text only, `--fill` on hover.
- **Links:** follow the brand. Brand-coloured links use `--accent` and underline on hover; otherwise links are `--strong` with a 1px underline in `--muted`, solid on hover. Arrows inside buttons nudge 3px on hover on `--spring`.
- Labels say what happens ("Save changes", "Track a shipment"), not "OK" or "Submit". A label that opens something further ends in "…".
- Loading keeps the width: spinner after 150ms, then a drawn check and the past tense ("Saved") for about 1.5s, then back. `aria-busy` / `aria-disabled` while busy.

**States:** rest; hover (lift 1px with the shadow growing slightly, accent-hover fill; only under `(hover: hover) and (pointer: fine)`); press (sinks into its shadow in 80ms, spring back on release); focus-visible (2px accent outline, 3px offset, following the corner); disabled (`aria-disabled`, 40% opacity, no motion, handler guarded); loading; success.

## Icon buttons

40px circle (44 on touch), transparent, `--fill` on hover, icon 18px. Press `scale(.92)` with spring back. Always an `aria-label`. One icon set, one stroke width, optically centred.

**States:** rest, hover, press, focus-visible, on (`--fill-hover` fill, icon `--strong`, `aria-pressed="true"`), disabled.

## Segmented controls and tabs

- **Segmented:** a flat track (`--fill`, `--r-ctl`, padding 3px) and a **glass thumb** (`--r-sm`) (`--glass-strong`, top edge, small shadow) that slides on `--spring` over about 550ms and settles with a slight overshoot. Active label `--strong`, inactive `--muted`. Counts inside in 12px `--muted`; when a count changes it slides in. Labels never change weight. Arrow keys move the selection (`role="radiogroup"` + `radio`, or `tablist` + `tab`).
- **Page tabs** without a track: text buttons, `--muted` to `--strong`, a 2px `--accent` underline that slides on `--spring`. Selected state in the URL.

**States:** rest, hover, press, focus-visible (on the segment), selected, disabled segment.

## Inputs, search, selects

- Flat `--fill`, `--r-ctl`, height 42 (44 on touch), **no border and no inset shadow**. Hover: `--fill-hover`. Focus: the field turns to `--glass-strong` and gets a 2px accent ring plus a soft 4px `--accent-soft` halo, over 250ms `--out`. Phone font size at least 16px.
- Label above in 13–14px `--muted`, linked with `for`. Placeholder is an example, never the label.
- Help and error text below in 13px; errors say how to fix it and set `aria-invalid` and `aria-describedby`. Validate on blur or submit. An invalid field gives one short shake (3 × 4px, 300ms) on submit.
- Search: a leading icon, a `/` keycap at rest, a clear button once there's text, results filter as you type with rows re-entering on a 30ms stagger.
- Selects match inputs, with a chevron; their menus are glass overlays.

**States:** rest, hover, focus, filled, disabled, read-only, invalid, loading (a spinner inside after 150ms).

## Switches, checkboxes, radios, ranges

- **Switch:** 46×28 pill track in `--fill-hover`; a white knob (22px) with a small two-layer shadow. On: the track fills `--accent` and the knob slides on `--spring` (500ms). While pressed the knob widens to 28px (the squish). Applies at once. Label is the row text (`aria-labelledby`).
- **Checkbox:** 22px, `--r-sm`, `--fill-hover` off; on, `--accent` with an `--on-accent` check that draws itself (dash offset, 350ms). Press scales the box to 0.88. Label and box share one target.
- **Radio:** 22px circle, same treatment, an inner dot that pops on `--spring`.
- **Range:** 4px `--fill-hover` track, `--accent` fill, a 22px white thumb with the knob shadow that grows to 26px while dragged; value shown beside it and rolling.

**States:** off, on, mixed (checkbox), hover, press, focus-visible, disabled (on and off).

## Chips and status

- Status is a word with a 6–8px dot in the status colour, on a `--fill` chip (`--r-sm`, height 24–26, 13px, `--text`). Never a chip filled with the status colour, never coloured text for status.
- When status changes, the chip pops (scale from 0.6 on `--spring`).
- Tags that only decorate are cut.

## Tables, lists and feeds

- One glass panel per list (`--glass`, or `--glass-strong` for long lists). Rows are separated by `--rule` hairlines inset from the panel edge; on hover a row gets `--fill` with `--r-in` corners and the hairlines either side fade out.
- Row height 52–64px. Primary cell `--strong` 500 (IDs and codes may be `--mono`), a 13px `--muted` subline; the key metric `--strong`, tabular, right-aligned; secondary metrics `--muted`.
- Header 13px `--muted`, sentence case; sortable headers are buttons that show their direction.
- Progress and value bars: 4px `--rule` track, `--accent` fill for the live ones, `--muted` at 45% for finished ones. They grow in once on load (scaleX from 0, staggered).
- Row actions: secondary glass buttons (small), also reachable by keyboard and visible on touch.
- Load: rows rise 8px and fade in, staggered 45ms, on first load only.
- Phones: rows become stacked blocks inside the same panel (ID and status on one line, then the detail, then the bar, then the action), still split by hairlines. Never a stack of separate cards.
- Long names truncate with an ellipsis and the full text available; flex children get `min-width: 0`.

**States:** loading (skeleton rows at the real height in `--fill`, no shimmer), empty (a sentence, why, one action), no results (say what was searched, offer to clear), error (what happened, Try again), one row, many rows, a very long name, hover, expanded, selected, row action focus, an action completing (chip pops, small celebration if it's a milestone, toast with Undo).

## Featured result

The hero object: the top pick, the live item, the answer. Glass with `.lit` (pointer sheen) and, on desktop, the gentle tilt. Inside: what it is (with its ID or name), a live status, the signature visual (a route, a sparkline, a gauge) that draws in on load, one big number in the display weight that rolls into place, and two or three supporting facts on a hairline. It uses the same names and numbers as the list below it.

**States:** loading (the real layout, number area in `--fill`), no result (say why), updated (the number rolls), hover (sheen and tilt).

## Cards, features, comparisons

- Features: one glass panel split into cells by hairlines (not six separate cards), each cell with a 15–17px 500 title, a `--muted` sentence and a small worked example of the feature in a `--fill` well. Or text on the ground with a hairline on top when there's no example to show.
- **Repeated items are one size.** Quotes, testimonials, plan cards, stat tiles: every sibling gets the same type size, padding and shape. Featuring one means placing it first or giving it more width, never making its text several times bigger than its neighbours.
- Comparisons (plans): one glass panel, columns, rows aligned across columns. The recommended column has the primary button; others secondary. No "Most popular" ribbons in colour; a `--muted` line is enough.

## Accordions and FAQs

One glass panel per group, hairline rows, the question in `--strong` 500, a chevron that rotates on `--spring`, the answer fading in over 250ms at a reading measure in `--muted`.

**States:** closed, hover, focus-visible (inset ring), open, a long answer with links.

## Charts and data

Inside a glass panel. The one mark that matters in `--accent`; context marks in `--strong` at 25–40%; gridlines `--rule`. State the answer in one sentence above the chart. Bars grow and lines draw once on load (600–1200ms `--out`); hover or focus a mark to see its exact value in a glass tooltip. Announce only the final value.

**States:** loading, no data, one point, hover/focus on a mark.

## Navigation

A **full-width bar across the top**: glass (`--glass-strong` once content scrolls under it, near-transparent over the hero), `position: sticky; top: 0`, a `--rule` hairline below that fades in on scroll, content aligned to the page's own column. **Not a floating pill:** a rounded capsule floating over the page is the stock look of this style, owners notice it, and it fights the brand's own header. Keep the site's existing nav pattern when it has a good one. The wordmark left in the brand's own lettering and colour, 3–5 links in `--muted` (current `--strong` on a `--fill` chip, `--r-sm`), the theme toggle if the site has themes, then account. At most one primary button. Set `scroll-padding-top`. Phones: links collapse into a menu button that opens a glass sheet (focus trapped, Esc closes).

## Menus and popovers

Glass (`--glass-strong` so text stays crisp), `--r`, padding 6px; items 36px tall with `--r-in` corners and `--fill` hover. Enter from opacity 0 and `scale(.96)` on `--spring-soft` over 300ms, `transform-origin` at the trigger; exit in 150ms `--out`. Opened by keyboard: no animation. Arrow keys, Enter, Esc returns focus to the trigger.

**States:** closed, open, item hover, item focus, item disabled, item selected (a check), long list (scrolls inside, `overscroll-behavior: contain`).

## Tooltips

Supplementary only. 13px, `--glass-strong`, `--r-sm`, max about 32ch. After about 500ms on hover, immediately on focus; neighbours open instantly for 300ms after one closes. Esc closes. Not on disabled controls.

## Modals and sheets

Glass panel at `--glass-strong`, radius 20–24px, on a scrim of `color-mix(in oklch, var(--bg) 55%, transparent)` with `backdrop-filter: blur(8px)`. Enters from `scale(.96)` and opacity on `--spring-soft` (about 500ms), exits in 200ms. Focus trapped and returned; Esc closes; page behind inert; scroll locked without layout shift. Phone sheets slide up on the drawer curve and dismiss on a flick.

## Toasts

A glass card (`--r`), inverted for contrast (`--strong`-ish at 82% with blur, `--bg` text), bottom centre above any sticky bar. Springs up from below (600ms `--spring`), 4–6 seconds, paused on hover and focus, errors stay until dismissed. Undo for anything reversible, and Undo returns focus to where the action was. An always-mounted `role="status"` region announces it.

## Empty, loading, error

- **Empty:** a destination. One `--strong` sentence on what will be here, one `--muted` sentence on how to get it, one primary action. A first-run or all-done empty state is a delight moment: the signature visual in a quiet pose, a small line of warmth.
- **Loading:** the real layout with `--fill` placeholders the same size as what replaces them; values roll in when they arrive. Show nothing for the first 150–300ms; once shown, keep 300ms+.
- **Error:** a plain sentence on what happened and whether data is safe, what to do, Try again. Keep what was already on screen.
- **Stale or offline:** say how old the data is, where the data is.

## Footer

On the ground, a hairline on top, the wordmark and © left, text links right in `--muted`.
