# SQL Practice

SQLP practice is the differentiator of SQLMate. The current implementation is a structured simulation layer using reconstructed Oracle-style plan and trace data.

## Current Modes

- Oracle simulation: problem-provided plan/trace and grading rubric.
- PostgreSQL EXPLAIN: optional safe read-only execution if a separate `DATABASE_URL` is configured.

## Not Yet Implemented

- Actual isolated Oracle execution sandbox.
- Runtime comparison between submitted SQL and actual Oracle plan.

## Safety Principles

- Do not run learner SQL against the production Supabase database.
- Block DDL/DML unless a future isolated scenario explicitly permits it.
- Limit statement length, execution time, row count, and dangerous tokens.
- Clearly label simulated Oracle material as simulated/reconstructed.
