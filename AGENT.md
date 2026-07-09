# Frontend Agent Notes

- Use the existing React, Vite, Tailwind v4, and shadcn/ui setup.
- Keep Axios calls in `src/lib/api.ts`; components should call typed helpers.
- Do not show protected app data until `/api/auth/me` resolves.
- Use date-only `YYYY-MM-DD` strings for scheduling data.
- Keep JWT access tokens in memory; refresh tokens are HTTP-only cookies.
- Use class-based dark mode and keep `#07857e` as the primary color.
- Run `pnpm typecheck` and `pnpm build` before handoff.
