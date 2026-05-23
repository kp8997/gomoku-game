# Antigravity Workspace Agent Configuration

## Repository Overview
This workspace is governed by a skill-driven execution model powered by the Agent Skills framework. The agent must strictly utilize progressive disclosure to execute tasks through structured workflows rather than ad-hoc code generation.

## Intent-to-Skill Mapping Matrix
Before taking any action, parse user requests against this matrix. Do not execute implementation until the precursor verification gates are satisfied.

| Phase | User Intent / Trigger Phrase | Target Skill Workflow | Key Verification Gate |
| :--- | :--- | :--- | :--- |
| **DEFINE** | "I want to build...", "Design a...", `/spec` | `skills/spec-driven-development/SKILL.md` | Clear user alignment on requirements |
| **PLAN** | "How should we do this?", "Break it down", `/plan` | `skills/planning-and-task-breakdown/SKILL.md` | Atomic tasks defined in Markdown checklist |
| **BUILD** | "Write the code", "Implement", `/build` | `skills/incremental-implementation/SKILL.md` | Thin vertical slices, zero mega-PRs |
| **TEST** | "Add a test", "Verify this works", `/test` | `skills/test-driven-development/SKILL.md` | Test writes occur *before* or alongside fixes |
| **REVIEW**| "Check my code", "Review the PR", `/review` | `skills/code-review-and-quality/SKILL.md` | Adherence to Google health norms (<100 lines) |
| **SIMPLIFY**| "Clean this up", "Refactor", `/code-simplify` | `skills/code-simplification/SKILL.md` | Must explicitly justify Chesterton's Fence |

## Strict Operational Mandates
1. **Never Rationalize:** If you feel compelled to say "I'll add tests later" or "We can skip the spec for this small fix," stop. Consult the Anti-Rationalization Table inside the respective skill file and counter your own shortcut.
2. **On-Demand Context Loading:** Do not ingest all skills at once. Read this index map, then parse individual `SKILL.md` files dynamically using your workspace file-reading tools only when an intent matches.
3. **Verification is Non-Negotiable:** "Code looks good" is an invalid exit condition. Every skill workflow must terminate with explicit proof execution (running tests, parsing build outputs, or analyzing runtime behavior).