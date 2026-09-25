# Security Policy

## Scope
This repository contains an active multi-agent application builder. Security controls apply to application code, dependencies, CI/CD, configuration, generated artifacts and repository history.

## Controls
- Security response headers are applied by the server.
- Express JSON request bodies are bounded to 256 KB.
- Production binds to loopback by default; remote production exposure requires `HOST` to be explicitly set and a 32+ character `APP_API_KEY`.
- The server disables the Express fingerprinting header.
- Secrets must be supplied through environment configuration and never committed.
- Remote production API access uses a constant-time `X-API-Key` check and keeps `/api/health` as the only unauthenticated API route.
- CI uses read-only repository permissions.
- Dependency and GitHub Actions updates are monitored through Dependabot.
- CodeQL scans JavaScript/TypeScript code.

## Secrets
Do not commit API keys, tokens, passwords, private keys, certificates or .env files. Rotate exposed credentials; deleting them from the current tree is not sufficient.

## Reporting
Report suspected vulnerabilities privately through GitHub security reporting rather than public issues. Include the affected component, reproduction steps and security impact without real credentials or personal data.
