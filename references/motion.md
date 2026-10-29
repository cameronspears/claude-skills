# Motion and joy

Motion is where these interfaces come alive. The goal is software that feels magical and human: like you're touching it, not operating it. Things behave like physical objects with a little weight and a little spring: a button that sinks under your finger, a thumb that slides and settles with a small overshoot, a switch that stretches when you press it, a sheet you can grab and flick, a number that rolls into place, glass that catches the light under your pointer, a route that draws itself. Joy is a requirement here, not a garnish. A page that only fades in on load has failed this skill, and so has a page whose motion was only ever judged from still screenshots.

Joy never slows a task down, never hides information, and respects reduced motion.

## The frequency rule

Decide every animation by how often it's seen. Frequent things still respond (that's what makes them feel good), they just don't make you wait.

| How often | Treatment | Examples |
| --- | --- | --- |
| Many times a minute, or by keyboard | Instant result; a response under 150ms that never blocks | Typing, list navigation, row hover on, menus opened by keyboard |
| Many times a day | A spring under 400ms that you can interrupt | Press squish, switches, segmented thumb, tabs, chips changing, counts ticking |
| Occasionally | Considered, 300–700ms | Popovers, sheets, a row expanding, a value updating, Save → Saved |
| Rarely or a milestone | A real moment, up to about 1.2s, never blocking | First load of the hero, a first success, marking something done, an empty list cleared |

Anything that still feels good the hundredth time passes. Anything that would annoy by the tenth time comes out.

## Values

| Token | Value | For |
| --- | --- | --- |
| `--spring` | `linear(0, .013 .6%, .05 1.2%, .2 2.5%, .43 4.1%, .72 6.3%, .94 8.6%, 1.06 10.7%, 1.11 12.7%, 1.12 14.3%, 1.1 16.4%, 1.05 19.6%, 1.01 23%, .99 27%, .995 34%, 1.002 45%, 1)` | Things that move and settle: thumbs, knobs, presses releasing, toasts, chips popping, digits rolling. About 12% overshoot. Durations 350–700ms (the curve settles early, so long durations still feel quick). |
| `--spring-soft` | `linear(0, .06 4%, .24 9%, .53 16%, .83 25%, 1.01 34%, 1.04 41%, 1.03 49%, 1.005 62%, 1)` | Bigger objects: sheets, modals, the featured card arriving. |
| `--out` | `cubic-bezier(.23, 1, .32, 1)` | Fades, colour, opacity, drawing lines, anything without a physical object. |
| Drawer curve | `cubic-bezier(.32, .72, 0, 1)` | Phone sheets and drawers. |
| Hover, colour | 150ms `--out` | Fills, text colour. |
| Press | 80ms down (`translateY(1px) scale(.97)`, the bottom shadow compresses), release on `--spring` 350ms | Buttons, icon buttons, checkboxes. |
| Drag release | A JS spring carrying the pointer's velocity (stiffness 380–500, damping 30–40) | Sheets, sliders, swipeable rows, anything you can grab. |

- **Springs on objects, ease-out on light.** If it's a thing that moves (a thumb, a knob, a card, a toast), it springs. If it's colour, opacity or a line drawing, it eases out.
- **Never ease-in** on anything entering or responding. Linear only for spinners and progress.
- **Exits are quicker** than entrances (about 70%) and leave the way they came.
- **Enter from** opacity 0 with `scale(.96)` or `translateY(8px)`. Never from `scale(0)`.
- **Origin:** popovers, menus and tooltips grow from their trigger. Only modals scale from the centre.
- **Interruptible:** use transitions (not keyframes) for anything that can be toggled mid-way, so it retargets. Input never waits for an animation.
- **Animate** `transform`, `opacity`, `clip-path` and `filter` only. Never `transition: all`; never width, height, top or left (a slider thumb moves with `transform`, sized with `width` only when its target changes size, as the specimen does).
- **Stagger** 30–60ms between items, at most about 8 items, on first load only.
- **Hover** inside `@media (hover: hover) and (pointer: fine)`, so taps don't leave stuck hovers.

## Reduced motion and transparency

```css
@media (prefers-reduced-motion: reduce) {
  .light i, .live::after { animation: none !important; }    /* drifting light and pulses stop; !important beats more specific rules like .light i:nth-child(1) */
  *, *::before, *::after {
    animation-duration: .01ms !important; animation-delay: 0s !important;
    transition-property: opacity, color, background-color, border-color, box-shadow !important;
  }
}
```

- Under reduced motion: no drift, no tilt, no parallax, no springs, no sparks; counters show their final value; colour and opacity fades stay (they help orientation).
- Script-driven motion checks `matchMedia('(prefers-reduced-motion: reduce)')` and skips itself.
- `prefers-reduced-transparency: reduce` turns glass opaque (`references/tokens.md`, Glass).
- Anything that moves for more than 5 seconds and draws the eye needs a pause control. The slow light drift is exempt (it's ambient and stops under reduced motion); a looping hero animation is not.

## Touch: making it feel physical

CSS springs make things *move* nicely. Touch is what makes them feel *real*: the interface responds to the hand continuously, not just at the end of a click.

- **Direct manipulation.** Anything that can be dragged follows the pointer or finger exactly (1:1, no easing, no lag) while held. On release it continues with the pointer's velocity into a spring toward where it should settle. A sheet flicked down closes even if it only moved 40px; dragged slowly halfway, it snaps back. Use Pointer Events with `setPointerCapture`, `touch-action` set for the axis, and the spring helper below.
- **Rubber-banding.** Past an edge (a slider's end, a sheet pulled up past full, a list pulled past its top), movement continues at a fraction of the pointer's (`d * 0.55 / (1 + d / 400)`), and springs back on release. Never a hard stop.
- **Press depth.** Buttons have a shadow underneath (`references/components.md`) and sink into it on press: `translateY(1px)` and a smaller shadow in 80ms, then spring back on release. A press that's dragged off the button cancels and springs back without firing, like iOS.
- **Pointer awareness.** Glass panels carry a soft sheen at the pointer. The one hero object tilts toward the pointer (at most 4–6°). The single most important call to action may lean 2–4px toward a near pointer (a light magnetic pull). Never more than one magnetic thing per screen, and none on dense tool surfaces.
- **Continuous feedback while held.** Long-press fills a ring; a slider shows its value growing with the thumb; a drag-to-reorder row lifts (scale 1.02, a larger shadow) and its neighbours slide aside on `--spring` as it passes.
- **Gestures on phones.** Where the product has a natural one, support it: swipe a row to reveal its action (with a threshold that snaps), pull a sheet down to dismiss, swipe between tabs. Always with a visible button doing the same job.
- **Interrupt anything.** Grabbing an object mid-animation catches it where it is and keeps its velocity. Clicking a toggle twice fast reverses smoothly. Nothing ever waits for an animation to finish.
- **Instant first response.** Something visibly reacts within one frame of pointer-down (press depth, a highlight), even when the result takes longer.

A small spring for drags and anything that must carry velocity (CSS `linear()` springs can't take a starting velocity):

```js
// Animates value -> to with a damped spring, starting at velocity v (units per second).
// Returns a stop() so a new grab can interrupt it.
function spring({ from, to, v = 0, k = 420, c = 34, onUpdate, onDone }) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { onUpdate(to); onDone?.(); return () => {}; }
  let x = from, raf, last = performance.now();
  const step = (now) => {
    const dt = Math.min(0.032, (now - last) / 1000); last = now;
    v += (-k * (x - to) - c * v) * dt; x += v * dt;
    if (Math.abs(v) < 2 && Math.abs(x - to) < 0.3) { onUpdate(to); onDone?.(); return; }
    onUpdate(x); raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}
// Velocity: keep the last ~80ms of pointer samples and divide distance by time on release.
```

## Feel it, don't just look at it

Motion can't be judged from a still. Before calling motion done:

1. **Use it yourself** on the live page, at desktop and phone widths: press every kind of button, flip switches quickly back and forth, grab and flick anything draggable, open and close menus by mouse and by keyboard, trigger the signature moment twice.
2. **Capture frames.** For the signature moment, a press, a toggle, a drag release and a toast, add a state with `"frames"` to `states.json` (`scripts/capture.mjs` header) and look at the sequence: does it overshoot slightly and settle, or stop dead? Does anything jump, flash or move the layout? Does the stagger read as one gesture?
3. **The hundredth time.** Repeat a frequent action ten times quickly. If anything feels slow, blocks the next input or gets annoying, shorten or cut it.
4. **Give the owner something to touch.** In the report, link a page they can use (a dev URL, a preview or a published artifact), not only screenshots. Screenshots can't show any of this.

## The joy kit

Pick from these in the direction card, adapted to the product's own world. Name each with its trigger and timing. A typical page has 5–8 of them; the specimen has all of them.

- **The thumb that settles.** Segmented controls, tab indicators and switch knobs slide to the new place on `--spring` and overshoot slightly.
- **The squish.** Buttons sink into their bottom shadow (`translateY(1px) scale(.97)`) in 80ms and spring back on release. Switch knobs widen while held (22px → 28px) and snap across on release; drag a knob and it follows, then snaps to the nearer side.
- **Grab and flick.** Sheets, drawers, sliders and swipeable rows follow the finger 1:1 and settle with the release velocity; past their edge they rubber-band.
- **Glass that catches the light.** A soft radial sheen follows the pointer on glass panels (`.glass.lit`). On the one hero object, a gentle 3D tilt toward the pointer (at most 6°), springing flat on leave.
- **Numbers that roll.** Key figures roll their digits into place like an odometer (each digit a column of 0–9, translated, staggered 60–90ms); counts tick with a short slide when they change.
- **Lines that draw.** Routes, charts and progress draw in once on load (`stroke-dashoffset`, 1–1.5s `--out`), and the moving dot springs into place.
- **Things that pop.** A chip or badge that changes state scales from 0.6 on `--spring`. A check mark draws itself (dash offset) when a checkbox turns on or Save succeeds.
- **The small celebration.** Completing a meaningful action (mark done, publish, a first success) throws a short burst of 12–16 small dots in the accent and neutrals from the button, 700–1000ms, never blocking. Rare actions only.
- **Morphing buttons.** Save → spinner (after 150ms) → drawn check "Saved" → back, keeping its width.
- **Theme as light.** The theme switch grows the new theme from the button as a circle (`document.startViewTransition` plus a `clip-path` animation on `::view-transition-new(root)`), 600–700ms.
- **Toasts that arrive.** Glass toasts spring up from the bottom edge and leave the way they came; they offer Undo for anything reversible.
- **A live pulse.** One status that's genuinely live (a ship on time, a feed updating) gets a soft expanding ring on its dot. One per page.
- **Keyboard shortcuts taught in place.** Keycaps (`--fill`, `--r-sm`, 12px mono) beside actions; `/` focuses search.

Each page also gets **one signature moment**: the thing someone would screen-record and send to a friend. Name it in the direction card, give it the most care, and make it about the product (a route that draws, a ledger that settles), not a generic effect.
