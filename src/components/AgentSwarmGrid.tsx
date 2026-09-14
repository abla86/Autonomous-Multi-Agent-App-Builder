import React, { useState } from 'react';
import { Bot, CheckCircle2, AlertTriangle, Clock, Wrench, Shield, Search, ChevronRight, X } from 'lucide-react';
import { AGENT_REGISTRY } from '../data/agents';
import { AgentDefinition, AgentResult } from '../types';

interface AgentSwarmGridProps {
  lastResults: Record<string, AgentResult> | null;
  isRunningSwarm: boolean;
  onRunAgent?: (agent: AgentDefinition) => void;
}

export const AgentSwarmGrid: React.FC<AgentSwarmGridProps> = ({
  lastResults,
  isRunningSwarm,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectingAgent, setInspectingAgent] = useState<AgentDefinition | null>(null);

  const filteredAgents = AGENT_REGISTRY.filter((agent) => {
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
    const matchesQuery =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.focusArea.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const getAgentStatus = (agentId: string) => {
    if (isRunningSwarm) return { label: 'Executing...', color: 'text-amber-400 bg-amber-400/10 border-amber-500/20' };
    if (!lastResults || !lastResults[agentId]) {
      return { label: 'Standing By', color: 'text-slate-400 bg-slate-800 border-slate-700' };
    }
    const res = lastResults[agentId];
    if (res.status === 'passed') return { label: 'Verified', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (res.status === 'warning') return { label: 'Notice', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Attention', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Swarm Philosophy */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center space-x-2">
              <span>Autonomous Multi-Agent Swarm Registry</span>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                20 SPECIALIZED ROLES
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Coordinated by the Master Orchestrator. Agents execute in parallel stages following strict non-simulated principles:
              <strong className="text-slate-300"> Read → Diagnose → Parallel Work → Integrate → Real Testing → Production Certification</strong>.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Categories:</span>
            {['all', 'core', 'quality', 'infrastructure', 'product'].map((cat) => (
              <button
                key={cat}
                id={`filter-cat-${cat}`}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium capitalize transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            id="agent-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by agent name, role, or focus area..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Agents Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredAgents.map((agent) => {
          const status = getAgentStatus(agent.id);
          const result = lastResults ? lastResults[agent.id] : null;

          return (
            <div
              key={agent.id}
              id={`agent-card-${agent.index}`}
              onClick={() => setInspectingAgent(agent)}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 transition duration-200 flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-indigo-500/5"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">
                    {agent.badge}
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <h3 className="font-semibold text-slate-100 text-sm group-hover:text-indigo-400 transition">
                  {agent.name}
                </h3>
                <p className="text-xs text-indigo-300/80 font-medium mt-0.5">{agent.role}</p>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {agent.focusArea}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{result ? `${result.durationMs}ms` : 'Ready'}</span>
                </div>

                <div className="flex items-center space-x-1 text-slate-400 group-hover:text-indigo-400 transition font-medium">
                  <span>Inspect</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Agent Drawer / Modal */}
      {inspectingAgent && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div
            id="agent-detail-modal"
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono font-bold text-sm">
                  {inspectingAgent.badge}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-white">{inspectingAgent.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono uppercase">
                      {inspectingAgent.category}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-400">{inspectingAgent.role}</p>
                </div>
              </div>

              <button
                id="btn-close-agent-modal"
                onClick={() => setInspectingAgent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Focus Area */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Domain Focus Area
              </span>
              <p className="text-sm text-slate-200">{inspectingAgent.focusArea}</p>
            </div>

            {/* Mandate Items */}
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                Operational Mandates
              </span>
              <ul className="space-y-1.5">
                {inspectingAgent.mandate.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                    <span className="text-indigo-400 font-mono">0{idx + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Last Execution Results if Available */}
            {lastResults && lastResults[inspectingAgent.id] && (
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Latest Autonomous Run Findings
                  </span>
                  <span className="text-xs text-emerald-400 font-medium">
                    Verified in {lastResults[inspectingAgent.id].durationMs}ms
                  </span>
                </div>

                <p className="text-xs text-slate-300 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                  {lastResults[inspectingAgent.id].summary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block mb-1">Audit Findings:</span>
                    <ul className="space-y-1">
                      {lastResults[inspectingAgent.id].findings.map((f, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block mb-1">Repairs / Protections Applied:</span>
                    <ul className="space-y-1">
                      {lastResults[inspectingAgent.id].repairsApplied.map((r, i) => (
                        <li key={i} className="text-xs text-indigo-300 flex items-center space-x-1.5">
                          <Wrench className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectingAgent(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
