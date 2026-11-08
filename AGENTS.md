# Isalin Multi-Converter — Autonomous Engineering Guidelines

## 1. Project Purpose & Architecture
**Isalin** (`isal.in`) is a 100% client-side, local-first in-browser utility suite.
- Core technologies: React 19, TypeScript, Vite 8, Tailwind CSS 4, Vitest, Oxlint.
- Deployment: Vercel (clean URLs, security headers, edge redirects).
- Core philosophy: Zero server uploads. Every file conversion, data serialization, and financial/unit calculation executes strictly inside the user's browser sandbox using WebAssembly, Web Workers, and standard Web APIs (Canvas, Web Audio, SubtleCrypto).

---

## 2. Universal Engineering Directives

1. **Local-First Privacy Integrity**:
   - Never transmit user files, conversion outputs, or calculation inputs to any remote server or analytics service.
   - Vercel Analytics must only receive aggregated page views and non-sensitive events.
   - Always revoke temporary `URL.createObjectURL` instances on unmount or task completion to prevent memory retention.

2. **Security Hardening**:
   - Always sanitize downloaded and extracted filenames to prevent directory traversal (`../`).
   - Disallow script execution inside user-uploaded SVGs or HTML previews.
   - Maintain strict Content Security Policy (CSP) in `vercel.json`. Eliminate unnecessary permissions such as `unsafe-eval` unless strictly required by sandboxed libraries.
   - Reject untrusted inputs safely without unhandled runtime exceptions.

3. **Code Modularity & Component Architecture**:
   - Keep components focused and single-purpose.
   - Extract presentation logic from stateful conversion engines.
   - Maintain clean interfaces between UI tool components (`src/components/tools/`) and core computational services (`src/services/`).
   - Use dynamic imports (`React.lazy` and `Suspense`) for heavy tool dependencies (`pdf-lib`, `jszip`, `js-yaml`).

4. **Accessibility (WCAG 2.2 AA Compliance)**:
   - Provide meaningful semantic HTML elements (`main`, `nav`, `section`, `article`, `footer`, `header`).
   - Ensure all interactive elements have visible `:focus-visible` styling, touch-friendly hit areas (≥44x44px on mobile), and accessible ARIA attributes (`aria-label`, `aria-expanded`, `aria-live`).
   - Respect `prefers-reduced-motion` across animations.

5. **Reliability & Regression Testing**:
   - Never remove or weaken tests to make builds pass.
   - Every computational utility (units, currency, tax brackets, data parsers) must have unit test coverage.
   - Always run `npm run check` (oxlint, vitest, tsc + vite build) before committing or finalizing changes.

---

## 3. Autonomous Specialist Personas
Specialized engineering roles are defined in the `agents/` directory:
- **Orchestrator** (`agents/orchestrator.md`): End-to-end task coordination, dependency resolution, architectural synthesis.
- **Frontend Architect** (`agents/frontend-architect.md`): Component decomposition, state boundaries, TypeScript hygiene.
- **UI/UX Designer** (`agents/ui-ux-designer.md`): Design token consistency, responsive layouts, micro-interactions.
- **Privacy & Security Engineer** (`agents/privacy-security-engineer.md`): In-browser data boundaries, CSP headers, sanitization.
- **Performance Engineer** (`agents/performance-engineer.md`): Bundle splitting, memory profiling, Web Worker acceleration.
- **Accessibility Specialist** (`agents/accessibility-specialist.md`): WCAG 2.2 AA audit, keyboard navigation, screen reader support.
- **QA & Reliability Engineer** (`agents/qa-reliability-engineer.md`): Test coverage, regression suites, edge case verification.
- **Domain Correctness Reviewer** (`agents/domain-correctness-reviewer.md`): Philippine tax laws, mathematical precision, unit definitions.

---

## 4. Self-Healing & Continuous Improvement Protocol
When any build, test, or runtime error occurs:
1. **Isolate**: Capture error stack trace, affected file, and trigger conditions.
2. **Reproduce**: Run targeted Vitest or Oxlint command.
3. **Analyze Root Cause**: Trace data flow before proposing code modifications.
4. **Minimal Repair**: Implement the smallest possible fix that resolves the issue cleanly.
5. **Regression Guard**: Add an explicit test case asserting the fixed behavior.
6. **Verify Pipeline**: Execute `npm run check` to ensure zero regressions.
