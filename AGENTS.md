# Repository notes for agents

## Stack / run
- Bun project: `bun.lock` is the only lockfile. `bun install --frozen-lockfile` (compose + CI) fails
  whenever `package.json` changes without regenerating the lock — after editing dependencies run
  `bun install` and commit the updated `bun.lock`.
- Dev (`bun run dev` → `tsx server.ts`) must run with `NODE_ENV` unset/`development`: the Express
  server mounts Vite in middleware mode. With `NODE_ENV=production` it serves the prebuilt `dist/`
  bundle instead, so edits stop showing up.
- Express is v5. Route patterns need v5 syntax (`/api/{*splat}`, not `/api/*`), and
  `@types/express-serve-static-core` types route params as `string | string[]`; normalize them with
  the `routeParam()` helper in `server.ts` before passing to functions that take a `string`.
- State lives in `data/db.json` (atomic write + rename). `data/` is committed seed data.

## Sandbox
- `docker-compose.base44.yml` runs the repo from a bind mount on `oven/bun:1`, port 3000.
  `/run/base44/app.env` (optional) carries platform secrets such as `GEMINI_API_KEY`.
- `GEMINI_API_KEY` is optional at boot: without it the AI consult endpoint returns deterministic
  fallback recommendations and `/api/health` reports `aiEngineAvailable: false`.

## Verify
- `bun run lint` (tsc --noEmit) and `bun run build` (vite build + esbuild server bundle) must both pass.
- Runtime smoke test: `curl localhost:3000/api/health` → `{"status":"healthy"}`, and
  `curl localhost:3000/api/nope` → JSON 404 (proves the Express 5 API catch-all still works).
