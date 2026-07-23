# Wrong Note Detail Update

## Scope

This update only changes the wrong-answer notebook experience. The existing SQLMate layout, menu structure, colors, problem bank, concept study, SQL practice, login, personal notes, and source content remain unchanged.

## Existing Storage

SQLMate stores user learning data in `public.study_state.state` as JSONB. Supabase RLS already restricts rows by `user_id`, so each user can only read and update their own study state.

## Selected Approach

Wrong notes now keep a lightweight question snapshot inside `wrongNotes[questionId]` when a user answers incorrectly. The screen still falls back to the current problem bank by `question_id` for older records.

Reasons:

- It preserves the problem body, choices, answer, explanations, SQL, table, and execution-plan text as the user saw it when they missed the question.
- It avoids a destructive schema migration.
- It keeps existing wrong-note memos intact.
- It works with the current user-owned JSON state and RLS policy.

## Delete Behavior

Deleting a wrong note removes only the user's active wrong-note item and records the question id in `dismissedWrongNotes`. The original problem, attempts, other users' data, and content metadata are not deleted.

If the user later misses the same question again, the dismissal is cleared and a fresh wrong-note item is created. The deleted personal memo is not restored.

## Backward Compatibility

Older wrong notes that do not contain snapshots use the current problem bank and the latest wrong attempt to reconstruct the review card. If an old record lacks selected-answer data, the UI displays that the previous answer is unavailable instead of inventing it.
