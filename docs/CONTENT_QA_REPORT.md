# Content QA Report

Updated: 2026-07-23

## Current Build

- Source version: `official-pdf-extracted-2026-07-23`
- Objective questions: 300
- SQL Practice questions: 20
- Source mode: owner PDF Original / Safe Variant / Similar
- UI scope: existing SQLMate UI preserved; problem bank and practice content source changed.

## Counts

| Area | Total | Original | Safe Variant | Similar |
|---|---:|---:|---:|---:|
| 1과목 | 100 | 34 | 33 | 33 |
| 2과목 | 100 | 34 | 33 | 33 |
| 3과목 | 100 | 34 | 33 | 33 |
| SQL Practice | 20 | 7 | 7 | 6 |

## Automated QA

| Check | Result | Notes |
|---|---|---|
| TypeScript | PASS | `tsc --noEmit` passed |
| Unit tests | PASS | 29 tests passed |
| Production build | PASS | `next build` passed |
| 100 objective questions per subject | PASS | 1/2/3과목 each 100 |
| SQL Practice 20 questions | PASS | Default lab bank has 20 |
| Source metadata exists | PASS | source document/page/question/version/type/mode present |
| Original/Variant/Similar mix | PASS | Objective bank has all three modes |
| 20-question objective expansion | PASS | Extra batches are generated as review candidates |
| 20-question practice expansion | PASS | Extra lab batches are generated as review candidates |
| Wrong-note snapshot compatibility | PASS | Objective question shape remains compatible with snapshots |
| Study-state stale reset | PASS | Old learning records reset when source version changes |

## Content QA

| Check | Result | Notes |
|---|---|---|
| PDF source extraction | PASS WITH REVIEW | 278 source units extracted; OCR quality varies |
| Direct PDF item registration | PASS WITH REVIEW | Extracted stems/choices/answers are preserved when readable; incomplete OCR units carry status tags |
| Original/Safe Variant/Similar structure | PASS | Active bank is built from source units in 34/33/33 composition per subject |
| Duplicate prevention | PASS | Content hash, semantic fingerprint, and variant group id are generated |
| Existing non-PDF question replacement | PASS | Exports now prefer PDF-derived bank over legacy generated bank |
| SQL Practice readability | PASS | Trace summary, Predicate section, target plan explanations, and Korean operation notes are structured |
| Actual Oracle execution labeling | PASS | Practice plans/traces are marked as learning examples, not live Oracle measurements |

## Review Required

- `original_ready` automatic extraction count is 26. The remaining units require manual review if exact PDF original fidelity is required.
- Some OCR choices include spillover from nearby "핵심정리" or the next question. The app sanitizes obvious spillover for display, but manual corpus cleanup is still recommended.
- The current objective UI is still single-choice. PDF units with multi-answer marks preserve the original answer text in explanation, but exact multi-select scoring should be added in a future pass.
- SQL Practice extraction from the PDFs yielded only one explicit practice source unit in text; the first 20 labs are therefore reconstructed from that unit plus tuning-source units.

## User Data Reset

The user authorized resetting test learning data while keeping Auth, Google login, and profiles. The app now uses the PDF source version in `study_state.stateVersion`.

When an existing cloud state has an older version, the app clears:

- objective answers
- lab answers
- attempts
- wrong notes
- dismissed wrong notes
- concept marks
- extra objective questions
- extra lab questions

The app preserves:

- Supabase Auth
- Google login
- user profile
- personal notes
- todo items

Direct destructive SQL against production tables was not required by this code change.
