# Try Noko IRL — RSVP + Treat Yourself to a Noko

A playful, accessible promo page for Noko’s tasting event. Includes a semantic RSVP form and an interactive campaign that rewards visitors with a random Noko‑themed surprise. A simple raffle drawer lets you paste names and draw winners, complete with confetti.

## Files

- `index.html` — Markup for the landing page, Noko Surprise, and Raffle Drawer
- `styles.css` — Brand styles, campaign + raffle styles, reduced‑motion friendly animations
- `main.js` — Random reward logic, accessibility, confetti, and raffle implementation
- `.gitignore` — Ignores common local/dev files

## Quick start

1. Open `index.html` in your browser.
2. The page loads confetti from a CDN:
   `<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>`
3. Optionally serve locally for auto‑reload:
   - Python: `python3 -m http.server`
   - Node (if installed): `npx serve .`

## Customize

- Replace the logo text inside `.brand__logo` in `index.html`.
- Adjust theme colors in `styles.css` under the `:root` variables.
 - Tweak reward weights/copy in `main.js` under the `rewards` array.
 - Replace placeholder CTA URLs (e.g., perks) with real links in `main.js`.
 - To allow multiple surprises per session, remove the `sessionStorage` check.

## Features

- **Noko Surprise** — Click once to get a random reward (free sample, early access, merch, flavor match, or perks). One per session.
- **Confetti** — Tasteful canvas confetti bursts on reveal (skips if reduced motion is enabled).
- **Raffle Drawer** — Paste names, click “Draw Winners” to assign rewards. Results are announced and focusable.
- **Accessibility** — Proper labels, aria‑live announcements, keyboard activation, visible focus, reduced motion support.

## Accessibility

- Labels are associated with inputs via `for`/`id`.
- Buttons are keyboard accessible (Enter/Space) and have visible focus states.
- Live regions announce reward/raffle outcomes.
- Animations respect `prefers-reduced-motion`.

## License

MIT
