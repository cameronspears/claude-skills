# From nice to wow

A page can pass every check in this skill and still only earn an "oh, nice". The bar is "wow": a moment someone stops, plays with, and shows a friend. Nice comes from doing things right. Wow comes from staging an experience on purpose. Read this when you write the direction card, and again before the next mile.

## What Disney's Imagineers know

Theme-park designers have spent seventy years making people feel magic in physical space. Their rules (paraphrased from Marty Sklar's "Mickey's Ten Commandments" and Imagineering practice) translate directly to a page:

| Their rule | What it means on a page |
| --- | --- |
| **Wear your guest's shoes.** Walk the park as a first-time visitor. | Walk the page as a first-time visitor on a phone, top to bottom, touching everything. Note every moment of boredom, confusion or flatness. Those are where the magic goes. |
| **The wienie.** A castle at the end of Main Street pulls you forward. | Every screen has one luminous object the eye goes to first and that invites a touch: the hero object, the live number, the thing that's moving. Each section ends with something that pulls you into the next. |
| **The reveal.** You pass through a dark tunnel under the station, then Main Street opens out. | Compress, then release. A narrow, quiet moment (a sticky stage, a single line) before something opens out big (a panel unfolding, a scene assembling). Contrast makes the moment. |
| **The pre-show.** The queue tells the story before the ride. | Waits and first loads are part of the show: the skeleton is the product drawing itself, a loading state previews what's coming, the hero assembles in front of you. |
| **Tell one story at a time.** | Each section has one idea, staged once, with one moment. Five ideas in one section is clutter, not richness. |
| **Plussing.** Walt's word for always adding one more thing to something already good. | After a section works, ask "what would plus this?" and add one unrequested delight: a hover that reveals a real detail, a number that rolls, an edge that rubber-bands. |
| **A ton of treat for every ounce of treatment.** | Every touch is rewarded with more than it cost: a hover shows a real fact, a drag shows a live result, a click gets a response that feels physical. |
| **Hidden Mickeys.** Small rewards for people who look closely. | One or two tasteful secrets per product: a keyboard shortcut taught in place, a long-press that does something charming, an empty state with a little wit, a detail at 3x zoom that's perfect. |
| **Kinetics.** The world moves even when you don't: flags, water, steam. | The page is alive at rest: live data ticks, the light drifts, one status pulses. Quietly, and it stops under reduced motion. |
| **The berm.** You never see the outside world from inside the park. | Nothing breaks the spell: no unstyled flash, no default browser control, no state that drops back to the old design, no jank, no layout jump. One broken detail undoes ten good ones. |
| **Forced perspective.** Buildings look taller than they are. | Depth from layers: glass at different heights over the light, foreground objects that move faster than the background on scroll or tilt. |

## What wow looks like on the web

These are the moves products known for magic actually make. Pick the one that fits the product's story; don't stack them.

- **The product demonstrates itself, then hands you the controls.** Stripe's home page writes the code and the payment appears; Linear's launch pages assemble the real UI in front of you. On a tool's homepage: a live example runs once, and the moment you touch it, it's yours.
- **Scroll tells the story.** Apple's product pages turn the object and change the scene as you scroll. A sticky stage with three to five steps, each scroll position a scene (CSS `animation-timeline: view()` with a JS fallback), always scrubbable back and forth, never scroll-jacked.
- **Things morph instead of cut.** Family's wallet and the Dynamic Island: a button becomes the panel it opens, a row becomes the detail view, a number becomes the chart. Shared-element view transitions or FLIP. Nothing pops in from nowhere.
- **The interface has physics.** Telegram dissolves a deleted message into dust; iOS sheets carry your flick. Removal, completion and dismissal each get a physical end.
- **The cursor is a light.** Glass catches a sheen where the pointer is, the hero leans toward it, the main action has a slight magnetic pull. The page knows you're there.
- **A celebration worth the moment.** Things 3's checkbox, Duolingo's lesson end. Rare and earned: the first success, a milestone, a goal reached.

## Making glass you can see

Glass reads as glass only when something is visibly behind it. Owners said: "I'm not seeing a whole lot of glass." Give every glass surface something to show through:

- Content scrolls under the nav bar, and you can see it blurred through the bar.
- A card or panel sits partly over a lit shape, an image, a chart or the hero object, so you see the blurred colour through its edge.
- Glass stacks: a popover over a panel over the field, each a different depth.
- A sheen follows the pointer across it.

If you could swap a glass surface for a flat grey fill and nobody would notice, it isn't working as glass: move it over something, or lift the light behind it.

## Wow on surfaces that seem hard

- **Settings:** show what the setting does as you change it: switch the payout schedule and a calendar strip reflows to the next payouts; change the theme and the preview card turns. Hold to confirm dangerous actions (a ring fills under your finger). Saved morphs from the button itself.
- **Tables and dashboards:** numbers roll when data refreshes, rows slide into their new order rather than jump, a hovered row reveals its sparkline, a filter morphs the table rather than replacing it.
- **Comparison and pricing:** a toggle that physically moves the plans, lines that draw in as each benefit is checked, the chosen plan lifting as glass over the others.
- **How it works:** not a numbered list. A stage you can scrub or swipe, where each step is the real product doing that step.

## The wow test

Before the next mile, and in every review, answer:

1. **Name the moment.** Which moment on this page would someone screen-record and send to a friend? If you can't name one per page, the page is nice, not wow. Build one.
2. **Plus every section.** For each section, name its plus: the one delight beyond correct. A section with none gets one or gets cut.
3. **Find the berm breaks.** Anything that breaks the spell: a jump, a default control, an unstyled flash, something escaping its container, a state in the old style.
4. **Read it as a first-time guest.** On a phone, top to bottom. Where did you get bored? That's where the next moment goes.
