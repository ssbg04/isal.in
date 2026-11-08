# Engineering Skill: Accessibility Engineering (WCAG 2.2 AA)

## Purpose
Ensures that all components and conversion tools in Isalin are fully operable and accessible to users with visual, auditory, motor, or cognitive disabilities.

## When to Activate
Activate when creating or modifying any form input, interactive button, dialog/modal, tab navigation, or visual status display.

## Required Context
- WCAG 2.2 Level AA success criteria.
- ARIA 1.2 authoring guidelines for dialogs, tabs, comboboxes, and live regions.

## Methodology & Engineering Standards
1. **Semantic Structure & Landmarks**:
   - Use correct landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`.
   - Ensure a single `<h1>` per page, followed by an orderly heading hierarchy (`<h2>` -> `<h3>` -> `<h4>`) without skipping levels.

2. **Keyboard Operability**:
   - All interactive controls must be reachable via `Tab` and activatable via `Enter` or `Space`.
   - Modals must implement focus trapping, autofocus the first interactive element upon opening, and restore focus to the trigger on close (`Esc` to dismiss).
   - Clear `:focus-visible` styling must be present on every interactive element: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500`.

3. **Screen Reader Semantics**:
   - Icon-only buttons must include an explicit `aria-label` or `<span className="sr-only">`.
   - Dynamic conversion progress and error messages must use `role="status"` or `aria-live="polite"`.
   - Complex graphics and decorative SVGs must have `aria-hidden="true"`.

4. **Visual Ergonomics**:
   - Contrast ratio ≥ 4.5:1 for body copy and ≥ 3:1 for large text and UI components.
   - Respect user motion settings via `motion-safe:` or `@media (prefers-reduced-motion: reduce)`.

## Verification Checklist
- [ ] Keyboard navigation test: entire tool usable with mouse unplugged.
- [ ] Screen reader smoke test: inputs announce purpose and state.
- [ ] Color contrast verified against WebAIM contrast standards.
