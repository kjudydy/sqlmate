# Question Duplication Report

Updated: 2026-07-23

## Current Strategy

PDF-derived questions use three identifiers:

- `contentHash`: display-level question hash.
- `semanticFingerprint`: rendered question fingerprint.
- `variantGroupId`: groups Original / Safe Variant / Similar items derived from the same source unit.

This separates legitimate PDF-derived siblings from accidental duplicates.

## Automated Result

`findLikelyDuplicateQuestions()` returns no duplicate buckets in the current approved bank.

Vitest coverage:

- exact objective signatures per subject are unique
- semantic duplicate guard returns `[]`
- extra 20-question objective batches have unique ids
- extra 20-lab practice batches have unique ids

## Duplicate Rules

The following are not counted as new questions in future batches:

- only choice order changed
- only number changed
- only table/column name changed
- same SQL and same reasoning path
- same source unit with no new generated mode
- identical content hash or semantic fingerprint

The following are allowed but grouped:

- Original item
- Safe Variant of that source item
- Similar item with the same source concept and trap

They share a `variantGroupId` but must have distinct content hashes and fingerprints.
