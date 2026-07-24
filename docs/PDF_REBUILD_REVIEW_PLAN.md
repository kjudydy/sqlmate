# PDF Rebuild Review Gate

## Current Safe Baseline

- Baseline commit: `64566cb` (`Revert "feat: rebuild bank from official PDF corpus"`)
- Production is back on the pre-OCR-bank state.
- This branch does not replace the public problem bank.
- The first deliverable is a separate `/pdf-review` Vercel Preview for user inspection.

## Source Handling

The rejected production bank failed because extracted text was treated as publishable content. The new gate uses a stricter flow:

1. Copy source PDFs to `tmp/pdfs/` with ASCII filenames for tooling stability.
2. Extract text only for navigation and rough indexing.
3. Render candidate pages to PNG with Poppler.
4. Manually compare the rendered problem page and the answer/explanation page.
5. Register only clean verified items in the review set.
6. Keep source metadata in admin/review panels only.
7. Block any user-visible field that contains OCR garbage, review status strings, PDF filenames, or generation metadata.

## PDFs Checked In This Phase

| File | Pages | Phase Use |
|---|---:|---|
| `SQL-자격검정-실전문제.pdf` | 144 | Primary source for the first 35-item review set |
| `45회_기출문제.pdf` | 20 | Later candidate pool; contains recap marks and needs stricter cleanup |
| `46회_기출문제.pdf` | 11 | Later candidate pool; contains recap marks and short-answer notes |
| `47회_기출문제.pdf` | 12 | Later candidate pool |
| `48회_기출문제.pdf` | 14 | Later candidate pool |
| `49회_기출문제.pdf` | 22 | Later candidate pool |
| `50회_기출문제.pdf` | 16 | Later candidate pool |

The round-specific PDFs are useful, but several pages contain recap symbols, emoji, or compact memo formatting. They are not used as Original items in the first gate until each problem is visually normalized and manually verified.

## First Review Set

Requested distribution:

- 1과목: Original 5, Variant 3, Similar 2
- 2과목: Original 5, Variant 3, Similar 2
- 3과목: Original 5, Variant 3, Similar 2
- SQL Practice: 5 structurally different cases

Implemented distribution in `lib/pdf-review-bank.ts`:

- Objective questions: 30
- SQL Practice: 5
- Total: 35

## Verified Original Pages

Rendered PNGs used for visual checks:

- `tmp/pdfs/sql-exam-p-008.png`
- `tmp/pdfs/sql-exam-p-009.png`
- `tmp/pdfs/sql-exam-p-022.png`
- `tmp/pdfs/sql-exam-p-024.png`
- `tmp/pdfs/sql-exam-p-025.png`
- `tmp/pdfs/sql-exam-p-073.png`
- `tmp/pdfs/sql-exam-p-074.png`
- `tmp/pdfs/sql-exam-p-075.png`

Answer/explanation pages inspected with text extraction and page comparison:

- 1과목: pages 110-111
- 2과목: pages 114-115
- 3과목: pages 130-131
- SQL Practice: pages 137-139

## User-Facing Metadata Rule

Normal problem preview must not display:

- PDF filename
- source page
- source question number
- extraction status
- review status
- generation mode
- parent or variant group IDs
- content hash or semantic fingerprint
- phrases such as "PDF 원문 문항" or "유사형 문항"

The `/pdf-review` page intentionally shows these only in the left administrator review panel. The right "user preview" panel is validated by tests through `getUserVisibleText()`.

## Automated Gate

`tests/pdf-review-bank.test.ts` checks:

- exactly 35 review items
- per-subject 5/3/2 Original/Variant/Similar distribution
- no user-visible OCR garbage or admin metadata
- only verified statuses in the review set
- 5 SQL Practice cases have distinct topics, schemas, and answer SQL
- every objective question has 4 choices, answer, explanation, choice explanations, concept, hints, and validation notes

## Next Step After User Approval

Only after the user approves this 35-item Preview:

1. Move approved items to the production content pipeline.
2. Extract more PDF originals problem-by-problem using the same visual verification gate.
3. Generate Safe Variant and Similar items from verified originals only.
4. Expand toward 1/2/3 과목 100 each and SQL Practice 20.
5. Keep review-required content invisible to normal users.
