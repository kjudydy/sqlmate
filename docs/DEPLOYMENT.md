# Deployment

## Branch

Use `feature/sqlp-platform-overhaul` for this work.

## Preview

Run:

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm dlx vercel --yes
```

Do not run `vercel --prod` from this branch.

Latest Preview:

- URL: https://sqlmate-ak0u5hec1-judy-study.vercel.app
- Inspect: https://vercel.com/judy-study/sqlmate/D1XkNhmG4VuMUBw8yuZhyX1LaK6Z
- HTTP verification: `STATUS=200`

## Production

Production merge and deploy require user approval after Preview verification.
