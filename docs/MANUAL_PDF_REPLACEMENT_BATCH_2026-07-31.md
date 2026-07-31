# Manual PDF Replacement Batch - 2026-07-31

This note records the small manual replacement batch applied after the user requested replacing short or template-like tuning questions with PDF-style SQL/Trace questions.

## Source Pages Checked

- `SQL-자격검정-실전문제.pdf` page 89, question 53
- `SQL-자격검정-실전문제.pdf` page 89, question 54

The PDF page was checked visually from the rendered audit image before applying the replacements. These entries are not full-page screenshots in the user-facing quiz. They are represented as structured text, SQL, execution-plan summary, choices, answer, and choice-level explanations.

## Replacements

| Area | Existing ID | Previous Issue | Replacement Source | Result |
|---|---|---|---|---|
| 3과목 | `prod-tuning-010` | Short concept-style Hash Join item, not enough like the user's PDF examples | `SQL-자격검정-실전문제.pdf` p.89 q53 | Replaced with a composite-index access-condition question using SQL and execution-plan summary |
| 3과목 | `prod-ext-tuning-016` | Short concept-style Sort Merge Join item | `SQL-자격검정-실전문제.pdf` p.89 q54 | Replaced with a SQL Trace Row Source Operation question about tuning priority |

## User-Facing Rules Reconfirmed

- No PDF filename, page, source status, generation mode, or review metadata is shown in the normal quiz screen.
- The replacement questions do not use full problem screenshots.
- SQL and Trace materials are separated into structured sections.
- Choice labels stay as normal A/B/C/D options.
- The questions are classified as `owner_pdf_variant` because the visible source page was manually checked, but the full answer-key page was not rechecked in this batch.

## Follow-Up Candidates

The next manual audit batch should continue replacing short 3과목 questions that still look like pure concept checks, especially candidates around 17, 18, 19, 22, 27, and 33 if they do not include meaningful SQL, Trace, execution-plan, or scenario material.
