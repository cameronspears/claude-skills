# Exemplars

What the products people admire for craft actually do, in details you can reproduce. Values come from their live CSS and published design write-ups (researched October 2026); a few marked *unverified* couldn't be confirmed. These are for learning the moves, not for copying a look: the brand still leads.

## Contents
Linear · Vercel · Stripe · Apple product pages · Apple system apps · Raycast · Superhuman · Things 3 · Family · Mercury · Figma · Sonner · Apple Liquid Glass and visionOS · Arc and Raycast · Patterns across them

## Linear: dense, keyboard-first, calm
- Greys in steps rather than black and white: dark surfaces step #08090a → #0f1011 → #141516 → #191a1b; four text tiers (#f7f8f8, #d0d6e0, #8a8f98, #62666d); borders translucent white at 5–15%.
- Interface text 13–14px with a touch of negative tracking; in-between weights (510, 590) rather than 500/600.
- Hover highlights appear instantly and fade out over 150ms. Menus scale from 0.9 with a fade in 100ms; tooltips 120ms; dialogs from 0.96 in 175ms.
- Themes generated in LCH from three inputs (base, accent, contrast), replacing ~98 hand-set variables.
- 2026 refresh: the sidebar dimmed so content leads; fewer, softer dividers; smaller icons. Structure "felt, not seen".
- Hover a row and press a shortcut: the action applies to that row.

## Vercel (Geist): every step has one job
- Ten-step colour scales, each step named for its use: backgrounds (100–300), borders (400–600), high-contrast fills (700–800), secondary and primary text (900–1000).
- A 1px ring as the border, stacked with layered shadows with negative spread (a menu: `0 1px 1px` faint, `0 4px 8px -4px`, `0 16px 24px -8px`).
- Radius by surface: 6px for controls and tooltips, 12px for menus and modals, 16px for full-screen surfaces.
- Focus ring with a gap: a 2px ring in the background colour, then 2px of blue.
- Popovers 200ms; overlays 300ms from scale 0.96.
- Guidelines: spinner delay 150–300ms then at least 300–500ms on screen; first tooltip delayed, neighbours instant; tabular numbers; never `transition: all`; specific labels.

## Stripe: precise and friendly money screens
- Text is deep navy (#061b31), not black, with quieter tiers in blue-greys; borders #e5edf5.
- Light weight (300) for headings and body alike; tabular figures on numbers.
- Two-layer shadows with large negative spread; 6px is by far the most used radius.
- Optically centred buttons: 11.5px padding on top, 12.5px below.
- Colour built in CIELAB so any two colours five steps apart pass 4.5:1.
- Signature: the link arrow slides 6px right on hover over 300ms with `cubic-bezier(.25,1,.5,1)`, used across the site.
- Docs fill examples with the reader's own test key and data.

## Apple product pages: hierarchy through scale and restraint
- Tracking set per size: 80px headline at −0.015em; mid-display sizes (21–28px) at slightly *positive* tracking; body 17px with line-height 1.47.
- Few colours: text #1d1d1f, secondary #6e6e73; sections alternate light grey, white and black; one blue for actions.
- One house curve (`cubic-bezier(.4,0,.6,1)`) used hundreds of times.
- Joy: the global nav flyout fades items in from 4px above, staggered 20ms per item; on close they leave faster and in reverse.

## Apple system apps and HIG: settings with no Save
- Grouped lists separated by headers, footers and space; switches only in list rows, the row text being the label.
- Settings apply immediately; few settings, good defaults; never ask for what the app can detect.
- Default text 17pt on iOS, 13pt on macOS; hit regions 44pt.
- "Avoid adding motion to UI interactions that occur frequently." Context menus open with no animation; the chosen item flashes the accent, then the menu fades.

## Raycast: the keyboard surface
- ↵ runs the primary action, ⌘↵ the secondary; everything else in an action panel, each with its shortcut.
- Keycaps everywhere: 20px tall, 4px radius, 11px text.
- Dark surfaces with lit edges: panels get `inset 0 1px` white at about 10%; the window shadow pairs a dark hairline outside with a light one inside.
- One icon set, one stroke width.
- Joy: a confetti command any script can fire; the app icon is a keycap.

## Superhuman: speed as the design
- Every interaction within 100ms (target 50ms); likely next items prerendered.
- Shortcut hints shown where you'd click, teaching the faster way; ⌘K instead of menus.
- Joy: reaching Inbox Zero shows a full-screen landscape photo that changes over time.

## Things 3: a list that feels physical
- Tapping a to-do opens it in place as a card while the list fades back.
- The Magic Plus button: tap for a new item, or drag it to insert exactly where you drop it, or onto a day to schedule.
- Type anywhere to jump; no search box needed.
- Joy: a soft haptic pop when you pick something up (timings unverified).

## Family (wallet): motion that tells you where you are
- Each step is a sheet of a different height, so progress is felt; one job per sheet.
- Tabs slide in the direction of the tab; objects that persist stay put instead of being duplicated during a move.
- Text morphs: "Continue" becomes "Confirm", keeping the shared letters.
- The delight–impact curve: rarely used features get the most delight, daily ones only subtle touches.
- Joy: commas shift as you type an amount; a finished backup earns confetti.

## Mercury: calm, trustworthy money
- Neutrals tinted cool violet, never pure grey; a muted scale for surfaces and a saturated accent with alpha steps.
- In-between weights (360, 420, 480); display headings with slightly positive tracking.
- Default transition 150ms, `cubic-bezier(.4,0,.2,1)`.
- Joy: media tabs crossfade with a 4px blur out and a 5px rise in.

## Figma (UI3): dense panels, and an honest rollback
- A control's look tells you what it is: inputs filled, dropdowns bordered.
- Muscle memory beat tidiness: X and Y stayed above W and H.
- Floating panels shipped in beta and were docked again after feedback: real use beats the redesign's idea.

## Sonner (toasts): a small component with complete care
- Older toasts move up 14px × index and shrink 5% × index; hover fans the stack into a list, with gaps filled so the hover doesn't flicker.
- Swipe to dismiss by distance or by speed (above 0.11 px/ms), with friction past the limit.
- Transitions rather than keyframes so quick successive toasts retarget smoothly; auto-dismiss after 4s, paused on hover and while the tab is hidden.

## Apple Liquid Glass and visionOS: glass that earns its place
- Glass is for the layer that floats above content (tab bars, toolbars, sidebars, sheets, controls), never for the content itself.
- It reads as a material because of light: a bright specular edge, blur and saturation of what's behind, and a tint that adapts to the content underneath.
- Controls morph: a tab bar shrinks while you scroll and grows back when you stop; a button's glass stretches into the menu it opens.
- Legibility won arguments: after launch Apple added a more opaque option, and Reduce Transparency makes every pane solid. Glass must survive the busiest backdrop.
- System animation defaults to springs (SwiftUI's default is a spring with no bounce; playful moments add a little).

## Arc and Raycast: light, grain and play
- Arc's theme picker blends two or three colours into a soft gradient with a grain slider: texture is part of the colour, not an afterthought.
- Raycast panels are dark glass with a lit top edge; the window floats over whatever is behind it.
- Both ship small, specific joys (Arc's boosts and easter eggs, Raycast's confetti command) that people share.

## Patterns across them

1. **Grey ladders, not black on white.** Three or four surface levels and four text tiers, neutrals often tinted toward the brand.
2. **Structure you feel more than see.** Few dividers, translucent hairlines or rings, lit top edges on dark surfaces.
3. **Depth as a ladder with jobs.** Two or three shadow layers with negative spread, growing from tooltip to menu to modal; radius steps with it; inner radius never larger than outer.
4. **Type tuned beyond defaults.** Tool text 13–14px, reading text 17px, tracking that changes with size.
5. **One house curve, two or three durations.** Controls 100–200ms, overlays about 300ms, entering from 0.9–0.96, exits faster.
6. **A motion budget set by frequency.** Keyboard and constant actions don't animate; delight is saved for rare moments.
7. **Speed is part of the brand.** Under 100ms responses, prefetching, spinners that wait before appearing.
8. **The keyboard is taught, not hidden.** Keycaps beside actions, ↵ and ⌘↵, ⌘K.
9. **Numbers get special care.** Tabular figures, consistent decimals, units bound to numbers, the reader's own data in examples.
10. **One signature element per product.** Stripe's arrow, Raycast's keycap, Things' Magic Plus, Superhuman's photo. One, not ten.
11. **Content leads, chrome steps back.**
12. **Tokens named for their job, built in perceptual colour.**
13. **Controls look like what they do.**
14. **Continuity in space.** Things persist through transitions and move from where they were.
15. **Empty and finished states are destinations.** They point to the next action or reward finishing.
16. **Glass floats, content doesn't.** Translucency for the chrome and objects above the page; content and reading text stay solid and legible, with an opaque fallback.
17. **Light makes the material.** A bright top edge, blur, saturation and something lit behind; grain gives it a surface. Without light behind it, glass is a grey box.
18. **Springs for things that move.** Objects settle with a small overshoot; colour and opacity simply ease.
