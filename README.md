# RSVP Page for Noko IRL Event

This is a college class project for a web development course, featuring a dark-mode RSVP page for the Noko IRL tasting event. The page includes an RSVP form, countdown timer, share functionality, and animations.

## Project Overview

Developed as part of a college class attended at University of Texas Dallas, this project demonstrates modern web technologies including responsive design, form validation, localStorage persistence, and accessibility best practices. The page was originally designed with interactive surprise and raffle features, but has been streamlined to focus on core RSVP functionality.

## Features

- **RSVP Form**: HTML5 validation, localStorage persistence for submissions, and confetti on successful RSVP.
- **Countdown Timer**: Displays days, hours, minutes, and seconds until the event date (October 4, 2025).
- **Share Functionality**: Web Share API with clipboard fallback for sharing.
- **Dark Mode UI**: Dark theme with gradients and glassmorphism effects.
- **Accessibility**: Keyboard navigation, screen reader support, and reduced motion preferences.
- **Responsive Design**: Optimized for desktop and mobile devices.
- **Animations**: Floating bubbles and background gradients (respects reduced motion settings).

## Technologies Used

- **HTML5**: Semantic markup with form validation and accessibility attributes.
- **CSS3**: Custom properties, container queries, and modern animations.
- **JavaScript (ES6+)**: IIFE encapsulation, event handling, and DOM manipulation.
- **Canvas Confetti**: External CDN library for celebratory effects.
- **LocalStorage API**: Client-side data persistence for RSVP entries.

## Files

- `index.html` — Main page markup with RSVP form and countdown.
- `styles.css` — Dark theme styles, animations, and responsive design.
- `main.js` — Form submission logic, countdown timer, share button, and confetti effects.
- `.gitignore` — Excludes common development files.

## Quick Start

1. Clone or download the repository.
2. Open `index.html` in a modern web browser.
3. The page loads the confetti library from a CDN:
   `<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>`
4. For local development with auto-reload:
   - Python: `python3 -m http.server`
   - Node.js: `npx serve .`

## Usage

- Fill out the RSVP form with your name, email, and consent.
- Submit to save your entry locally and trigger confetti.
- Use the share button to invite others.
- Watch the countdown timer update in real-time.

## Customization

- Update event date in `main.js` (line 83: `const eventDate = new Date('2025-10-04T00:00:00').getTime();`)
- Modify theme colors in `styles.css` under the `:root` variables.
- Adjust form fields or validation in `index.html` and `main.js`.

## Accessibility Features

- Semantic HTML with proper labels and roles.
- Keyboard navigation for all interactive elements.
- ARIA live regions for dynamic content announcements.
- High contrast colors and visible focus indicators.
- Support for `prefers-reduced-motion` media query.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge).
- Progressive enhancement for older browsers.
- Mobile-friendly responsive design.

## License

This project is part of a college class assignment and is available under the MIT License.
