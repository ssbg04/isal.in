# Engineering Skill: Meta-Prompting & Autonomous Task Formulation

## Purpose
Establishes a structured cognitive framework for formulating, evaluating, and refining complex engineering tasks before code execution.

## When to Activate
Activate prior to undertaking any multi-file refactoring, architectural redesign, or major feature overhaul.

## Structured Meta-Prompting Schema
Before executing any substantial task, internally formulate the task using these 8 dimensions:

1. **Objective**: What exact, measurable outcome must be achieved?
2. **Context**: What files, interfaces, and behaviors currently exist?
3. **Constraints**: What must not be broken or altered (e.g. zero-upload privacy, working tools, URLs)?
4. **Strategy**: What is the safest, most incremental path to implementation?
5. **Execution**: Which files require edits, and in what sequence?
6. **Verification**: What test or build command proves the change is completely sound?
7. **Failure Analysis**: What failure modes are possible, and what is the recovery fallback?
8. **Independent Review**: Would an external peer reviewer find flaws, omissions, or anti-patterns?

## Operational Principles
- Treat empirical test results and compiler output as truth, not unverified assumptions.
- Keep cognitive iterations bounded to prevent circular reasoning.
- Update reusable project knowledge when a durable architectural pattern or bug fix is discovered.
