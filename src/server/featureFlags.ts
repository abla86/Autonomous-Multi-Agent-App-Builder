import fs from 'fs';
import path from 'path';
import { FeatureFlag } from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const FLAGS_FILE = path.join(DATA_DIR, 'feature-flags.json');

const DEFAULT_FLAGS: FeatureFlag[] = [
  {
    key: 'auto_rollback_on_test_failure',
    name: 'Automated Rollback Engine',
    description: 'Automatically reverts agent merges when critical unit, integration, or E2E tests fail.',
    category: 'reliability',
    enabled: true,
    rolloutPercentage: 100,
    environment: 'all',
    updatedAt: new Date().toISOString(),
    updatedBy: 'SYSTEM_ORCHESTRATOR',
  },
  {
    key: 'standard_agent_protocol',
    name: 'Swarm Communication Protocol v2.1',
    description: 'Enforces structured inter-agent messaging (Findings, Action Requests, Shared Artifacts, Conflict Mediation).',
    category: 'swarm',
    enabled: true,
    rolloutPercentage: 100,
    environment: 'all',
    updatedAt: new Date().toISOString(),
    updatedBy: 'AGENT_1_ANALYST',
  },
  {
    key: 'conflict_arbitration_mediator',
    name: 'Arbitrator Conflict Resolution Engine',
    description: 'Designates Agent 1 (Analyst) and Agent 17 (Integrity) as arbiters for contradictory agent changes.',
    category: 'reliability',
    enabled: true,
    rolloutPercentage: 100,
    environment: 'all',
    updatedAt: new Date().toISOString(),
    updatedBy: 'AGENT_17_INTEGRITY',
  },
  {
    key: 'ast_diagnostics_code_doctor',
    name: 'AST Code Doctor Diagnostics',
    description: 'Deep syntax tree linting and automated single-click repair patches with diff preview.',
    category: 'editor',
    enabled: true,
    rolloutPercentage: 100,
    environment: 'all',
    updatedAt: new Date().toISOString(),
    updatedBy: 'AGENT_18_RECOVERY',
  },
  {
    key: 'live_worker_heatmap',
    name: 'Agent Activity Heatmap Telemetry',
    description: 'Real-time visual density matrix of agent operations, repair velocity, and hotspots.',
    category: 'swarm',
    enabled: true,
    rolloutPercentage: 100,
    environment: 'all',
    updatedAt: new Date().toISOString(),
    updatedBy: 'AGENT_8_PERFORMANCE',
  },
  {
    key: 'strict_qa_deployment_barrier',
    name: 'Agent 20 Strict QA Production Gate',
    description: 'Enforces all 16 automated production checks before generating release bundles.',
    category: 'security',
    enabled: true,
    rolloutPercentage: 100,
    environment: 'production',
    updatedAt: new Date().toISOString(),
    updatedBy: 'AGENT_20_QA',
  },
  {
    key: 'universal_document_pipeline',
    name: 'Universal Document Importer & Exporter',
    description: 'Deep parsing and exporting for Word (.docx), Excel (.xlsx), PDF, and ZIP bundles.',
    category: 'editor',
    enabled: true,
    rolloutPercentage: 100,
    environment: 'all',
    updatedAt: new Date().toISOString(),
    updatedBy: 'AGENT_15_DOCS',
  },
  {
    key: 'gemini_cloud_advisor',
    name: 'Agent 19 Gemini Cloud Intelligence',
    description: 'Multimodal AI code synthesis, semantic bug explanation, and architectural reviews.',
    category: 'swarm',
    enabled: true,
    rolloutPercentage: 100,
    environment: 'all',
    updatedAt: new Date().toISOString(),
    updatedBy: 'AGENT_19_AI',
  },
  {
    key: 'parallel_agent_workers',
    name: 'Concurrent High-Throughput Swarm Pool',
    description: 'Dispatches non-dependent agents concurrently across multi-core workers.',
    category: 'experimental',
    enabled: false,
    rolloutPercentage: 30,
    environment: 'development',
    updatedAt: new Date().toISOString(),
    updatedBy: 'AGENT_13_DEVOPS',
  },
];

export function readFeatureFlags(): FeatureFlag[] {
  try {
    if (!fs.existsSync(FLAGS_FILE)) {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(FLAGS_FILE, JSON.stringify(DEFAULT_FLAGS, null, 2), 'utf-8');
      return DEFAULT_FLAGS;
    }
    const content = fs.readFileSync(FLAGS_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : DEFAULT_FLAGS;
  } catch (err) {
    console.error('Error reading feature flags file, returning defaults:', err);
    return DEFAULT_FLAGS;
  }
}

export function writeFeatureFlags(flags: FeatureFlag[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${FLAGS_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(flags, null, 2), 'utf-8');
    fs.renameSync(tempFile, FLAGS_FILE);
  } catch (err) {
    console.error('Failed to write feature flags file:', err);
  }
}

export function getFeatureFlags(): FeatureFlag[] {
  return readFeatureFlags();
}

export function isFeatureEnabled(key: string, defaultVal: boolean = false): boolean {
  const flags = readFeatureFlags();
  const flag = flags.find((f) => f.key === key);
  return flag ? flag.enabled : defaultVal;
}

export function toggleFeatureFlag(key: string): FeatureFlag | null {
  const flags = readFeatureFlags();
  const index = flags.findIndex((f) => f.key === key);
  if (index === -1) return null;

  flags[index] = {
    ...flags[index],
    enabled: !flags[index].enabled,
    updatedAt: new Date().toISOString(),
    updatedBy: 'USER_INTERFACE',
  };
  writeFeatureFlags(flags);
  return flags[index];
}

export function updateFeatureFlag(key: string, updates: Partial<FeatureFlag>): FeatureFlag | null {
  const flags = readFeatureFlags();
  const index = flags.findIndex((f) => f.key === key);
  if (index === -1) return null;

  flags[index] = {
    ...flags[index],
    ...updates,
    key, // prevent key override
    updatedAt: new Date().toISOString(),
    updatedBy: 'USER_INTERFACE',
  };
  writeFeatureFlags(flags);
  return flags[index];
}

export function createFeatureFlag(flag: Omit<FeatureFlag, 'updatedAt'>): FeatureFlag {
  const flags = readFeatureFlags();
  const existing = flags.findIndex((f) => f.key === flag.key);
  const newFlag: FeatureFlag = {
    ...flag,
    updatedAt: new Date().toISOString(),
    updatedBy: flag.updatedBy || 'USER_INTERFACE',
  };

  if (existing >= 0) {
    flags[existing] = newFlag;
  } else {
    flags.push(newFlag);
  }
  writeFeatureFlags(flags);
  return newFlag;
}

export function deleteFeatureFlag(key: string): boolean {
  const flags = readFeatureFlags();
  const filtered = flags.filter((f) => f.key !== key);
  if (filtered.length === flags.length) return false;
  writeFeatureFlags(filtered);
  return true;
}

export function evaluateFlags(context: { env?: string; user?: string }): Record<string, boolean> {
  const flags = readFeatureFlags();
  const result: Record<string, boolean> = {};

  for (const flag of flags) {
    if (!flag.enabled) {
      result[flag.key] = false;
      continue;
    }
    // Check environment match
    if (flag.environment !== 'all' && context.env && flag.environment !== context.env) {
      result[flag.key] = false;
      continue;
    }
    // Rollout percentage check
    if (flag.rolloutPercentage < 100) {
      const hashKey = (context.user || 'anonymous') + flag.key;
      let hash = 0;
      for (let i = 0; i < hashKey.length; i++) {
        hash = (hash << 5) - hash + hashKey.charCodeAt(i);
        hash |= 0;
      }
      const bucket = Math.abs(hash) % 100;
      result[flag.key] = bucket < flag.rolloutPercentage;
    } else {
      result[flag.key] = true;
    }
  }

  return result;
}

export function resetFeatureFlagsToDefaults(): FeatureFlag[] {
  writeFeatureFlags(DEFAULT_FLAGS);
  return DEFAULT_FLAGS;
}
