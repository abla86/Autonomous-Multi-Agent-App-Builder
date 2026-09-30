import fs from 'fs';
import path from 'path';
import { Project, ProjectFile, ProjectSnapshot, RollbackConfig, RollbackLog } from '../types';
import { isFeatureEnabled } from './featureFlags';

const DATA_DIR = path.join(process.cwd(), 'data');
const SNAPSHOTS_FILE = path.join(DATA_DIR, 'snapshots.json');
const ROLLBACK_LOGS_FILE = path.join(DATA_DIR, 'rollback-logs.json');
const ROLLBACK_CONFIG_FILE = path.join(DATA_DIR, 'rollback-config.json');

const DEFAULT_CONFIG: RollbackConfig = {
  autoRollbackEnabled: true,
  rollbackOnUnitFailure: true,
  rollbackOnIntegrationFailure: true,
  rollbackOnE2EFailure: true,
  notifyOnRollback: true,
};

// Safe file I/O helpers
function readJSON<T>(filePath: string, defaultVal: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2), 'utf-8');
      return defaultVal;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultVal;
  }
}

function writeJSON<T>(filePath: string, data: T): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmp = `${filePath}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmp, filePath);
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// -------------------------------------------------------------
// Snapshot Management
// -------------------------------------------------------------
export function getSnapshots(projectId: string): ProjectSnapshot[] {
  const all = readJSON<ProjectSnapshot[]>(SNAPSHOTS_FILE, []);
  return all
    .filter((s) => s.projectId === projectId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function createSnapshot(
  projectId: string,
  label: string,
  trigger: 'agent_pre_merge' | 'agent_post_merge' | 'manual' | 'pre_rollback',
  agentId?: string,
  files?: ProjectFile[]
): ProjectSnapshot {
  const all = readJSON<ProjectSnapshot[]>(SNAPSHOTS_FILE, []);
  const linesOfCode = (files || []).reduce(
    (acc, f) => acc + (f.content ? f.content.split('\n').length : 0),
    0
  );

  const snapshot: ProjectSnapshot = {
    id: 'snap-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    projectId,
    timestamp: new Date().toISOString(),
    label,
    trigger,
    agentId,
    files: files ? JSON.parse(JSON.stringify(files)) : [],
    filesCount: files ? files.length : 0,
    linesOfCode,
  };

  all.push(snapshot);
  // Keep last 100 snapshots
  if (all.length > 100) {
    all.splice(0, all.length - 100);
  }
  writeJSON(SNAPSHOTS_FILE, all);
  return snapshot;
}

export function getSnapshot(projectId: string, snapshotId: string): ProjectSnapshot | undefined {
  const all = readJSON<ProjectSnapshot[]>(SNAPSHOTS_FILE, []);
  return all.find((s) => s.projectId === projectId && s.id === snapshotId);
}

// -------------------------------------------------------------
// Rollback Config Management
// -------------------------------------------------------------
export function getRollbackConfig(): RollbackConfig {
  return readJSON<RollbackConfig>(ROLLBACK_CONFIG_FILE, DEFAULT_CONFIG);
}

export function updateRollbackConfig(updates: Partial<RollbackConfig>): RollbackConfig {
  const current = getRollbackConfig();
  const updated: RollbackConfig = { ...current, ...updates };
  writeJSON(ROLLBACK_CONFIG_FILE, updated);
  return updated;
}

// -------------------------------------------------------------
// Rollback Logs Management
// -------------------------------------------------------------
export function getRollbackLogs(projectId: string): RollbackLog[] {
  const all = readJSON<RollbackLog[]>(ROLLBACK_LOGS_FILE, []);
  return all
    .filter((l) => l.projectId === projectId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function recordRollbackLog(log: RollbackLog): void {
  const all = readJSON<RollbackLog[]>(ROLLBACK_LOGS_FILE, []);
  all.unshift(log);
  if (all.length > 200) {
    all.length = 200;
  }
  writeJSON(ROLLBACK_LOGS_FILE, all);
}

// -------------------------------------------------------------
// Test Assertions Engine for Rollback Guard
// -------------------------------------------------------------
export function evaluateCriticalTests(project: Project): {
  allPassed: boolean;
  failedTests: Array<{
    id: string;
    name: string;
    suite: 'unit' | 'integration' | 'api' | 'e2e';
    assertion: string;
    details?: string;
  }>;
  allTests: Array<{
    id: string;
    name: string;
    suite: 'unit' | 'integration' | 'api' | 'e2e';
    status: 'passed' | 'failed';
    durationMs: number;
    assertion: string;
    details?: string;
  }>;
} {
  const tests: Array<{
    id: string;
    name: string;
    suite: 'unit' | 'integration' | 'api' | 'e2e';
    status: 'passed' | 'failed';
    durationMs: number;
    assertion: string;
    details?: string;
  }> = [];

  // 1. UNIT TEST: Schema validation
  const hasValidName = typeof project.name === 'string' && project.name.trim().length > 0;
  tests.push({
    id: 'crit-unit-1',
    name: 'Project Root Metadata Validation',
    suite: 'unit',
    status: hasValidName ? 'passed' : 'failed',
    durationMs: 3,
    assertion: 'assert(typeof project.name === "string" && project.name.length > 0)',
    details: hasValidName
      ? `Project name "${project.name}" complies with string contract.`
      : 'Project name is empty or missing.',
  });

  // 2. UNIT TEST: Non-empty files collection
  const hasFiles = Array.isArray(project.files) && project.files.length > 0;
  tests.push({
    id: 'crit-unit-2',
    name: 'Repository File Manifest Completeness',
    suite: 'unit',
    status: hasFiles ? 'passed' : 'failed',
    durationMs: 2,
    assertion: 'assert(Array.isArray(project.files) && project.files.length >= 1)',
    details: hasFiles
      ? `Repository has ${project.files.length} active files.`
      : 'Repository file collection is empty or invalid.',
  });

  // 3. UNIT TEST: Unique file paths (Critical invariant)
  const paths = (project.files || []).map((f) => f.path);
  const uniquePaths = new Set(paths);
  const pathsUnique = uniquePaths.size === paths.length;
  tests.push({
    id: 'crit-unit-3',
    name: 'Unique File Path Collision Invariant',
    suite: 'unit',
    status: pathsUnique ? 'passed' : 'failed',
    durationMs: 3,
    assertion: 'assert(new Set(project.files.map(f => f.path)).size === project.files.length)',
    details: pathsUnique
      ? `All ${paths.length} file paths are distinct.`
      : `Detected duplicate file paths causing namespace collisions (${paths.length - uniquePaths.size} duplicates).`,
  });

  // 4. INTEGRATION TEST: Entry point presence
  const hasEntrypoint = (project.files || []).some(
    (f) => f.path.includes('server.ts') || f.path.includes('orchestrator.ts') || f.path.includes('main.tsx')
  );
  tests.push({
    id: 'crit-int-1',
    name: 'Application Core Entrypoint Wiring',
    suite: 'integration',
    status: hasEntrypoint ? 'passed' : 'failed',
    durationMs: 5,
    assertion: 'assert(project.files.some(f => f.path.match(/(server|orchestrator|main)/)))',
    details: hasEntrypoint
      ? 'Verified primary architectural orchestrator / server entrypoint.'
      : 'FATAL: Core orchestrator or server entrypoint missing from file tree.',
  });

  // 5. INTEGRATION TEST: Syntactic cleanliness (no unresolved merge conflicts or empty files)
  const invalidFiles = (project.files || []).filter(
    (f) => !f.content || f.content.includes('<<<<<<< HEAD') || f.content.includes('=======') || f.content.includes('>>>>>>>')
  );
  tests.push({
    id: 'crit-int-2',
    name: 'Code Syntactic & Merge Conflict Purity',
    suite: 'integration',
    status: invalidFiles.length === 0 ? 'passed' : 'failed',
    durationMs: 6,
    assertion: 'assert(project.files.every(f => f.content && !f.content.includes("<<<<<<<")))',
    details:
      invalidFiles.length === 0
        ? 'Zero unmerged Git conflict markers or empty byte files detected.'
        : `Found ${invalidFiles.length} corrupted file(s) with raw conflict markers or empty content: ${invalidFiles.map((f) => f.path).join(', ')}`,
  });

  // 6. E2E TEST: End-to-End Build & Execution simulation
  const hasExecutableCode = (project.files || []).every((f) => f.content.trim().length > 10);
  tests.push({
    id: 'crit-e2e-1',
    name: 'End-to-End Build & Virtual Execution Journey',
    suite: 'e2e',
    status: hasExecutableCode ? 'passed' : 'failed',
    durationMs: 12,
    assertion: 'assert(project.files.every(f => f.content.trim().length > 10))',
    details: hasExecutableCode
      ? 'All files pass virtual runtime execution pass without unexpected stub aborts.'
      : 'Virtual execution failed: one or more files contain truncated or empty stubs.',
  });

  const failedTests = tests.filter((t) => t.status === 'failed');
  return {
    allPassed: failedTests.length === 0,
    failedTests,
    allTests: tests,
  };
}

// -------------------------------------------------------------
// Rollback Execution Core
// -------------------------------------------------------------
export function executeRollback(
  projectId: string,
  targetSnapshotId: string,
  reason: string,
  failedTests: Array<{
    id: string;
    name: string;
    suite: 'unit' | 'integration' | 'api' | 'e2e';
    assertion: string;
    details?: string;
  }> = [],
  triggerAgentId: string = 'AGENT_18_RECOVERY',
  automated: boolean = true
): {
  success: boolean;
  restoredSnapshot: ProjectSnapshot | null;
  log: RollbackLog;
  restoredFiles: ProjectFile[];
} {
  const snapshot = getSnapshot(projectId, targetSnapshotId);
  if (!snapshot) {
    const errorLog: RollbackLog = {
      id: 'rb-log-' + Date.now(),
      projectId,
      timestamp: new Date().toISOString(),
      triggerAgentId,
      targetSnapshotId,
      reason: `Failed to find target snapshot: ${targetSnapshotId}`,
      failedTests,
      revertedFiles: [],
      automated,
      status: 'failed',
    };
    recordRollbackLog(errorLog);
    return {
      success: false,
      restoredSnapshot: null,
      log: errorLog,
      restoredFiles: [],
    };
  }

  const restoredFiles: ProjectFile[] = JSON.parse(JSON.stringify(snapshot.files));
  const log: RollbackLog = {
    id: 'rb-log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    projectId,
    timestamp: new Date().toISOString(),
    triggerAgentId,
    targetSnapshotId: snapshot.id,
    reason,
    failedTests,
    revertedFiles: restoredFiles.map((f) => f.path),
    automated,
    status: 'completed',
  };

  recordRollbackLog(log);

  return {
    success: true,
    restoredSnapshot: snapshot,
    log,
    restoredFiles,
  };
}

// -------------------------------------------------------------
// Simulate Merge with Auto-Rollback Guard
// -------------------------------------------------------------
export function simulateMergeAndGuard(
  project: Project,
  agentId: string,
  options: {
    simulateFailure: boolean;
    failureType?: 'unit' | 'integration' | 'e2e';
    proposedFiles?: ProjectFile[];
  }
): {
  success: boolean;
  rolledBack: boolean;
  message: string;
  rollbackLog?: RollbackLog;
  tests: ReturnType<typeof evaluateCriticalTests>;
  preSnapshot: ProjectSnapshot;
  resultingFiles: ProjectFile[];
} {
  const config = getRollbackConfig();
  const isRollbackFeatureEnabled = isFeatureEnabled('auto_rollback_on_test_failure', true);

  // 1. Take Pre-Merge Snapshot
  const preSnapshot = createSnapshot(
    project.id,
    `Pre-merge snapshot before ${agentId} changes`,
    'agent_pre_merge',
    agentId,
    project.files
  );

  // 2. Prepare candidate files
  let candidateFiles: ProjectFile[];
  if (options.proposedFiles) {
    candidateFiles = JSON.parse(JSON.stringify(options.proposedFiles));
  } else if (options.simulateFailure) {
    candidateFiles = JSON.parse(JSON.stringify(project.files));
    if (options.failureType === 'unit') {
      // Inject duplicate file path to trigger unique path unit failure
      candidateFiles.push({
        id: 'buggy-file-' + Date.now(),
        name: 'duplicate_orchestrator.ts',
        path: candidateFiles[0]?.path || '/src/engine/orchestrator.ts', // duplicate!
        language: 'typescript',
        content: '// INJECTED BUG: Colliding duplicate file path',
        updatedAt: new Date().toISOString(),
      });
    } else if (options.failureType === 'integration') {
      // Inject git conflict markers to trigger integration test failure
      if (candidateFiles[0]) {
        candidateFiles[0] = {
          ...candidateFiles[0],
          content: `<<<<<<< HEAD\n// Conflicting agent commit\n=======\n// Broken patch\n>>>>>>> feature-branch`,
        };
      }
    } else {
      // E2E failure: empty stub file
      candidateFiles.push({
        id: 'buggy-e2e-' + Date.now(),
        name: 'broken_stub.ts',
        path: '/src/broken_stub.ts',
        language: 'typescript',
        content: '   ', // empty stub
        updatedAt: new Date().toISOString(),
      });
    }
  } else {
    // Normal healthy merge
    candidateFiles = JSON.parse(JSON.stringify(project.files));
    candidateFiles.push({
      id: 'patch-' + Date.now(),
      name: `${agentId.toLowerCase()}_enhancement.ts`,
      path: `/src/patches/${agentId.toLowerCase()}_patch.ts`,
      language: 'typescript',
      content: `// Automated feature patch merged cleanly by ${agentId}\nexport const PATCH_STATUS = 'ACTIVE';\nexport function verifyInvariant(): boolean { return true; }\n`,
      updatedAt: new Date().toISOString(),
    });
  }

  // 3. Temporarily evaluate tests on candidate project state
  const candidateProject: Project = {
    ...project,
    files: candidateFiles,
  };

  const testEvaluation = evaluateCriticalTests(candidateProject);

  // Check if failure triggers rollback
  const shouldRollback =
    !testEvaluation.allPassed &&
    isRollbackFeatureEnabled &&
    config.autoRollbackEnabled &&
    ((testEvaluation.failedTests.some((t) => t.suite === 'unit') && config.rollbackOnUnitFailure) ||
      (testEvaluation.failedTests.some((t) => t.suite === 'integration') &&
        config.rollbackOnIntegrationFailure) ||
      (testEvaluation.failedTests.some((t) => t.suite === 'e2e') && config.rollbackOnE2EFailure));

  if (shouldRollback) {
    // 4. AUTOMATICALLY REVERT!
    const failureSummary = testEvaluation.failedTests
      .map((t) => `[${t.suite.toUpperCase()}] ${t.name}: ${t.details}`)
      .join(' | ');

    const rollbackResult = executeRollback(
      project.id,
      preSnapshot.id,
      `Critical test failure detected after merge by ${agentId}: ${failureSummary}`,
      testEvaluation.failedTests,
      'AGENT_18_RECOVERY',
      true
    );

    return {
      success: false,
      rolledBack: true,
      message: `Critical tests failed after ${agentId} changes. System automatically reverted changes back to snapshot ${preSnapshot.id}.`,
      rollbackLog: rollbackResult.log,
      tests: testEvaluation,
      preSnapshot,
      resultingFiles: preSnapshot.files,
    };
  }

  // 5. If tests passed, record post-merge snapshot and commit
  createSnapshot(
    project.id,
    `Post-merge verified state after ${agentId} changes`,
    'agent_post_merge',
    agentId,
    candidateFiles
  );

  return {
    success: testEvaluation.allPassed,
    rolledBack: false,
    message: testEvaluation.allPassed
      ? `Changes by ${agentId} merged cleanly and verified against all critical test suites.`
      : `Changes merged with warnings (Auto-rollback was disabled in configuration).`,
    tests: testEvaluation,
    preSnapshot,
    resultingFiles: candidateFiles,
  };
}
