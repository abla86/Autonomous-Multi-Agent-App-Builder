# SWARMFORGE: Multi-Agent Application Builder Prototype

> **A full-stack application-builder prototype with project/file management, server telemetry, bounded static source checks, AI-generated suggestions, and evidence-based validation gates. The 20 agent entries are role definitions; they are not currently 20 independently executing autonomous workers.**

---

## Overview & Capabilities

SwarmForge currently provides a project dashboard and backend services, but it is **not yet a fully autonomous app builder**. Its source inspection endpoint runs limited text-pattern and project-integrity checks; it does not build or execute user projects, automatically repair code, or run 20 independent agents.

Current implementation:
- Express backend with JSON-file persistence using temporary-write-and-rename (`data/db.json`). This is suitable for a prototype, not a multi-writer production database.
- Process-level CPU and memory telemetry for the builder server.
- Project-integrity assertions that inspect stored project records and persisted JSON. They do not represent runtime/API/browser E2E testing of a generated app.
- Heuristic source scanner for selected secret, dynamic-code, HTML-rendering, and shell-execution patterns. It is not a complete OWASP audit and does not inspect dependency advisories or runtime data flow.
- Server-side Gemini consultation when `GEMINI_API_KEY` is configured. The AI endpoint returns suggestions; it does not automatically apply, build, or verify code changes.
- A deployment gate that deliberately blocks readiness while required build, dependency, runtime-security, and browser E2E evidence is unavailable.

Do not treat a green project-integrity check, a clean heuristic scan, or a successful server build as proof that a generated application is production-ready.

---

## 🤖 The 20 Defined Agent Roles

The following table documents intended role responsibilities, not proof that each capability is implemented. The current swarm endpoint performs a limited static inspection and returns role-grouped findings; the other responsibilities remain planned or unverified.

| # | Badge | Agent Name | Category | Defined Responsibility |
|---|---|---|---|---|
| **01** | `ANL-01` | **Codebase Analyst** | Core | Project/file metadata checks and selected source-pattern inspection |
| **02** | `FNT-02` | **Frontend Architect** | Core | Limited frontend file and selected markup-pattern checks |
| **03** | `BCK-03` | **Backend Engineer** | Core | Role definition; generated project backend is not executed by the inspection route |
| **04** | `DAT-04` | **Database Specialist** | Core | Limited duplicate-path and stored-project integrity checks |
| **05** | `API-05` | **API Inspector** | Core | Contract matching between client fetchers and server handlers |
| **06** | `AUT-06` | **Auth Guardian** | Quality | Route guards, authentication boundaries, credential protection |
| **07** | `SEC-07` | **Security Sentinel** | Quality | Selected source-pattern checks; no full OWASP, dependency, or runtime audit |
| **08** | `PRF-08` | **Performance Optimizer** | Quality | Bundle size auditing, memory leak prevention, async bottlenecks |
| **09** | `UXD-09` | **UX Designer** | Product | Ergonomics, feedback latency, layout balance, interaction polish |
| **10** | `A11Y-10` | **Accessibility Auditor** | Product | WCAG AA contrast compliance, keyboard navigation, aria-label checks |
| **11** | `TST-11` | **Test Engineer** | Quality | Stored-project integrity assertions; does not execute the generated app's test suite |
| **12** | `E2E-12` | **E2E Scenario Runner** | Quality | Defined role only; browser E2E tests are not run by the current backend endpoint |
| **13** | `OPS-13` | **DevOps Engineer** | Infrastructure | Defined role only; the generated project is not built by the inspection endpoint |
| **14** | `DEP-14` | **Dependency Sentinel**| Infrastructure | Defined role only; generated-project dependency audits are not performed |
| **15** | `DOC-15` | **Technical Documenter** | Infrastructure | Living API specifications, architecture blueprints, runbooks |
| **16** | `PRD-16` | **Product Logic Verifier** | Product | Core value flow verification, elimination of mock stubs |
| **17** | `INT-17` | **Data Integrity Guardian** | Core | Race condition prevention, entity uniqueness constraints |
| **18** | `REC-18` | **Error Recovery Specialist** | Core | Graceful degradation, unhandled rejection interception |
| **19** | `AI-19` | **AI Integration Agent** | Product | Separate AI consultation endpoint; not invoked by static source inspection |
| **20** | `QA-20` | **Final QA Chief** | Quality | Evidence-based gate; unverified build, runtime, dependency and E2E checks block readiness |

---

## ⚡ Real-Time System Performance Sentinel & Canvas Telemetry

Located directly in the **20-Agent Swarm** tab, the real-time performance sentinel monitors process-level metrics with hardware-accelerated canvas sparklines:

- **Dual Canvas Sparkline Charts**: High-performance HTML5 Canvas sparklines (powered by Chart.js) rendering:
  - **CPU Utilization Sparkline**: Instantaneous and rolling CPU percent with smooth bezier interpolation, gradient fills, and peak tracking.
  - **Memory Heap Allocation Sparkline**: Dual-series canvas tracking V8 Heap Used vs Heap Total (MB) and Process RSS with real-time capacity headroom.
  - **Layout Controls**: Toggle between Side-by-Side (Dual), CPU-focused, or Memory Heap-focused canvas modes.
- **Session Historical Mode**: Toggle between:
  - **Live Rolling Window (60s)**: High-frequency real-time continuous stream with configurable sampling rate (1s, 2s, 5s).
  - **Session Historical Mode**: Comprehensive timeline tracking performance from session inception, capturing all lifecycle telemetry points.
- **Session Lifecycle Milestones**: Highlights key events on the timeline (Session Inception, Swarm Orchestration Runs, V8 GC Flushes, Test Validations) with interactive inspection badges.
- **Session Performance Summary Dashboard**:
  - Session start timestamp and total elapsed runtime.
  - Peak CPU spike (%) and minimum CPU recorded across the session.
  - Session-wide average CPU utilization.
  - Peak heap memory allocation vs initial heap at boot.
  - Total V8 memory flushes and total completed swarm cycles.
  - Historical filtering: "All Session", "Last 5m", "Last 15m", and "Swarm Runs Only".
- **Interactive Controls**:
  - Live Stream Pause / Resume toggle.
  - Sampling interval selector (1s, 2s, 5s).
  - V8 Garbage Collection & Cache Flush trigger (`POST /api/system/gc`).
  - High-water mark reset (`POST /api/system/performance/reset`).
  - Process diagnostics drawer displaying PID, platform, architecture, load averages, and uptime.

---

## 🛠️ API Routes Reference

### System & Health
- `GET /api/health`: Container health check, uptime, and database connectivity.
- `GET /api/system/status`: High-level system statistics and agent pool count.
- `GET /api/system/performance`: Real-time CPU, memory, swarm stats, and rolling history points.
- `GET /api/system/performance/stream`: Server-Sent Events (SSE) 1000ms real-time metric stream.
- `POST /api/system/performance/reset`: Resets peak memory high-water mark.
- `POST /api/system/gc`: Invokes V8 garbage collection and cache pruning.

### Project & Code Repository
- `GET /api/projects`: List all managed software projects.
- `GET /api/projects/:id`: Get detailed project metadata and repository files.
- `POST /api/projects`: Initialize a new project scaffold.
- `PUT /api/projects/:id`: Update project details.
- `DELETE /api/projects/:id`: Remove project from store.
- `POST /api/projects/:id/files`: Create or update a source code file.
- `DELETE /api/projects/:id/files/:fileId`: Delete a file from repository.
- `GET /api/projects/:id/export`: Export project as a downloadable JSON architecture blueprint.

### Swarm & Quality Assurance
- `POST /api/projects/:id/swarm/run`: Runs limited source-text inspection over stored files and returns role-grouped findings. It does not execute independent agents or apply repairs.
- `POST /api/projects/:id/tests/run`: Runs actual project metadata, file-integrity, and persisted-JSON assertions. It does not run API or browser E2E tests against the generated app.
- `POST /api/projects/:id/security-scan`: Runs a bounded heuristic source-pattern scan; it is not a full security audit.
- `POST /api/projects/:id/ai/consult`: Returns server-side Gemini suggestions if configured, or clearly labeled heuristic fallback suggestions. It does not apply or verify code changes.
- `GET /api/projects/:id/deploy-check`: Checks project integrity and reports unverified build, runtime, dependency and browser E2E checks as blockers.

---

## 🚀 Running & Verification

```bash
# Install dependencies
npm install

# Start development server (Port 3000)
npm run dev

# Typecheck
npm run lint

# Run automated tests (including API security helper tests)
npm test

# Compile production bundle
npm run build
```
