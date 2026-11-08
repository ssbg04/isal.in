# Engineering Skill: React Architecture & Component Modularity

## Purpose
Governs React 19 and TypeScript architectural practices, state segregation, custom hook extraction, code splitting, and component boundaries.

## When to Activate
Activate during refactoring of large components (such as `src/App.tsx`), adding new conversion features, or restructuring state management.

## Required Context
- React 19 lifecycle and concurrency model.
- TypeScript strict compiler configuration (`tsconfig.app.json`).
- Isalin's modular structure under `src/components/tools/`, `src/services/`, and `src/hooks/`.

## Methodology & Engineering Standards
1. **Component Sizing & Single Responsibility**:
   - Presentation components should focus on rendering UI, not performing raw binary transformations.
   - Max component line limit guideline: ~300-400 lines. Components exceeding 500 lines must be evaluated for decomposition into subcomponents or hooks.
   - Separate tool workspaces into dedicated files under `src/components/tools/`.

2. **Custom Hook Extraction**:
   - Extract stateful business logic into dedicated hooks:
     - `useToolRouting`: URL synchronization, hash migration, and browser history popstate.
     - `useConversionHistory`: Local storage persistence and retrieval of user conversion records.
     - `useTheme`: Theme detection, system preference matching, and `localStorage` synchronization.
     - `useBatchQueue`: Sequential batch job tracking, concurrency limits, and progress reporting.

3. **Code Splitting & Lazy Loading**:
   - Lazy load heavy tools that depend on large libraries:
     ```tsx
     const PdfConverterTool = React.lazy(() => import('./components/tools/PdfConverterTool'));
     const VideoConverterTool = React.lazy(() => import('./components/tools/VideoConverterTool'));
     const AudioConverterTool = React.lazy(() => import('./components/tools/AudioConverterTool'));
     ```
   - Provide lean `<Suspense fallback={<ToolLoadingPlaceholder />}>` boundaries so initial page load remains instant.

4. **Type Soundness**:
   - Avoid `any` or loose type assertions (`as unknown as X`).
   - Define strict union types for tool states, formats, and categories.

## Verification Checklist
- [ ] No circular dependencies between components and services.
- [ ] Monolithic `App.tsx` decomposed into clean tool delegates.
- [ ] TypeScript compilation passes with zero errors under `tsc -b`.
