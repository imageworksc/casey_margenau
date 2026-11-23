# Casey Margenau Fine Homes & Estates

Luxury real estate homepage (Northern Virginia).
Live preview served from `index.html` via GitHub Pages.

## Running inside Drupal

The live page (caseymargenau.com/html_page/html-homepage/) sits in the
`field-html-code` field of the site theme, not on its own. These rules keep
it measuring the same in both places:

- `1rem = 10px`. The theme sets `html { font-size: 62.5% }` and `main.css`
  sets the same base, so staging matches. Sizes are written on that base;
  media queries are in px. Above 1920px the root still scales with the
  viewport for 4K/5K.
- The page wrapper is `#cm-main`. Never use `id="main"` or the class
  `section`: the theme caps both at 1000px. Sections use `.cm-section`.
- `#cm-main` clears floats, so the theme's floated menu can't narrow the hero.
- The page's own blocks (`#nav`, `#cm-main`, `#cm-footer`) carry the
  `html-wrapper` class, or the theme recolours their links.
- Element-level rules are scoped with `:where(.field-html-code)`, so they
  don't reach the site's own header and footer. `index.html` has the same
  wrapper. `:where()` adds no specificity, so no `!important` is needed.
- Guards for the theme's `img { height: auto !important }` (cropped frames,
  logos) and its 20px list-item spacing live at the end of `main.css`.
- No inline width patches in the field. If one seems needed, the fix belongs
  in `main.css`.

Before handing off, test inside a copy of the live page at 390, 768, 1440,
1920 and 2560 wide. Staging alone won't show theme conflicts.
