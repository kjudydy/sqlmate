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

- URL: https://sqlmate-24x8smi1z-judy-study.vercel.app
- Inspect: https://vercel.com/judy-study/sqlmate/8yNoYjVkdRikqNzHyv9QHvuLytEU
- HTTP verification: `STATUS=200`

## Production

Production merge and deploy require user approval after Preview verification.
