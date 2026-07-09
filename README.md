# easy-scheduling-frontend

React, Vite, TypeScript, Tailwind CSS, and shadcn/ui scheduling app.

## Environment

- `VITE_API_URL=http://localhost:3000`

The API uses Axios. Access tokens are stored in memory and sent as Bearer
tokens; refresh tokens are HTTP-only cookies, so the frontend sends requests
with credentials. Keep `VITE_API_URL` aligned with the backend `CORS_ORIGIN`.

Dark mode is class-based (`.dark` on the document element) and persists in
`localStorage`. The primary brand color is `#07857e`.

Scheduling dates are date-only `YYYY-MM-DD` strings. UTC timestamp values from
the API are displayed in the viewer machine timezone with native browser
formatting.

## Scripts

- `pnpm dev`
- `pnpm build`
- `pnpm preview`
- `pnpm typecheck`
