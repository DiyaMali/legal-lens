# Legal Lens — Accessibility Notes

## Target: WCAG 2.2 Level AA

## Implemented Controls

### Semantic HTML and Landmarks
- `<header>`, `<main>`, `<footer>`, `<nav>`, `<section>`, `<article>` used throughout.
- One `<h1>` per page (landing: "Understand any legal document in plain language").
- Logical heading hierarchy: h1 → h2 → h3 throughout result panels.
- `lang="en"` on the root `<html>` element.

### Skip-to-Content Link
- A "Skip to main content" link is the first focusable element on every page.
- It is visually hidden until focused (using `.sr-only` + `:focus:not-sr-only`).
- `#main-content` is targeted with `tabIndex={-1}`.

### Keyboard Operability
- All interactive elements are keyboard-operable.
- Tab order follows visual reading order.
- No keyboard traps.
- ClauseCard implements `role="button"` with `tabIndex={0}` and handles `Enter`/`Space` key events.
- File input: the real `<input type="file">` is hidden with `.sr-only` but fully operable; keyboard users can Tab to the label and activate with Enter/Space.

### Focus Styles
- Global `:focus-visible` style set in `globals.css` — 2px brand-color outline.
- Never removed with `outline: none` without providing an alternative.

### Form Accessibility
- Every `<input>`, `<select>`, and `<textarea>` has a visible `<label>` with `htmlFor` linking.
- Errors use `role="alert"` and `aria-describedby` to link the error to the field.
- Loading states use `role="status"` with `aria-live="polite"` and `aria-atomic="true"`.

### Risk Conveyance
- Risk is **never conveyed by color alone** (WCAG 1.4.1).
- Every RiskBadge shows: an icon, a text label, AND a color.
- `role="img"` with `aria-label` provides screen reader access.

### Color Contrast
- Brand color palette designed for ≥ 4.5:1 contrast ratio on white backgrounds.
- Text colors: `text-slate-800` (#1e293b) on white = ~14:1.
- Muted text: `text-slate-600` (#475569) on white = ~5.7:1.
- Risk colors tested against their background color (e.g., `text-red-800` on `bg-red-100`).

### Motion
- `@media (prefers-reduced-motion: reduce)` in `globals.css` disables all animations and transitions for users who opt out.
- Skeleton loading animations respect this media query.

### Responsive Design
- Layout is responsive from 320px width (single-column) through desktop (split-panel).
- Text resizable to 200% without horizontal scrolling or loss of functionality.
- Touch targets are at minimum 44px (buttons use `px-4 py-2` or larger = 44px+ with default font size).

### ARIA Live Regions
- Input form: loading status announced via `role="status" aria-live="polite"`.
- Q&A panel: "Getting answer, please wait" and "Answer ready" announced via `aria-live`.
- Compare panel: comparison status announced.

### Result Navigation
- Tab panel interface uses proper ARIA roles: `role="tablist"`, `role="tab"`, `role="tabpanel"`.
- `aria-selected` on active tab.
- `aria-controls` links tabs to their panels.
- `aria-labelledby` links panels back to their tabs.

## Tested With
- **vitest-axe**: automated axe-core tests on RiskBadge, Disclaimer, KeyFacts, MissingList, ClauseCard — zero violations.
- **ESLint jsx-a11y**: enforced at lint time with `plugin:jsx-a11y/recommended`.

## Known Limitations
- The source text panel (document text with highlights) uses a `<mark>` element which may not be announced consistently across all screen readers. A future improvement would add an `aria-description` linking the highlighted text to its clause card.
- The tab panel interface on mobile collapses to a horizontal scrollable list — future improvement: convert to a `<select>` for mobile.
