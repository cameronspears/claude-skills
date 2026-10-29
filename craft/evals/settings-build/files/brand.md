# Harbor brand notes

Harbor is a booking and payments app for independent marinas (berths, moorings, fuel dock).

- **Wordmark:** "harbor" in lowercase, Schibsted Grotesk SemiBold, preceded by the anchor mark below. Never recolour the mark except to the ink colour or white.
- **Brand colour:** Harbor Orange `#C2410C`. Used for primary actions. Our designer says "use it like a lighthouse, not a sunset".
- **Ink:** `#1C1917` for text on light backgrounds.
- **Typeface:** Schibsted Grotesk (Google Fonts), weights 400, 500, 600.
- **Voice:** plain, warm, a little nautical but never punny. "You're all set" not "Smooth sailing!".
- **Theme:** light only for now.

Anchor mark (SVG, 24×24, stroke uses currentColor):

```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v14"/><path d="M5 13H3a9 9 0 0 0 18 0h-2"/><path d="M9 10h6"/></svg>
```

## What the settings page needs

The marina manager's account settings, one page, reached from the avatar menu:

1. **Marina profile:** marina name (Saltmarsh Marina), contact email, phone, address, time zone (select), logo upload.
2. **Notifications:** toggles for new booking, cancellation, payment received, payout sent, weekly summary email; a quiet-hours range (from/to times).
3. **Payouts:** connected bank account (ending 4417), payout schedule (daily / weekly / monthly), next payout £3,284.50 on 4 Nov.
4. **Team:** 4 members (Ana Reyes, owner; Tom Fielding, dock master; Priya Shah, front desk; Joe Marsh, invited, pending), with role select and remove; invite by email.
5. **Danger zone:** pause new bookings; delete marina (requires typing the marina name).

Saving behaviour is up to you, but it must be obvious what's saved.
