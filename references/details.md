# The detail pass

Eighty finishing details, each with how to check it. ★ marks the ones machine-made interfaces most often get wrong: do those every time. `audit.mjs` covers the items marked (audit). For the rest, check the code, the state captures or the 3x zooms.

Sources: Vercel Web Interface Guidelines, Rauno Freiberg, Emil Kowalski, Apple HIG, Josh Comeau, Linear, Stripe, Radix, Every Layout, Utopia, WCAG 2.2 (see `review.md`, Sources).

## Typography
1. Display type follows a size table: normal tracking by default; if the typeface looks loose at 32px+, tighten a little per size (about −0.01em at 32px to −0.02em at 64px), never ad hoc. Body stays at 0. *Check:* every letter-spacing value maps to a size in the table (audit lists them).
2. Measure 60–72ch for prose, 45ch minimum. *Check:* paragraph width ÷ width of "0".
3. No weight under 400 below 18px; light weights only at display sizes. (audit WARN)
4. Weight never changes on hover or selection; neighbours would shift. *Check:* hover and select tabs in the state captures; widths stay put.
5. `text-wrap: balance` on headings, `pretty` on paragraphs; no one-word last lines. *Check:* zooms of every heading at every width.
6. Real punctuation: curly quotes and apostrophes, …, en dash in ranges, non-breaking space between number and unit ("10 MB", "⌘ K"). *Check:* grep the copy for `'`, `"`, `...`, ` - `.
7. Line-height 1.5–1.6 for body, 1.05–1.2 for display; tight leading only on one-line text.
8. Body 16px or larger; nothing under 12px. (audit)
9. Fluid sizes use `clamp()` with a rem term, so zoom still scales them; max no more than 2.5× min. *Check:* 200% zoom roughly doubles text.

## Numbers and data
10. ★ `font-variant-numeric: tabular-nums` on prices, tables, timers, counters, anything compared or updating. (audit WARN)
11. Numeric columns and their headers right-aligned; one decimal rule per column (money 0 or 2, never mixed).
12. Format with `Intl.NumberFormat` / `DateTimeFormat`; pluralise properly ("1 item", not "1 items").
13. Relative times only for recent events ("5 min ago"); an absolute date after about a week. On cached pages, work relative times out in the browser.
14. Never meaning by colour alone: a sign, word or icon too. *Check:* a greyscale screenshot still reads.
15. Large numbers rounded where precision doesn't matter (41K, not 41,236), exact where it does (prices you'll type).

## Layout and alignment
16. One spacing scale; every padding, margin and gap is on it. *Check:* grep for off-scale pixel values.
17. Everything on a shared edge: stacked blocks' left edges within 0.5px; text in a panel aligns with text outside it where they stack. *Check:* zooms at 400%.
18. Icon and text pairs: the icon centred on the text's line box, stroke weight matched to the text weight. *Check:* zooms.
19. ★ Concentric corners: a child's radius = the parent's radius minus the padding between them; never larger than the parent's. (audit lists radii)
20. Survives short, average and very long content: `min-width: 0` on flex children, ellipsis with the full text available, `flex-shrink: 0` on icons and avatars. *Check:* a state capture with an 80-character name.
21. Separate with space first, then tint, then a hairline; at most one divider style per panel.
22. Sticky headers set `scroll-padding-top` to their height, so anchors land below them.
23. Fixed bars respect `env(safe-area-inset-*)`.
24. More space above a heading than below it; the heading belongs to what follows.
25. One centred moment per page at most; everything else on one left edge.

## Colour, depth and shape
26. Colour steps built in OKLCH (or Lab), so a step has the same perceived lightness across hues.
27. ★ Text 4.5:1 (3:1 at 24px+ or bold 18.7px+); icons, input edges and focus rings 3:1. Muted labels and placeholders fail most. (audit for text)
28. On a tinted surface, secondary text, hairlines and shadows lean toward that surface's hue, not neutral grey.
29. ★ Shadows in two or three layers (a tight contact shadow and a soft ambient one), one light source above, positive y, negative spread; higher means bigger and softer. Never one `0 0 20px` glow. (audit counts)
30. Glass surfaces carry a 1px rim and a bright inset top edge; text on glass passes 4.5:1 over the brightest light behind it; no inset shadows on inputs, tracks or wells.
31. Dark themes: `color-scheme: dark`, a `theme-color` meta matching the background, explicit colours on `<select>`.
32. Translucency only where what's behind matters, and never under body text.
33. Images carry a 1px inset outline at low alpha so light images don't bleed into light grounds.

## Controls and interaction states
34. ★ Every control has rest, hover, press, focus-visible and disabled states, plus selected and loading where they apply, each visibly different, each more contrasted than rest. *Check:* zooms in each state.
35. ★ Press: `scale(0.97)` (0.95–0.98) or a 1px sink, over 100–160ms. *Check:* press zooms.
36. ★ Hover styles inside `@media (hover: hover) and (pointer: fine)`. *Check:* grep `:hover` outside it.
37. Frequent hovers (rows, nav) appear instantly and fade out over about 120ms; no `transition: all`.
38. ★ Focus ring on `:focus-visible` only: 2px outline, 2px offset (inset where clipped), 3:1 against its surroundings, following the radius; outline, not a box-shadow alone (shadows vanish in forced-colours mode). (audit Tab walk)
39. ★ Loading buttons keep their label and width, add a spinner, and set `aria-busy`.
40. Don't disable submit pre-emptively; no tooltips on disabled controls; `aria-disabled` when the reason matters.
41. Selected and current items use an indicator, not a weight change, plus `aria-selected`, `aria-current` or `aria-pressed` matching what's shown.
42. No dead zones: anything that looks clickable is, and list items touch (padding, not margin).
43. Navigation is `<a href>` (so ⌘-click works); actions are `<button>`.
44. `touch-action: manipulation` on controls; a deliberate `-webkit-tap-highlight-color`; `user-select: none` only on control labels.
45. Destructive actions offer Undo or a confirmation and are never the default button.

## Forms and inputs
46. Inputs 16px+ on phones; zoom never disabled in the viewport meta.
47. Visible labels linked to their fields; placeholders are examples ending in "…".
48. `type`, `inputmode`, `autocomplete` and `name` set; spellcheck off for emails, codes and usernames; `one-time-code` on code fields.
49. Never block paste; validate on blur or submit; errors beside the field with `aria-invalid` and `aria-describedby`; focus the first error on submit.
50. Enter submits single-field forms; ⌘/Ctrl+Enter submits a textarea.
51. A checkbox or radio and its label are one target at least 24px tall.
52. Warn before leaving with unsaved changes.

## Overlays, menus, tooltips, toasts
53. ★ Popovers, menus and tooltips grow from their trigger; only modals scale from the centre. *Check:* the open state capture; computed `transform-origin`.
54. Enter from opacity 0 and scale 0.96, never `scale(0)`; tooltips 120–200ms, menus 150–250ms; exits faster, the way they came.
55. ★ Tooltips: a delay on the first one, then neighbours open instantly for about 300ms; show on focus; Esc closes; the pointer can move onto them; nothing interactive inside; never the only place information lives.
56. Menus used constantly, or opened by keyboard, appear without animation; submenus keep a safe triangle.
57. Dialogs trap focus and return it to the trigger, close on Esc, make the page behind inert, and lock scroll without a layout shift.
58. Toasts: `role="status"`, about 4–6s, timer paused on hover and while the tab is hidden, errors stay until dismissed, never covering focus or a primary action.
59. Phone sheets use the drawer curve, dismiss on a flick, and only drag when scrolled to the top.

## Motion
60. ★ Animate `transform` and `opacity`; list properties explicitly. *Check:* grep transitions.
61. ★ Ease-out to enter and respond; ease-in-out to move across the screen; linear only for progress; never ease-in.
62. ★ Moving objects spring (`--spring`), colour and opacity ease out; press 80ms down and spring back; frequent actions never wait on an animation; keyboard-opened menus appear at once.
63. Interruptible: transitions over keyframes for toggles; toggle twice in 50ms and it ends in the second state without a jump.
64. Springs for gestures; no bounce by default.
65. Stagger 30–60ms, never blocking input; don't fade in every section on scroll.
66. ★ Reduced motion removes movement but keeps opacity and colour fades. (audit checks loops)
67. No transitions on theme switch or first paint; nothing loops by default.

## Feedback and states
68. ★ Loading, empty, sparse, dense, error and offline states designed for every data view, each with a next step. *Check:* state captures of each.
69. Spinners and skeletons wait 150–300ms before showing and stay at least 300ms once shown.
70. Skeletons match the final layout; no layout shift on swap.
71. Optimistic updates with rollback and an explanation when they fail.
72. Feedback where the action happened (a check beside Copy, an error beside the field); alerts only for the irreversible.
73. Specific labels ("Save key", not "Continue"); "…" for actions that open more and for progress ("Saving…"); errors say how to fix it.
74. Determinate progress when the length is known, indeterminate otherwise.

## Responsive and touch
75. Reflows at 320px with no page-level sideways scroll; wide tables scroll inside their own box. (audit)
76. ★ Targets 24×24 at least (or the spacing exception), 44×44 on touch; enlarge hit areas with padding or a pseudo-element, not by making icons bigger. (audit)
77. Every gesture has a tap or keyboard alternative.
78. `overscroll-behavior: contain` in drawers and menus; no autofocus on touch screens.

## Accessibility and the rest
79. A full keyboard path with arrow keys inside menus, tabs and listboxes; sticky bars never hide the focused element. (audit Tab walk and obscured check)
80. Icon-only buttons named; decorative icons `aria-hidden`; headings in order; a skip link; live regions polite; works at 200% zoom and in forced-colours mode.
