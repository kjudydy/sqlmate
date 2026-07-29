# PDF Extraction Hotfix

Date: 2026-07-29

## User-Facing Rule

SQLMate must not generate filler questions when the verified PDF-based pool is exhausted.

The question flow now uses only the currently published and validated problem bank. When the learner reaches the end of a subject or SQL Practice pool, the UI shows that no more verified questions are available instead of creating automatic template questions.

## PDFs Found

The source PDFs were copied into `tmp/pdf_sources/` with ASCII filenames for extraction tooling. The original files were not modified.

| Copied file | Original source role | Pages | Text pages | Replacement chars | Numbered question candidates | Answer/explanation pages |
|---|---|---:|---:|---:|---:|---:|
| `sql_cert_practice.pdf` | SQL qualification practice source | 144 | 137 | 0 | 333 | 36 |
| `sqlp_exam_questions.pdf` | SQLP compact exam source | 4 | 4 | 0 | 0 | 4 |
| `sqlp_subject3_full.pdf` | SQLP subject 3 source | 9 | 9 | 0 | 3 | 9 |
| `sqlp_practice_recall.pdf` | SQLP practice recall source | 8 | 8 | 358 | 36 | 5 |

## Current Decision

- `sql_cert_practice.pdf` has enough text to build a large source pool, but it is a two-page-spread style PDF. Automatic text extraction produces many numbered candidates, so each item still needs question-answer-page matching before publication.
- `sqlp_practice_recall.pdf` contains replacement characters in extracted text. Any problem block containing damaged text must stay out of the public problem pool until visually reviewed and manually normalized.
- No question is considered publishable merely because text was extracted.
- No Variant or Similar question may be derived from a damaged or unverified Original.

## Code Changes

- Disabled runtime objective expansion batches.
- Disabled runtime SQL Practice expansion batches.
- Removed the previous non-PDF manual expansion questions from the public objective pool.
- Ignored previously saved `extraQuestions` and `extraLabQuestions` from browser/cloud study state.
- Disabled `/api/ai` question generation.
- Removed SQL Practice fallback creation for `lab-extra-*` IDs.
- Updated tests so automatic template generation is expected to return no publishable questions.

## Required Next Step

Build the next production problem bank from verified extracted PDF items only:

1. Split `sql_cert_practice.pdf` into individual question candidates.
2. Match each candidate with its real answer and explanation section.
3. Visually review pages with tables, SQL, execution plans, or Trace.
4. Publish only items with intact stem, choices, answer, explanation, and required materials.
5. Generate Variant and Similar items only from verified Originals.
6. Stop when the verified pool is exhausted. Do not fabricate missing questions.
