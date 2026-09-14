import React, { useState, useEffect } from 'react';
import { Bot, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { Project, SystemStatus, AgentLogEntry, AgentResult, TestSuiteSummary, SecurityReport } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { AgentSwarmGrid } from './components/AgentSwarmGrid';
import { LiveSwarmRunner } from './components/LiveSwarmRunner';
import { CodeWorkspace } from './components/CodeWorkspace';
import { TestStudio } from './components/TestStudio';
import { SecurityCenter } from './components/SecurityCenter';
import { AIAssistant } from './components/AIAssistant';
import { ProductionGate } from './components/ProductionGate';
import { NewProjectModal } from './components/NewProjectModal';
import { SystemPerformanceMonitor } from './components/SystemPerformanceMonitor';
import { SwarmHealthIndicator } from './components/SwarmHealthIndicator';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [activeTab, setActiveTab] = useState<string>('swarm');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Swarm execution state
  const [isRunningSwarm, setIsRunningSwarm] = useState<boolean>(false);
  const [swarmLogs, setSwarmLogs] = useState<AgentLogEntry[]>([]);
  const [swarmResults, setSwarmResults] = useState<Record<string, AgentResult> | null>(null);
  const [lastExecutionTimeMs, setLastExecutionTimeMs] = useState<number | undefined>(undefined);

  // Testing & Security state
  const [testSummary, setTestSummary] = useState<TestSuiteSummary | null>(null);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [securityReport, setSecurityReport] = useState<SecurityReport | null>(null);
  const [isScanningSecurity, setIsScanningSecurity] = useState<boolean>(false);

  // Modal
  const [showNewModal, setShowNewModal] = useState<boolean>(false);

  // Load initial projects & system status
  const initialize = async () => {
    setIsLoading(true);
    setErrorNotice(null);
    try {
      const [projList, sys] = await Promise.all([
        api.getProjects(),
        api.getSystemStatus(),
      ]);
      setProjects(projList);
      if (projList.length > 0) {
        setSelectedProject(projList[0]);
      }
      setSystemStatus(sys);
    } catch (err: any) {
      console.error('Failed to initialize swarm engine:', err);
      setErrorNotice(err.message || 'Could not connect to backend server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  // Run Autonomous Swarm
  const handleRunSwarm = async () => {
    if (!selectedProject) return;
    setIsRunningSwarm(true);
    setSwarmLogs([
      {
        timestamp: new Date().toISOString(),
        agentId: 'AGENT_1_ANALYST',
        level: 'info',
        message: 'Master Orchestrator dispatched all 20 agents.',
      },
    ]);

    try {
      const res = await api.runSwarm(selectedProject.id);
      setSwarmResults(res.results);
      setSwarmLogs(res.logs);
      setLastExecutionTimeMs(res.executionTimeMs);
      setSelectedProject(res.project);
      // Update in projects array
      setProjects((prev) => prev.map((p) => (p.id === res.project.id ? res.project : p)));
    } catch (err: any) {
      console.error('Swarm execution failure:', err);
      setSwarmLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          agentId: 'AGENT_18_RECOVERY',
          level: 'error',
          message: `Swarm halted with error: ${err.message || 'Unknown exception'}`,
        },
      ]);
    } finally {
      setIsRunningSwarm(false);
    }
  };

  // Run Test Suite
  const handleRunTests = async () => {
    if (!selectedProject) return;
    setIsRunningTests(true);
    try {
      const data = await api.runTests(selectedProject.id);
      setTestSummary(data);
    } catch (err: any) {
      console.error('Test execution failure:', err);
    } finally {
      setIsRunningTests(false);
    }
  };

  // Run Security Scan
  const handleRunSecurityScan = async () => {
    if (!selectedProject) return;
    setIsScanningSecurity(true);
    try {
      const data = await api.runSecurityScan(selectedProject.id);
      setSecurityReport(data);
    } catch (err: any) {
      console.error('Security scan error:', err);
    } finally {
      setIsScanningSecurity(false);
    }
  };

  // Save File
  const handleSaveFile = async (file: { id?: string; name: string; path: string; content: string; language: string }) => {
    if (!selectedProject) return;
    const res = await api.saveFile(selectedProject.id, file);
    const updatedProj = { ...selectedProject, files: res.files };
    setSelectedProject(updatedProj);
    setProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
  };

  // Delete File
  const handleDeleteFile = async (fileId: string) => {
    if (!selectedProject) return;
    const res = await api.deleteFile(selectedProject.id, fileId);
    const updatedProj = { ...selectedProject, files: res.files };
    setSelectedProject(updatedProj);
    setProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
  };

  // Create Project
  const handleCreateProject = async (name: string, description: string) => {
    const newProj = await api.createProject(name, description);
    setProjects((prev) => [newProj, ...prev]);
    setSelectedProject(newProj);
    setActiveTab('swarm');
  };

  // Export Project
  const handleExport = () => {
    if (!selectedProject) return;
    window.location.href = api.getExportUrl(selectedProject.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 animate-pulse">
          <Bot className="w-6 h-6" />
        </div>
        <p className="text-sm font-mono text-slate-400">Initializing 20-Agent Autonomous Swarm Engine...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600/30">
      {/* Top Header & Navigation */}
      <Navbar
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={(p) => setSelectedProject(p)}
        systemStatus={systemStatus}
        onNewProjectClick={() => setShowNewModal(true)}
        onRunSwarmClick={handleRunSwarm}
        isRunningSwarm={isRunningSwarm}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {errorNotice && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{errorNotice}</span>
            </div>
            <button
              onClick={initialize}
              className="px-3 py-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-200 transition"
            >
              Retry
            </button>
          </div>
        )}

        {selectedProject ? (
          <div>
            {activeTab === 'swarm' && (
              <div className="space-y-6">
                <SwarmHealthIndicator
                  project={selectedProject}
                  results={swarmResults}
                  isRunningSwarm={isRunningSwarm}
                  onAddLog={(entry) => setSwarmLogs((prev) => [...prev, entry])}
                />
                <SystemPerformanceMonitor isSwarmRunning={isRunningSwarm} />
                <LiveSwarmRunner
                  project={selectedProject}
                  isRunning={isRunningSwarm}
                  onTriggerRun={handleRunSwarm}
                  logs={swarmLogs}
                  results={swarmResults}
                  executionTimeMs={lastExecutionTimeMs}
                />
                <AgentSwarmGrid
                  lastResults={swarmResults}
                  isRunningSwarm={isRunningSwarm}
                />
              </div>
            )}

            {activeTab === 'code' && (
              <CodeWorkspace
                project={selectedProject}
                onSaveFile={handleSaveFile}
                onDeleteFile={handleDeleteFile}
                onExport={handleExport}
              />
            )}

            {activeTab === 'tests' && (
              <TestStudio
                project={selectedProject}
                testSummary={testSummary}
                isRunningTests={isRunningTests}
                onRunTests={handleRunTests}
              />
            )}

            {activeTab === 'security' && (
              <SecurityCenter
                report={securityReport}
                isScanning={isScanningSecurity}
                onRunScan={handleRunSecurityScan}
              />
            )}

            {activeTab === 'ai' && <AIAssistant project={selectedProject} />}

            {activeTab === 'deploy' && (
              <ProductionGate project={selectedProject} onExport={handleExport} />
            )}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <Bot className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-slate-300">No Projects Configured</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Initialize a new autonomous application scaffold to start the 20-agent engineering loop.
            </p>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition shadow-sm"
            >
              Create Project Scaffold
            </button>
          </div>
        )}
      </main>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
}
