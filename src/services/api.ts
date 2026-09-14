import { Project, SystemStatus, SwarmExecutionState, TestSuiteSummary, SecurityReport, DeploymentGateCheck, SystemPerformanceMetrics } from '../types';

export const api = {
  async getHealth(): Promise<any> {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  },

  async getPerformanceMetrics(): Promise<SystemPerformanceMetrics> {
    const res = await fetch('/api/system/performance');
    if (!res.ok) throw new Error(`Performance metrics failed: ${res.statusText}`);
    return res.json();
  },

  async resetPerformanceTelemetry(): Promise<any> {
    const res = await fetch('/api/system/performance/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset performance telemetry');
    return res.json();
  },

  async triggerGarbageCollection(): Promise<{ success: boolean; freedRssMb: number; freedHeapMb: number; currentRssMb: number; currentHeapMb: number }> {
    const res = await fetch('/api/system/gc', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to trigger memory cleanup');
    return res.json();
  },

  async getSystemStatus(): Promise<SystemStatus> {
    const res = await fetch('/api/system/status');
    if (!res.ok) throw new Error(`System status failed: ${res.statusText}`);
    return res.json();
  },

  async getProjects(): Promise<Project[]> {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error(`Failed to fetch projects: ${res.statusText}`);
    const data = await res.json();
    return data.projects || [];
  },

  async getProject(id: string): Promise<Project> {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch project: ${res.statusText}`);
    const data = await res.json();
    return data.project;
  },

  async createProject(name: string, description: string): Promise<Project> {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create project');
    }
    const data = await res.json();
    return data.project;
  },

  async updateProject(id: string, payload: Partial<Project>): Promise<Project> {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update project');
    const data = await res.json();
    return data.project;
  },

  async deleteProject(id: string): Promise<void> {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete project');
  },

  async saveFile(projectId: string, file: { id?: string; name: string; path: string; content: string; language: string }): Promise<any> {
    const res = await fetch(`/api/projects/${projectId}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(file),
    });
    if (!res.ok) throw new Error('Failed to save file');
    return res.json();
  },

  async deleteFile(projectId: string, fileId: string): Promise<any> {
    const res = await fetch(`/api/projects/${projectId}/files/${fileId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete file');
    return res.json();
  },

  async runSwarm(projectId: string): Promise<{ executionTimeMs: number; results: Record<string, any>; logs: any[]; project: Project }> {
    const res = await fetch(`/api/projects/${projectId}/swarm/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Swarm run failed');
    }
    return res.json();
  },

  async logSwarmReport(projectId: string, payload: { report: string; healthScore: number; categoryScores?: any; summary?: any }): Promise<any> {
    const res = await fetch(`/api/projects/${projectId}/swarm/report-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to log swarm health report');
    return res.json();
  },

  async runTests(projectId: string): Promise<TestSuiteSummary> {
    const res = await fetch(`/api/projects/${projectId}/tests/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to execute test suite');
    return res.json();
  },

  async runSecurityScan(projectId: string): Promise<SecurityReport> {
    const res = await fetch(`/api/projects/${projectId}/security-scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to run security scanner');
    const data = await res.json();
    return data.report;
  },

  async consultAI(projectId: string, prompt: string, contextFileId?: string): Promise<any> {
    const res = await fetch(`/api/projects/${projectId}/ai/consult`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, contextFileId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'AI consultation failed');
    }
    return res.json();
  },

  async getDeployChecks(projectId: string): Promise<{ readyForDeploy: boolean; score: number; checks: DeploymentGateCheck[] }> {
    const res = await fetch(`/api/projects/${projectId}/deploy-check`);
    if (!res.ok) throw new Error('Failed to retrieve deployment checks');
    return res.json();
  },

  getExportUrl(projectId: string): string {
    return `/api/projects/${projectId}/export`;
  },
};
