# Content Guide

## Source Labels

- `official_scope`: official exam scope used as outline.
- `user_pdf_adapted`: user-provided PDF used as topic and difficulty reference, rewritten as original study content.
- `public_reference_adapted`: public source used for feature or topic analysis only.
- `original`: authored from general SQLP knowledge.
- `ai_assisted`: generated draft requiring review.

## Question Requirements

Each question must include:

- subject, major topic, minor topic, detail topic
- difficulty
- question type
- prompt and optional passage/table/sql/plan/trace
- answer payload
- detailed explanation
- wrong-answer notes
- related concept ids
- at least 3 hints
- expected minutes
- source
- status
- content version

## Practice Requirements

Practice scenarios must include scenario, requirement, DDL, data volume/distribution, indexes, current SQL, current plan, trace, target plan, predicate info, expected result, performance goal, constraints, hints, model SQL, accepted patterns, rubric, and explanation.

## Expansion Rule

Do not add bulk content simply to hit counts. Stop expansion if answers, Oracle syntax, trace figures, or predicate placement cannot be confidently verified.
