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

## Production

Production merge and deploy require user approval after Preview verification.
