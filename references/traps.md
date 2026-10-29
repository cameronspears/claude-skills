# Known traps

Specific mistakes real runs made, grouped by the principle each one broke. They're examples of what "looks off" or "a bug" means, not the whole list: the next mistake will be one nobody wrote down, and the fresh-eyes look in `SKILL.md` exists to catch that. Read this file before the fresh-eyes look and the next mile, and search the code and captures for each pattern.

## 1. It works

| Look for | Fix |
| --- | --- |
| Something draggable that stops dead on release, or hard-stops at an edge | Release into a velocity spring; rubber-band past the edge. |
| A thumb, knob or handle that overshoots past its track or container (a real run's slider handle ran past its line) | Clamp the visible position; let the track stretch instead. Push every drag and spring to both extremes. |
| A press dragged off a button still firing | Cancel on pointer leave, spring back, like iOS. |
| Toggles that can't be clicked twice fast, or animations that block the next input | Transitions, not keyframes, for anything that can reverse; input never waits. |
| A spinner that flashes on fast responses | Delay 150–300ms; once shown, keep it 300ms+. |
| A loading button that changes width or loses its label | Keep the label and width; add a spinner. |
| `:hover` rules outside `@media (hover: hover) and (pointer: fine)` | Wrap them, so taps don't leave stuck hovers. |
| Restyling a shared class that changed another page | List the blast radius; render those pages before and after. |
| An edit that broke the build or the page (a CSS-modules rule, a missing import) | Reload the page after every change and read the console and server log. |

## 2. Nothing looks off

| Look for | Fix |
| --- | --- |
| Marks or icons in a column not centred under its heading. A real run's ticks sat 90px left because base styles set `svg { display: block }`, which ignores `text-align` | `display: inline-block` or flex centring; the audit's `align` check measures tables. |
| A row whose text sits higher or lower than its marks | One vertical padding and `vertical-align: middle` for every cell in the row. |
| A gap between groups of rows with no label | Label the group ("Only in Trader"), or remove the gap. |
| Different paddings on sibling controls, things not on a shared edge | One value from the scale; one left edge. |
| Icons not centred on their text, or mixed stroke widths | Align to the text's centre; one icon set, one stroke. |
| A one-word last line in a heading or paragraph | `text-wrap: balance` / `pretty`, or edit the copy. |
| Focus rings cut off at an edge, or hidden under a sticky bar | Inset the outline, or remove the clipping; `scroll-padding-top`. |
| One repeated item (a quote, a card) several times bigger than its siblings | Repeated items share one size. |
| An unbalanced first screen: headline in one corner, its copy floating in another | Judge the top 900px at 1440 and 812px at 375 as a poster. |
| Font weight changing on hover or selection | Change colour or an indicator instead. |
| Numbers in tables without `tabular-nums` | Add it; right-align the column. |
| Straight quotes, `...`, hyphens in ranges | “ ” ’, …, en dash. |
| Text over 75ch wide | Cap the measure. |
| Light text weight (<400) under 18px | 400 or heavier. |
| Grain speckling text, buttons or glass (a fixed overlay above the page, or `body::after` over it) | Grain belongs to the background only, behind every element; the audit's `grain` check catches it. |
| Glass that reads as a grey card | Put something behind it (content, a lit shape); see `references/magic.md`. |
| `color-scheme`, `theme-color`, `::selection`, `caret-color` unset | Set them per theme. |

## 3. Every state is designed and seen

| Look for | Fix |
| --- | --- |
| Only the resting page was ever rendered | Script every state (hover, press, focus, open menus, search results, tooltips, expanded rows, empty, loading, error, long content) and open every capture. |
| Full-page screenshots scaled down, hiding clipped rings and uneven padding | 3x zooms of every kind of control in every state. |
| Empty, error or loading states not built | Build them; add a query flag or temporary route to reach them. |
| Two states that look alike (selected vs hover, disabled vs rest) | Make each one distinct. |
| Motion never captured as frames | Add `"frames"` states and read them. |

## 4. It's a joy to use

| Look for | Fix |
| --- | --- |
| A page whose only motion is a fade on load, or motion too restrained to notice | The joy kit and touch plan (`references/motion.md`). |
| "Nice, not wow": everything correct, nothing anyone would show a friend | Name the wow moment and each section's plus (`references/magic.md`). |
| Motion judged from stills | Use it with a pointer and by touch; read motion frames; give the owner a live page. |
| A moving object on a plain ease (thumbs, knobs, toasts) | `--spring`. |
| `ease-in` on anything entering, or `scale(0)` | `--spring` or `--out`; enter from `scale(.96)` with opacity. |
| `transition: all`, or transitions on width/height/top/left/margin | List properties; animate `transform` and `opacity`. |
| Popovers and menus scaling from their centre | `transform-origin` at the trigger. |
| Restraint without substance: clean but bland | Replace removed ornament with real data, worked examples, scale. |
| Long-form copy on a product page | Short and sweet: a headline under 8 words, a line under 20, about 40 words of prose per section. |
| A restyle when the owner wanted an overhaul | Ask restyle or overhaul first (`SKILL.md`, step 2). |

## 5. The brand leads

| Look for | Fix |
| --- | --- |
| The brand faded out ("use colour sparingly" became no colour) | The brand is recognisable in the first screen at rest. |
| A brand rule treated as an open question ("recolour the mark only to ink or white") | Reread the brand files before calling something open. |
| A colour picked from the subject matter, or the accent swapped for one you prefer | Keep the brand's values exactly; ask when unclear. |

## 6. Accessible and honest

WCAG 2.2 AA everywhere; `audit.mjs` checks most of it.

- Text 4.5:1 (3:1 at 24px+ or bold 18.7px+); icons, input edges and focus rings 3:1. Text on glass is checked over the brightest (light theme) or darkest (dark theme) part of the light field.
- Focus: `outline: 2px solid` in the accent (lightened on dark grounds if needed for 3:1), `outline-offset: 2px`, following the radius, on `:focus-visible` only. Never `outline: none` with a box-shadow ring (forced-colours mode loses it).
- Real `<button>`, `<a href>`, `<label for>`. `aria-pressed`, `aria-selected`, `aria-current` match what's shown.
- Never meaning by colour alone: show the number or the word.
- Targets 24px minimum (WCAG 2.5.8), 44px on touch screens. Works at 320px wide with no sideways scroll.
- Reduced motion removes movement (drift, tilt, springs, sparks, rolling digits) but keeps opacity and colour fades. Reduced transparency makes glass opaque; `backdrop-filter` always has `-webkit-backdrop-filter` and that fallback.
- Generic labels (OK, Continue, Submit, Click here) say what happens instead: "Save key", "See its record".
- No made-up logo rows, testimonials or numbers presented as real.

## The house style's own traps

These break the owner's taste rather than quality in general (`SKILL.md`, House style):

| Look for | Fix |
| --- | --- |
| A floating pill-shaped nav bar | A full-width bar, or the site's own nav. |
| `border-radius: 999px` (or a pill) on buttons, inputs or chips | `--r-ctl` or `--r-sm`; pills only on switches and slider thumbs. |
| `inset 0 1px 0` highlights on buttons | A bottom shadow, sinking on press. |
| `box-shadow: inset` on inputs, tracks or wells | Flat `--fill`. |
| A light field whose colour you can name in a capture | Lower its chroma to about 0.015; let the grain carry the texture. |
| Glass over a flat ground with nothing lit behind it; glass on long reading text; blurring every card in a grid | Light behind the glass; the ground for reading; glass for chrome and a few objects. |
| A filled coloured status pill, coloured status text, a red-to-green scale | A `--fill` chip with a coloured dot and a word; intensity plus the number. |
| More than one accent hue, purple-to-pink or rainbow gradients, neon glows, gradients on buttons, text or panels | One accent; gradients only in the light field, the sheen and the grain. |
| Eyebrow labels, all caps, section numbering, middle-dot chains, decorative badges, serif or italic accent words, emoji as icons | Plain type and real content. |
| Animated grain | Grain is still. |
| One-layer `0 0 20px` shadows | Layered soft shadows from the token set. |
| Mixed radii, or the same radius on nested boxes | One radius family; a child's radius is the outer one minus the padding. |
| An accent that dominates the first impression, or a brand that only shows on hover | The accent in a few places, recognisable at rest. |

**Allowed with intent:** one centred moment per page; one simple diagram that explains a mechanism; mono for IDs and codes; a single live pulse; a small celebration on a rare, meaningful action.
