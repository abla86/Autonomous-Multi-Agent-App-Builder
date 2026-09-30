# SwarmForge — Base44 Dev Environment

## Stack
- **Runtime**: Node.js 22 (via `node:22-slim`), Bun as package manager (`bun.lock`)
- **Dev command**: `tsx server.ts` — Express server with Vite in middleware mode (single origin, port 3000)
- **Frontend**: React 19 + Vite 6 + Tailwind 4, served through the Express server (not a separate dev server)
- **Storage**: JSON file-system store in `data/` (db.json, feature-flags.json, alerts.json, error-history.json)

## Setup quirks
- `jszip` was imported by `src/utils/fileConverters.ts` but missing from `package.json` — added.
- The `bun.lock` was out of sync with `package.json`; install uses `bun install` (non-frozen) to reconcile.
- Vite runs in middleware mode inside Express, so there is no separate Vite dev server port — everything is on :3000.
- `GEMINI_API_KEY` is optional for boot; without it the AI consultation feature returns deterministic fallbacks.

## Verification
- `curl http://localhost:3000/api/health` → JSON with `"status":"healthy"`
- `curl http://localhost:3000/` → HTML with Vite client + React refresh scripts (live source, not prebuilt)
- `docker compose -f docker-compose.base44.yml ps` → container status `Up (healthy)`

## Secrets
- `GEMINI_API_KEY` — Google Gemini API key (optional). Add via the Secrets page to enable AI features.
