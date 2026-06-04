<!--
PR titles must follow Conventional Commits, e.g.:
  feat: add MCP marketplace search
  fix(auth): allow login on Vercel preview deployments
  docs: document self-hosting steps
-->

## What does this PR do?

<!-- A short summary of the change and the motivation behind it. -->

## Related issues

<!-- e.g. Closes #123 -->

## Type of change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that changes existing behavior)
- [ ] Documentation only

## Checklist

- [ ] `pnpm check` passes (Biome + Ultracite, formatting + lint)
- [ ] `pnpm exec tsc --noEmit --skipLibCheck` passes
- [ ] `pnpm exec next build` succeeds (or change is docs-only)
- [ ] I tested this on a Vercel **preview** deployment, including auth/login
- [ ] No secrets, tokens, or `.env*` values are committed

## Screenshots / recordings

<!-- For UI changes, attach before/after screenshots or a short clip. -->
