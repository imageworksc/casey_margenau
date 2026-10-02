# Casey Margenau Fine Homes & Estates — Option 1 (dev handoff)

Luxury real estate homepage (Northern Virginia). This branch contains only the
**Option 1** design (stone house hero).

Preview: https://imageworksc.github.io/casey_margenau/option-1.html

## Structure

```
option-1.html            page markup (no inline styles or scripts)
css/main.css             all styles (rem-based, fluid up to 4K/5K)
js/main.js               nav, hamburger menu, reveals, counters, FAQ, carousel
assets/images/           hero, featured property, blog image, logo (SVG)
favicon.* / *-icon*.png  favicons and touch icons
```

## Notes

- No build step: plain HTML, CSS and vanilla JS (ES2015+, `const`/`let`).
- Breakpoints: 1024px (hamburger menu), 820px, 560px; root font size scales
  above 1920px wide and is capped by viewport height for ultrawide screens.
- Bump the `?v=` query on the CSS/JS links when assets change (cache busting).
- Navigation links are placeholders (`#`) pending real routes.
