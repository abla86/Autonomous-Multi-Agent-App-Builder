import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileCode,
  Play,
  RefreshCw,
  Sliders,
  History,
  Info,
  ChevronRight,
  GitCommit,
  Terminal,
  Bug,
} from 'lucide-react';
import { Project, ProjectSnapshot, RollbackConfig, RollbackLog, AgentId } from '../types';
import { api } from '../services/api';

interface RollbackCenterProps {
  project: Project;
  onProjectUpdated: (project: Project) => void;
}

export const RollbackCenter: React.FC<RollbackCenterProps> = ({ project, onProjectUpdated }) => {
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>([]);
  const [rollbackLogs, setRollbackLogs] = useState<RollbackLog[]>([]);
  const [config, setConfig] = useState<RollbackConfig>({
    autoRollbackEnabled: true,
    rollbackOnUnitFailure: true,
    rollbackOnIntegrationFailure: true,
    rollbackOnE2EFailure: true,
    notifyOnRollback: true,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);

  // Manual checkpoint state
  const [manualLabel, setManualLabel] = useState<string>('');
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState<boolean>(false);

  // Simulation controls
  const [selectedAgent, setSelectedAgent] = useState<AgentId>('AGENT_2_FRONTEND');
  const [simulationMode, setSimulationMode] = useState<'clean' | 'unit_fail' | 'int_fail' | 'e2e_fail'>('unit_fail');

  // Load data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [snaps, logs, cfg] = await Promise.all([
        api.getSnapshots(project.id),
        api.getRollbackLogs(project.id),
        api.getRollbackConfig(),
      ]);
      setSnapshots(snaps);
      setRollbackLogs(logs);
      setConfig(cfg);
    } catch (err) {
      console.error('Failed to load rollback data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [project.id]);

  // Toggle configuration
  const handleToggleConfig = async (key: keyof RollbackConfig) => {
    const updated = { ...config, [key]: !config[key] };
    setConfig(updated);
    try {
      await api.updateRollbackConfig(updated);
    } catch (err) {
      console.error('Failed to update rollback config:', err);
    }
  };

  // Create manual checkpoint
  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLabel.trim()) return;
    setIsCreatingSnapshot(true);
    try {
      const newSnap = await api.createSnapshot(project.id, manualLabel.trim(), 'USER_MANUAL');
      setSnapshots((prev) => [newSnap, ...prev]);
      setManualLabel('');
    } catch (err) {
      console.error('Failed to create snapshot:', err);
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  // Revert to snapshot
  const handleRevert = async (snapshotId: string, snapshotLabel: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to revert the project to snapshot:\n"${snapshotLabel}"?\n\nThis will restore all files to the exact state at that checkpoint.`
    );
    if (!confirmed) return;

    try {
      const res = await api.revertToSnapshot(project.id, snapshotId, `User restored to "${snapshotLabel}"`);
      onProjectUpdated(res.project);
      setRollbackLogs((prev) => [res.log, ...prev]);
      alert(`Project successfully reverted to snapshot "${snapshotLabel}".`);
    } catch (err: any) {
      alert(`Revert failed: ${err.message}`);
    }
  };

  // Run Simulation
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimulationResult(null);

    const isFailure = simulationMode !== 'clean';
    let failureType: 'unit' | 'integration' | 'e2e' = 'unit';
    if (simulationMode === 'int_fail') failureType = 'integration';
    if (simulationMode === 'e2e_fail') failureType = 'e2e';

    try {
      const res = await api.simulateMergeWithRollbackGuard(project.id, {
        agentId: selectedAgent,
        simulateFailure: isFailure,
        failureType,
      });

      setSimulationResult(res.outcome);
      if (res.project) {
        onProjectUpdated(res.project);
      }
      // Reload snapshots and logs
      const [snaps, logs] = await Promise.all([
        api.getSnapshots(project.id),
        api.getRollbackLogs(project.id),
      ]);
      setSnapshots(snaps);
      setRollbackLogs(logs);
    } catch (err: any) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / System Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">Automated Rollback Strategy Engine</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${
                      config.autoRollbackEnabled
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {config.autoRollbackEnabled ? 'ACTIVE & GUARDED' : 'DISABLED'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Continuous automated rollback barrier. Merged agent changes are guarded by Unit, Integration, and E2E assertions.
                  If any critical test fails post-merge, the system instantly reverts changes and writes an audit log.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center space-x-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Snapshots</span>
            <span className="text-2xl font-bold text-white font-mono">{snapshots.length}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Stored file checkpoints</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Rollback Actions</span>
            <span className="text-2xl font-bold text-amber-400 font-mono">{rollbackLogs.length}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Automated reverts logged</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Protected Test Suites</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              {[config.rollbackOnUnitFailure, config.rollbackOnIntegrationFailure, config.rollbackOnE2EFailure].filter(Boolean).length}/3
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Unit, Integration, E2E</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Active Files</span>
            <span className="text-2xl font-bold text-indigo-400 font-mono">{project.files.length}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">{project.stats.linesOfCode} lines protected</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Policy Configuration & Interactive Simulation Lab */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Policy Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Policy Toggles */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Automated Rollback Policies</h3>
            </div>

            <div className="space-y-3">
              {/* Master Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-white block">Auto-Rollback Master Engine</span>
                  <span className="text-[11px] text-slate-400 block">Revert agent merge immediately upon critical test failure</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleConfig('autoRollbackEnabled')}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 cursor-pointer ${
                    config.autoRollbackEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md transform" />
                </button>
              </div>

              {/* Unit Tests Trigger */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-slate-200">Revert on Unit Test Failure</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      UNIT
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">Unique paths, schema invariants, file boundaries</span>
                </div>
                <button
                  type="button"
                  disabled={!config.autoRollbackEnabled}
                  onClick={() => handleToggleConfig('rollbackOnUnitFailure')}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 ${
                    !config.autoRollbackEnabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                  } ${config.rollbackOnUnitFailure ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'}`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md transform" />
                </button>
              </div>

              {/* Integration Tests Trigger */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-slate-200">Revert on Integration Test Failure</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      INTEGRATION
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">Entrypoint presence, git conflict cleanliness, storage sync</span>
                </div>
                <button
                  type="button"
                  disabled={!config.autoRollbackEnabled}
                  onClick={() => handleToggleConfig('rollbackOnIntegrationFailure')}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 ${
                    !config.autoRollbackEnabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                  } ${config.rollbackOnIntegrationFailure ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'}`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md transform" />
                </button>
              </div>

              {/* E2E Tests Trigger */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-slate-200">Revert on E2E Test Failure</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      E2E
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">Virtual build & execution journey, non-empty stubs</span>
                </div>
                <button
                  type="button"
                  disabled={!config.autoRollbackEnabled}
                  onClick={() => handleToggleConfig('rollbackOnE2EFailure')}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 ${
                    !config.autoRollbackEnabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                  } ${config.rollbackOnE2EFailure ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'}`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md transform" />
                </button>
              </div>

              {/* Audit Notification */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="space-y-0.5">
                  <span className="text-xs font-medium text-slate-200">Emit Rollback Audit Log & Reason</span>
                  <span className="text-[11px] text-slate-500 block">Records timestamp, failure assertion, and reverted files</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleConfig('notifyOnRollback')}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 cursor-pointer ${
                    config.notifyOnRollback ? 'bg-indigo-600 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Create Manual Checkpoint */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <GitCommit className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Create Manual Snapshot Checkpoint</h3>
            </div>
            <p className="text-xs text-slate-400">
              Take an immediate full repository snapshot of all {project.files.length} files. Can be restored anytime with a single click.
            </p>
            <form onSubmit={handleCreateSnapshot} className="space-y-2">
              <input
                type="text"
                value={manualLabel}
                onChange={(e) => setManualLabel(e.target.value)}
                placeholder="e.g. Before refactoring orchestrator"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isCreatingSnapshot || !manualLabel.trim()}
                className="w-full px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold transition flex items-center justify-center space-x-2"
              >
                {isCreatingSnapshot ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Checkpoint...</span>
                  </>
                ) : (
                  <>
                    <GitCommit className="w-3.5 h-3.5" />
                    <span>Take Manual Snapshot</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Interactive Simulation Sandbox (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Bug className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Interactive Rollback Verification Sandbox</h3>
                  <p className="text-[11px] text-slate-400">
                    Test the automated rollback strategy by simulating an agent merging code that fails critical tests.
                  </p>
                </div>
              </div>
            </div>

            {/* Sandbox Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Simulate Agent Merging Changes</label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value as AgentId)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="AGENT_2_FRONTEND">Agent 2: Frontend Architect</option>
                  <option value="AGENT_3_BACKEND">Agent 3: Backend Engineer</option>
                  <option value="AGENT_4_DATABASE">Agent 4: Database Specialist</option>
                  <option value="AGENT_7_SECURITY">Agent 7: Security Officer</option>
                  <option value="AGENT_8_PERFORMANCE">Agent 8: Performance Engineer</option>
                  <option value="AGENT_11_TEST">Agent 11: Test Automation</option>
                  <option value="AGENT_14_DEPENDENCY">Agent 14: Dependency Sentinel</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Simulation Test Scenario</label>
                <select
                  value={simulationMode}
                  onChange={(e) => setSimulationMode(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="unit_fail">Inject Critical Unit Failure (Duplicate Path Invariant)</option>
                  <option value="int_fail">Inject Integration Failure (Git Conflict Corrupted Syntax)</option>
                  <option value="e2e_fail">Inject E2E Failure (Empty Stub Abort)</option>
                  <option value="clean">Clean Merge (All Tests Pass - No Rollback)</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-400 space-y-2">
              <div className="flex items-center space-x-2 text-indigo-400 font-mono text-[11px]">
                <Info className="w-3.5 h-3.5" />
                <span>Automated Lifecycle Sequence:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1 font-mono text-[11px]">
                <li>Create pre-merge snapshot before agent commits code.</li>
                <li>Apply agent's proposed files into virtual candidate repository.</li>
                <li>Execute critical Unit, Integration, and E2E test suites in parallel.</li>
                <li>
                  <strong className="text-amber-400">If tests fail:</strong> Automated engine immediately reverts files back to pre-merge snapshot & logs failure reason.
                </li>
                <li>
                  <strong className="text-emerald-400">If tests pass:</strong> Commit clean state and save post-merge verified snapshot.
                </li>
              </ol>
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition shadow-md ${
                simulationMode === 'clean'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
              }`}
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Agent Merge & Evaluating Rollback Guard...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>
                    {simulationMode === 'clean'
                      ? 'Simulate Clean Agent Merge (Verify Tests Pass)'
                      : 'Simulate Agent Merge with Bug & Trigger Automated Rollback'}
                  </span>
                </>
              )}
            </button>

            {/* Simulation Result Output */}
            {simulationResult && (
              <div
                className={`mt-4 p-4 rounded-xl border text-xs space-y-3 animate-fadeIn ${
                  simulationResult.rolledBack
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <div className="flex items-center space-x-2">
                    {simulationResult.rolledBack ? (
                      <RotateCcw className="w-4 h-4 text-amber-400 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>{simulationResult.message}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                      simulationResult.rolledBack
                        ? 'bg-amber-400/20 text-amber-300'
                        : 'bg-emerald-400/20 text-emerald-300'
                    }`}
                  >
                    {simulationResult.rolledBack ? 'ROLLBACK EXECUTED' : 'MERGE SUCCESSFUL'}
                  </span>
                </div>

                {simulationResult.rollbackLog && (
                  <div className="bg-slate-950/80 rounded-lg p-3 border border-amber-500/20 space-y-2 font-mono text-[11px]">
                    <div className="text-slate-400">
                      <strong>Rollback Reason:</strong> {simulationResult.rollbackLog.reason}
                    </div>
                    <div>
                      <strong className="text-rose-400">Failed Critical Assertions:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-300">
                        {simulationResult.rollbackLog.failedTests.map((t: any) => (
                          <li key={t.id}>
                            <span className="text-amber-400">[{t.suite.toUpperCase()}]</span> {t.name} — <code className="text-slate-400">{t.assertion}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Cleanly reverted {simulationResult.rollbackLog.revertedFiles.length} files back to pre-merge snapshot {simulationResult.preSnapshot?.id}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rollback Audit Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Rollback Action & Audit Logs</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{rollbackLogs.length} events logged</span>
        </div>

        {rollbackLogs.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No rollback actions recorded yet. Use the simulation lab above to test automated reversions!
          </div>
        ) : (
          <div className="space-y-3">
            {rollbackLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-2 hover:border-slate-700 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        log.automated
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                      }`}
                    >
                      {log.automated ? 'AUTOMATED ROLLBACK' : 'MANUAL REVERT'}
                    </span>
                    <span className="text-slate-300 font-mono text-[11px]">
                      Trigger: <strong className="text-white">{log.triggerAgentId}</strong>
                    </span>
                    <span className="text-slate-500">→</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      Restored Snapshot: <code className="text-indigo-300">{log.targetSnapshotId}</code>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-500 text-[11px] font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-slate-400 font-semibold">Reason:</span> {log.reason}
                </div>

                {log.failedTests && log.failedTests.length > 0 && (
                  <div className="text-[11px] text-rose-300/90 font-mono bg-rose-950/20 border border-rose-900/30 p-2 rounded-lg">
                    <span className="font-semibold text-rose-400 block mb-1">Triggering Critical Test Failures:</span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {log.failedTests.map((t, idx) => (
                        <li key={idx}>
                          [{t.suite}] {t.name} — <code className="text-slate-300">{t.assertion}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                  <span>Reverted {log.revertedFiles.length} file(s) safely</span>
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Status: {log.status}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Snapshot History Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <GitCommit className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Project Snapshot Timeline & Checkpoints</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{snapshots.length} total checkpoints</span>
        </div>

        {snapshots.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No snapshots recorded. Use the "Take Manual Snapshot" button above or run a swarm to record checkpoints.
          </div>
        ) : (
          <div className="space-y-3">
            {snapshots.map((snap) => (
              <div
                key={snap.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        snap.trigger === 'agent_pre_merge'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : snap.trigger === 'agent_post_merge'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                      }`}
                    >
                      {snap.trigger.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-white">{snap.label}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-[11px] text-slate-400 font-mono">
                    <span>ID: {snap.id}</span>
                    <span>•</span>
                    <span>Files: {snap.filesCount}</span>
                    <span>•</span>
                    <span>LOC: {snap.linesOfCode}</span>
                    {snap.agentId && (
                      <>
                        <span>•</span>
                        <span>Agent: {snap.agentId}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(snap.timestamp).toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => handleRevert(snap.id, snap.label)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 text-xs font-medium border border-slate-700 transition flex items-center space-x-1.5"
                    title="Restore repository to this snapshot"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Revert to this Checkpoint</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
