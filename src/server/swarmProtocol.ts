import fs from 'fs';
import path from 'path';
import { AgentId, SwarmConflict, SwarmProtocolMessage, SwarmResolution } from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const PROTOCOL_FILE = path.join(DATA_DIR, 'protocol-messages.json');

const INITIAL_MESSAGES: SwarmProtocolMessage[] = [
  {
    id: 'msg-proto-001',
    protocolVersion: '2.1-swarm',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    senderId: 'AGENT_1_ANALYST',
    recipientId: 'BROADCAST',
    type: 'SHARE_INTERMEDIATE_RESULT',
    priority: 'P1_HIGH',
    title: 'AST Dependency Graph & Symbol Registry Broadcast',
    content: 'Parsed all project modules. Symbol table generated with 42 exported interfaces and 0 circular imports.',
    intermediateResult: {
      artifactType: 'ast',
      summary: 'Project AST tokenization completed across 6 files.',
      data: {
        totalSymbols: 42,
        entrypoints: ['/server.ts', '/src/engine/orchestrator.ts'],
        dependencies: [
          { from: '/src/engine/orchestrator.ts', to: '/src/db/storage.ts' },
          { from: '/server.ts', to: '/src/engine/orchestrator.ts' },
        ],
      },
    },
    status: 'delivered',
  },
  {
    id: 'msg-proto-002',
    protocolVersion: '2.1-swarm',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    senderId: 'AGENT_7_SECURITY',
    recipientId: 'AGENT_3_BACKEND',
    type: 'REPORT_FINDINGS',
    priority: 'P0_CRITICAL',
    title: 'Input Deserialization & Route Guard Vulnerability Report',
    content: 'Detected unvalidated JSON body parameters in Express route handler. Potential payload injection vector.',
    findings: [
      {
        id: 'sec-f-1',
        rule: 'CWE-20: Improper Input Validation',
        severity: 'critical',
        targetFile: '/server.ts',
        description: 'POST /api/tasks lacks strict type checking on task payload attributes before memory insertion.',
        suggestedFix: 'Implement Zod or TypeScript guard wrapper ensuring strict string & priority enum matching.',
      },
      {
        id: 'sec-f-2',
        rule: 'CWE-79: Security Header Hardening',
        severity: 'high',
        targetFile: '/server.ts',
        description: 'Missing Content-Security-Policy (CSP) header in root router pipeline.',
        suggestedFix: "Attach res.setHeader('Content-Security-Policy', default-src 'self').",
      },
    ],
    status: 'acknowledged',
  },
  {
    id: 'msg-proto-003',
    protocolVersion: '2.1-swarm',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    senderId: 'AGENT_2_FRONTEND',
    recipientId: 'AGENT_5_API',
    type: 'REQUEST_ACTION',
    priority: 'P1_HIGH',
    title: 'Request Reactive Server-Sent Events Endpoint for Live Swarm Telemetry',
    content: 'The frontend dashboard requires low-latency event streaming rather than 1000ms polling.',
    actionRequest: {
      actionType: 'EXPOSE_SSE_ENDPOINT',
      targetFile: '/server.ts',
      parameters: {
        endpoint: '/api/swarm/events',
        mimeType: 'text/event-stream',
        keepAliveIntervalMs: 5000,
        events: ['task_scheduled', 'task_completed', 'worker_metrics'],
      },
      expectedOutcome: 'Direct streaming connection without HTTP socket starvation.',
      deadlineMs: 3000,
    },
    status: 'processing',
  },
  {
    id: 'msg-proto-004',
    protocolVersion: '2.1-swarm',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    senderId: 'AGENT_8_PERFORMANCE',
    recipientId: 'AGENT_7_SECURITY',
    type: 'CONFLICT_DETECTED',
    priority: 'P0_CRITICAL',
    title: 'Divergent Modification Invariant Collision: Input Sanitization vs Latency SLA',
    content: 'Agent 8 Performance optimization proposal collides directly with Agent 7 Security invariant in /server.ts.',
    conflict: {
      conflictId: 'cfl-perf-sec-01',
      conflictingAgentIds: ['AGENT_8_PERFORMANCE', 'AGENT_7_SECURITY'],
      targetResource: '/server.ts:254',
      subject: 'Deep Recursive Payload Sanitization Middleware',
      agentAProposal: {
        agentId: 'AGENT_8_PERFORMANCE',
        change: 'Bypass deep recursive regex sanitization on high-throughput /api/tasks to achieve <5ms latency SLA.',
        rationale: 'Deep regex parsing adds 14.2ms per request during high concurrent agent load.',
      },
      agentBProposal: {
        agentId: 'AGENT_7_SECURITY',
        change: 'Strict recursive regex sanitization on all inbound JSON payloads to enforce CWE-20 zero-trust barrier.',
        rationale: 'Allowing unvalidated payload bypass opens memory injection and denial-of-service vulnerabilities.',
      },
      status: 'analyzing',
    },
    status: 'processing',
  },
  {
    id: 'msg-proto-005',
    protocolVersion: '2.1-swarm',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    senderId: 'AGENT_1_ANALYST',
    recipientId: 'BROADCAST',
    type: 'CONFLICT_RESOLVED',
    priority: 'P0_CRITICAL',
    correlationId: 'msg-proto-004',
    title: 'Arbitration Complete: Priority Override & Pre-Compiled Fast Schema Cache Applied',
    content: 'Designated Arbiter Agent 1 resolved conflict cfl-perf-sec-01 using PRIORITY_OVERRIDE with Memoized Fast-Path.',
    resolution: {
      resolvedBy: 'AGENT_1_ANALYST',
      strategy: 'PRIORITY_OVERRIDE',
      decision:
        'Security invariant CWE-20 strictly takes precedence over P2 performance micro-optimization. However, compiled regular expressions were memoized into an LRU cache, reducing sanitization overhead from 14.2ms to 1.1ms, satisfying both security and latency requirements.',
      appliedChanges:
        'Added PreCompiledRegexCache in /server.ts with fallback to safe strict sanitizer. Zero security compromises.',
      resolvedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    },
    status: 'resolved',
  },
];

function readMessages(): SwarmProtocolMessage[] {
  try {
    if (!fs.existsSync(PROTOCOL_FILE)) {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(PROTOCOL_FILE, JSON.stringify(INITIAL_MESSAGES, null, 2), 'utf-8');
      return INITIAL_MESSAGES;
    }
    const raw = fs.readFileSync(PROTOCOL_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_MESSAGES;
  } catch (err) {
    console.error('Error reading protocol messages:', err);
    return INITIAL_MESSAGES;
  }
}

function writeMessages(messages: SwarmProtocolMessage[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmp = `${PROTOCOL_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(messages, null, 2), 'utf-8');
    fs.renameSync(tmp, PROTOCOL_FILE);
  } catch (err) {
    console.error('Failed to write protocol messages:', err);
  }
}

export function getProtocolMessages(filter?: {
  senderId?: string;
  recipientId?: string;
  type?: string;
  status?: string;
}): SwarmProtocolMessage[] {
  let list = readMessages();
  if (filter?.senderId) {
    list = list.filter((m) => m.senderId === filter.senderId);
  }
  if (filter?.recipientId) {
    list = list.filter((m) => m.recipientId === filter.recipientId || m.recipientId === 'BROADCAST');
  }
  if (filter?.type) {
    list = list.filter((m) => m.type === filter.type);
  }
  if (filter?.status) {
    list = list.filter((m) => m.status === filter.status);
  }
  return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function sendProtocolMessage(
  data: Omit<SwarmProtocolMessage, 'id' | 'timestamp' | 'protocolVersion'>
): SwarmProtocolMessage {
  const all = readMessages();
  const msg: SwarmProtocolMessage = {
    ...data,
    id: 'msg-proto-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    protocolVersion: '2.1-swarm',
    timestamp: new Date().toISOString(),
  };

  all.unshift(msg);
  if (all.length > 300) {
    all.length = 300;
  }
  writeMessages(all);
  return msg;
}

export function resolveConflict(
  conflictId: string,
  resolution: {
    resolvedBy: AgentId;
    strategy: 'PRIORITY_OVERRIDE' | 'ARBITRATED_MERGE' | 'SAFETY_FIRST_ROLLBACK' | 'SEMANTIC_CONSENSUS';
    decision: string;
    appliedChanges: string;
  }
): SwarmProtocolMessage | null {
  const all = readMessages();
  const conflictMsg = all.find((m) => m.conflict && m.conflict.conflictId === conflictId);
  if (!conflictMsg || !conflictMsg.conflict) return null;

  // Mark conflict as resolved
  conflictMsg.conflict.status = 'resolved';
  conflictMsg.status = 'resolved';

  const resolutionMessage: SwarmProtocolMessage = {
    id: 'msg-proto-res-' + Date.now(),
    protocolVersion: '2.1-swarm',
    timestamp: new Date().toISOString(),
    senderId: resolution.resolvedBy,
    recipientId: 'BROADCAST',
    type: 'CONFLICT_RESOLVED',
    priority: 'P0_CRITICAL',
    correlationId: conflictMsg.id,
    title: `Conflict ${conflictId} Arbitrated by ${resolution.resolvedBy}`,
    content: resolution.decision,
    resolution: {
      resolvedBy: resolution.resolvedBy,
      strategy: resolution.strategy,
      decision: resolution.decision,
      appliedChanges: resolution.appliedChanges,
      resolvedAt: new Date().toISOString(),
    },
    status: 'resolved',
  };

  all.unshift(resolutionMessage);
  writeMessages(all);
  return resolutionMessage;
}

export function simulateProtocolCycle(projectId: string): {
  newMessages: SwarmProtocolMessage[];
  conflictResolved?: SwarmConflict;
} {
  const sampleMessages: Array<Omit<SwarmProtocolMessage, 'id' | 'timestamp' | 'protocolVersion'>> = [
    {
      senderId: 'AGENT_11_TEST',
      recipientId: 'AGENT_2_FRONTEND',
      type: 'REPORT_FINDINGS',
      priority: 'P1_HIGH',
      title: 'Component Test Assertion Coverage Report',
      content: 'Identified 3 edge cases without automated assertions in UI modal dialogs.',
      findings: [
        {
          id: 'tst-f-' + Date.now(),
          rule: 'A11Y-TEST-01',
          severity: 'medium',
          targetFile: '/src/components/Navbar.tsx',
          description: 'Escape key close handler missing keyboard focus trap assertion.',
          suggestedFix: 'Add fireEvent.keyDown(modal, { key: "Escape" }) test spec.',
        },
      ],
      status: 'delivered',
    },
    {
      senderId: 'AGENT_4_DATABASE',
      recipientId: 'AGENT_3_BACKEND',
      type: 'SHARE_INTERMEDIATE_RESULT',
      priority: 'P2_NORMAL',
      title: 'Optimized Schema Index & Query Plan Artifact',
      content: 'Calculated index selectivity ratios for atomic store key access. Cost reduced by 40%.',
      intermediateResult: {
        artifactType: 'schema_def',
        summary: 'Primary key b-tree cache footprint reduced to 12KB.',
        data: {
          indexCount: 4,
          avgLookupMs: 0.12,
          tablesChecked: ['projects', 'auditLogs', 'snapshots'],
        },
      },
      status: 'delivered',
    },
    {
      senderId: 'AGENT_17_INTEGRITY',
      recipientId: 'AGENT_18_RECOVERY',
      type: 'REQUEST_ACTION',
      priority: 'P1_HIGH',
      title: 'Request Atomic Pre-Merge Snapshot Checkpoint',
      content: 'Prepare pre-merge snapshot before incoming parallel agent mutations commit.',
      actionRequest: {
        actionType: 'CREATE_SNAPSHOT_CHECKPOINT',
        parameters: { projectId, trigger: 'agent_pre_merge', guardSuite: 'all' },
        expectedOutcome: 'Safe fallback state saved to disk.',
        deadlineMs: 500,
      },
      status: 'acknowledged',
    },
  ];

  const created: SwarmProtocolMessage[] = [];
  for (const sample of sampleMessages) {
    created.push(sendProtocolMessage(sample));
  }

  return {
    newMessages: created,
  };
}

export function getProtocolSpecification() {
  return {
    protocol: 'SwarmForge Standard Inter-Agent Communication Protocol',
    version: '2.1-swarm',
    architecture: 'Actor-Model Event-Driven Message Envelope with Conflict Arbitration',
    messageTypes: [
      {
        type: 'REPORT_FINDINGS',
        purpose: 'Publish discovered diagnostics, vulnerabilities, smells, and audit items to collaborator agents.',
        requiredFields: ['findings', 'title', 'content'],
      },
      {
        type: 'REQUEST_ACTION',
        purpose: 'Directly request another specialized agent to execute a scoped mutation, interface exposure, or test.',
        requiredFields: ['actionRequest', 'recipientId', 'title'],
      },
      {
        type: 'SHARE_INTERMEDIATE_RESULT',
        purpose: 'Broadcast artifacts (AST graphs, symbol maps, test fixtures, schema defs) to eliminate duplicate compute.',
        requiredFields: ['intermediateResult', 'title'],
      },
      {
        type: 'CONFLICT_DETECTED',
        purpose: 'Halt contradictory parallel mutations targeting the same resource and escalate to the designated Arbiter.',
        requiredFields: ['conflict', 'priority: P0_CRITICAL'],
      },
      {
        type: 'CONFLICT_RESOLVED',
        purpose: 'Record and broadcast the binding arbitrator decision, rationale, and resulting unified patch.',
        requiredFields: ['resolution', 'correlationId'],
      },
    ],
    priorities: [
      { level: 'P0_CRITICAL', description: 'Security, Data Integrity, Fatal Build Blocks (Preempts all P1-P3)' },
      { level: 'P1_HIGH', description: 'Functional Bugs, Missing Contracts, Regression Tests' },
      { level: 'P2_NORMAL', description: 'Performance Optimizations, Refactorings, Documentation' },
      { level: 'P3_LOW', description: 'Cosmetic Tweaks, Stylistic Formatting, Info Metrics' },
    ],
    conflictResolutionStrategies: [
      {
        name: 'PRIORITY_OVERRIDE',
        rule: 'Invariants of higher priority (Security P0 / Integrity P0) unconditionally override lower priority optimizations (Performance P2 / Styling P3).',
      },
      {
        name: 'ARBITRATED_MERGE',
        rule: 'Designated Arbiter (Agent 1 Analyst or Agent 17 Integrity) performs AST tree reconciliation to integrate both proposals safely.',
      },
      {
        name: 'SAFETY_FIRST_ROLLBACK',
        rule: 'If conflicting changes produce non-deterministic behavior or test regressions, state is restored to the last known safe snapshot.',
      },
      {
        name: 'SEMANTIC_CONSENSUS',
        rule: 'Agents exchange parameterized proposal iterations until both contracts are satisfied without invariant violations.',
      },
    ],
  };
}
