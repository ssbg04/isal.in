---
name: meta-prompting
description: Structured cognitive meta-prompting framework for formulating, refining, and verifying complex autonomous engineering tasks. Use before executing multi-file refactoring, architectural overhauls, or complex feature additions.
---

# Meta-Prompting Skill

Use this skill to structure, critically evaluate, and refine complex engineering tasks before code execution.

## Core Directives
1. Reference the comprehensive engineering guide: `skills/meta-prompting.md`.
2. Structure tasks across the 8 meta-prompting dimensions:
   - **Objective**: Exact target outcome.
   - **Context**: Existing interfaces, files, and constraints.
   - **Constraints**: Invariants that must be strictly preserved.
   - **Strategy**: Minimal, safest implementation path.
   - **Execution**: Concrete file modifications.
   - **Verification**: Exact test/build commands to run.
   - **Failure Analysis**: Potential edge-case failures and fallback paths.
   - **Review**: Independent architectural peer evaluation.
3. Ground decisions on empirical code evidence and test outputs.
