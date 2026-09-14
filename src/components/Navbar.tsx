import React from 'react';
import { Bot, Cpu, Play, Plus, RefreshCw, ShieldCheck, Activity, Terminal } from 'lucide-react';
import { Project, SystemStatus } from '../types';

interface NavbarProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  systemStatus: SystemStatus | null;
  onNewProjectClick: () => void;
  onRunSwarmClick: () => void;
  isRunningSwarm: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  systemStatus,
  onNewProjectClick,
  onRunSwarmClick,
  isRunningSwarm,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-tight text-white text-lg">SWARMFORGE</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono">
                  20 AGENTS AUTONOMOUS
                </span>
              </div>
              <p className="text-xs text-slate-400">Multi-Agent Software Engineering Swarm</p>
            </div>
          </div>

          {/* Project Selector & System Stats */}
          <div className="flex items-center space-x-3">
            {projects.length > 0 && selectedProject && (
              <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-sm">
                <span className="text-xs text-slate-400 font-medium">PROJECT:</span>
                <select
                  id="project-selector-dropdown"
                  value={selectedProject.id}
                  onChange={(e) => {
                    const p = projects.find((item) => item.id === e.target.value);
                    if (p) onSelectProject(p);
                  }}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              id="btn-new-project"
              onClick={onNewProjectClick}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              title="Create new scaffold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>

            {/* Run Swarm Button */}
            <button
              id="btn-run-swarm-master"
              onClick={onRunSwarmClick}
              disabled={isRunningSwarm || !selectedProject}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition ${
                isRunningSwarm
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {isRunningSwarm ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Swarm Active (20/20)...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Autonomous Swarm</span>
                </>
              )}
            </button>

            {/* System Health Badge */}
            {systemStatus && (
              <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>ONLINE · {systemStatus.memoryUsageMb}MB</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 border-t border-slate-800/80 pt-1">
          {[
            { id: 'swarm', label: '20-Agent Swarm', icon: Bot },
            { id: 'code', label: 'Code & Architecture', icon: Terminal },
            { id: 'tests', label: 'Test Studio (Unit / E2E)', icon: Activity },
            { id: 'security', label: 'Security & Vulnerabilities', icon: ShieldCheck },
            { id: 'ai', label: 'Agent 19 (Gemini AI)', icon: Cpu },
            { id: 'deploy', label: 'Agent 20 (Final QA & Deploy)', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-nav-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
