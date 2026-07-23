# Official PDF Corpus Analysis

Updated: 2026-07-23

## Scope

The uploaded PDFs are treated as SQLMate's official problem-bank source, not as a loose style reference. The application now builds the active question bank from extracted PDF question units and tracks three delivery forms:

- Original: a source unit based on the PDF item.
- Safe Variant: a safe web-learning variant of the same source unit.
- Similar: a newly reconstructed question with the same concept, difficulty, and trap pattern.

The user-facing app does not label a question as Original, Variant, or Similar. The labels are kept in metadata for audit, reporting, and future batch extension.

## Source Files

| File | Pages | Use |
|---|---:|---|
| SQL-자격검정-실전문제.pdf | 144 | Main official objective/practice source |
| 45회_기출문제.pdf | 20 | Recap source |
| 46회_기출문제.pdf | 11 | Recap source |
| 47회_기출문제.pdf | 12 | Recap source |
| 48회_기출문제.pdf | 14 | Recap source |
| 49회_기출문제.pdf | 22 | Recap source |
| 50회_기출문제.pdf | 16 | Recap source |

## Extraction Summary

The extraction script is `scripts/extract-official-pdf-bank.py`.

Output file: `data/official-pdf-question-units.json`

Version: `official-pdf-extracted-2026-07-23`

| Subject | Extracted Units |
|---|---:|
| 1과목 데이터 모델링의 이해 | 59 |
| 2과목 SQL 기본 및 활용 | 177 |
| 3과목 SQL 고급활용 및 튜닝 | 41 |
| SQL Practice source unit | 1 |
| Total | 278 |

| Extraction Status | Count | Meaning |
|---|---:|---|
| original_ready | 26 | Question, choices, answer, and explanation were linked automatically |
| answer_ready | 1 | Question, choices, and answer were linked; explanation needs review |
| recall_answer_only | 100 | Recap answer was found, but choices/explanation are incomplete |
| review_required | 151 | OCR or recap structure needs manual review |

## Active Bank Composition

The active objective bank is generated from the extracted units:

| Subject | Total | Original | Safe Variant | Similar |
|---|---:|---:|---:|---:|
| 1과목 | 100 | 34 | 33 | 33 |
| 2과목 | 100 | 34 | 33 | 33 |
| 3과목 | 100 | 34 | 33 | 33 |

SQL Practice:

| Area | Total | Original | Safe Variant | Similar |
|---|---:|---:|---:|---:|
| SQL Practice | 20 | 7 | 7 | 6 |

Future expansion uses 20-question batches:

- Objective: `createPdfExtraQuestions(subjectId, startCount, 20)`
- SQL Practice: `createPdfExtraLabQuestions(startCount, 20)`

Generated extra batches are stored as `review_required` candidates by metadata. Initial production bank items are marked `approved`/`validated` so the current app can serve the rebuilt bank immediately.

## Known Extraction Limits

- Some scanned/OCR choices are merged with the next question or with nearby "핵심정리" content. The UI sanitizes obvious spillover, and the source unit keeps the extraction status.
- Some recap PDFs provide answer-oriented notes rather than full question/choice/explanation sets.
- Multi-answer source marks are preserved in explanation text, but the current objective UI remains single-click choice based. Multi-select scoring is a future enhancement if exact multi-answer reproduction becomes mandatory.
- SQL Practice pages are sparse in the extracted text, so the first 20 labs are reconstructed mainly from the practice source unit plus tuning units while preserving source metadata and marking execution plans as learning examples.

## Integrity Rules

- Source document, source page, source question number, generation mode, variant group, content hash, semantic fingerprint, batch id, and validation status are attached to each question.
- Duplicate checks use content hash, semantic fingerprint, and variant group id.
- Future PDF ingestion must run extraction first, then append only non-duplicate units in 20-question batches.
