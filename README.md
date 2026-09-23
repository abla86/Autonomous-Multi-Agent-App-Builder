# SWARMFORGE: Autonomous Multi-Agent Software Engineering Swarm

> **A full-stack autonomous application-builder prototype powered by a coordinated 20-agent engineering swarm, runtime performance telemetry, automated regression tests, and bounded OWASP-oriented security analysis.**

---

## Overview & Capabilities

SwarmForge orchestrates 20 specialized autonomous software engineering agents across a disciplined lifecycle:
**Scan → Diagnose → Parallel Work → Integrate → Real Testing → Production Certification**.

The repository is designed to exercise real local application behavior rather than mock-only screens. Claims below describe the current implementation and test boundaries:
- Real Express backend with persistent atomic file-system storage (`data/db.json` with temporary-write-and-rename guarantees).
- Real-time container performance telemetry tracking actual CPU percent via `process.cpuUsage()`, RSS memory, V8 heap allocations, and host system RAM.
- Real regression test suite verifying actual runtime schema invariants, REST endpoints, and end-to-end user journeys without test bypasses.
- Real vulnerability scanner evaluating AST and source code against OWASP Top 10 patterns (leaked tokens, `eval()`, unsafe headers).
- Real server-side Gemini 3.8 Flash SDK integration for architectural consultation, code refactoring, and test case synthesis.

---

## 🤖 The 20 Autonomous Specialized Agents

| # | Badge | Agent Name | Category | Operational Mandate |
|---|---|---|---|---|
| **01** | `ANL-01` | **Codebase Analyst** | Core | Entry points inspection, AST graph verification, dead code pruning |
| **02** | `FNT-02` | **Frontend Architect** | Core | React 19 component trees, hook stability, responsive design |
| **03** | `BCK-03` | **Backend Engineer** | Core | Express route controllers, JSON payload parsing, HTTP status semantics |
| **04** | `DAT-04` | **Database Specialist** | Core | Atomic disk persistence, ACID transaction isolation, schema validation |
| **05** | `API-05` | **API Inspector** | Core | Contract matching between client fetchers and server handlers |
| **06** | `AUT-06` | **Auth Guardian** | Quality | Route guards, authentication boundaries, credential protection |
| **07** | `SEC-07` | **Security Sentinel** | Quality | Leaked API key detection, OWASP Top 10 prevention, safe HTTP headers |
| **08** | `PRF-08` | **Performance Optimizer** | Quality | Bundle size auditing, memory leak prevention, async bottlenecks |
| **09** | `UXD-09` | **UX Designer** | Product | Ergonomics, feedback latency, layout balance, interaction polish |
| **10** | `A11Y-10` | **Accessibility Auditor** | Product | WCAG AA contrast compliance, keyboard navigation, aria-label checks |
| **11** | `TST-11` | **Test Engineer** | Quality | Genuine unit assertions, edge-case checks, boundary testing |
| **12** | `E2E-12` | **E2E Scenario Runner** | Quality | User journeys: OPEN → FEATURE → MUTATE → RELOAD roundtrip |
| **13** | `OPS-13` | **DevOps Engineer** | Infrastructure | Port 3000 container binding, Esbuild bundling, clean builds |
| **14** | `DEP-14` | **Dependency Sentinel**| Infrastructure | Manifest lock verification, peer dependency compatibility |
| **15** | `DOC-15` | **Technical Documenter** | Infrastructure | Living API specifications, architecture blueprints, runbooks |
| **16** | `PRD-16` | **Product Logic Verifier** | Product | Core value flow verification, elimination of mock stubs |
| **17** | `INT-17` | **Data Integrity Guardian** | Core | Race condition prevention, entity uniqueness constraints |
| **18** | `REC-18` | **Error Recovery Specialist** | Core | Graceful degradation, unhandled rejection interception |
| **19** | `AI-19` | **AI Integration Agent** | Product | Server-side Gemini 3.8 Flash SDK integration with telemetry |
| **20** | `QA-20` | **Final QA Chief** | Quality | 16-point Final Acceptance Checklist and deployment sign-off |

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
- `POST /api/projects/:id/swarm/run`: Executes all 20 agents autonomously, returning phase logs, audit findings, and repairs.
- `POST /api/projects/:id/tests/run`: Executes automated Unit, Integration, API, and E2E assertions.
- `POST /api/projects/:id/security-scan`: Scans repository code against OWASP Top 10 vulnerabilities.
- `POST /api/projects/:id/ai/consult`: Consults Agent 19 using server-side Gemini 3.8 Flash for refactoring and test generation.
- `GET /api/projects/:id/deploy-check`: Evaluates the strict 16-point Final QA Acceptance Checklist.

---

## 🚀 Running & Verification

```bash
# Install dependencies
npm install

# Start development server (Port 3000)
npm run dev

# Run TypeScript linter
npm run lint

# Compile production bundle
npm run build
```
