# Engineering Skill: UI & UX Engineering

## Purpose
Establishes principles, standards, and checklists for crafting professional, cohesive, and modern user interfaces for the Isalin utility suite.

## When to Activate
Activate during any task involving new user-facing components, layout revisions, theme styling, design token adjustments, or responsive redesigns.

## Required Context
- Existing theme tokens in `src/index.css`.
- Tailwind CSS 4 utility conventions and glass-panel styles.
- Brand identity guidelines (Plus Jakarta Sans font, amber accent highlights, minimalist cards).

## Methodology & Engineering Standards
1. **Design Tokens**:
   - Never use arbitrary inline color hex codes (`#123456`) in JSX components. Use semantic Tailwind classes (`text-neutral-900 dark:text-white`, `border-border`, `bg-muted/40`).
   - Standardize border radii: `rounded-xl` for inner controls/inputs, `rounded-2xl` for container cards and workspaces.
   - Maintain uniform transition durations: `transition-all duration-200 ease-out`.

2. **Responsive Layouts**:
   - Mobile-First: Ensure workspaces adapt gracefully from 360px viewport widths to 4K ultra-wide screens.
   - Use flexible grid auto-fit systems: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`.
   - Never allow horizontal layout overflow. Wrap wide data tables in scrollable overflow containers: `overflow-x-auto`.

3. **Status Feedback**:
   - Provide immediate visual confirmation for actions (e.g. "Copied!", "Saved!", "Converting...").
   - Display informative empty states when no files or inputs are present with clear call-to-actions.
   - Use non-blocking toast or banner notifications for errors rather than browser `alert()`.

## Common Failure Cases
- Designing exclusively on desktop and ignoring mobile viewport clipping.
- Insufficient text contrast in light mode with light gray text on light backgrounds.
- Inconsistent spacing and margins between adjacent tool cards.

## Verification Checklist
- [ ] Responsive across 375px, 768px, 1024px, and 1440px viewports.
- [ ] Dark and light themes tested with no unreadable text or broken borders.
- [ ] Micro-interactions (hover, active, focus) feel crisp and non-distracting.
