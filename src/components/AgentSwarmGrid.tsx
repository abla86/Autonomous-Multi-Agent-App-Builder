import React, { useState } from 'react';
import {
  Bot,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wrench,
  Shield,
  Search,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  X,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ListOrdered,
  LayoutGrid,
  Zap,
  Sparkles,
  Sliders,
  RotateCcw,
  Check,
  Flame
} from 'lucide-react';
import { AGENT_REGISTRY } from '../data/agents';
import { AgentDefinition, AgentResult, AgentTask, AgentTaskPriority } from '../types';

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
  const [inspectorTab, setInspectorTab] = useState<'tasks' | 'overview' | 'results'>('tasks');
  const [viewMode, setViewMode] = useState<'grid' | 'queue'>('grid');
  const [priorityFilter, setPriorityFilter] = useState<'all' | AgentTaskPriority>('all');
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Initialize task queues for each agent based on their mandates
  const [agentTaskQueues, setAgentTaskQueues] = useState<Record<string, AgentTask[]>>(() => {
    const queues: Record<string, AgentTask[]> = {};
    AGENT_REGISTRY.forEach((agent) => {
      queues[agent.id] = agent.mandate.map((taskText, idx) => ({
        id: `${agent.id}-task-${idx}`,
        agentId: agent.id,
        title: taskText,
        priority: idx === 0 ? 'p1' : idx === 1 ? 'p1' : idx === 2 ? 'p2' : 'p3',
        status: 'pending',
        order: idx,
      }));
    });
    return queues;
  });

  const showToast = (message: string) => {
    setToastNotice(message);
    setTimeout(() => {
      setToastNotice(null);
    }, 3200);
  };

  // Reorder task: Move Up
  const moveTaskUp = (agentId: string, index: number) => {
    if (index <= 0) return;
    setAgentTaskQueues((prev) => {
      const currentList = [...(prev[agentId] || [])];
      const target = currentList[index];
      const previous = currentList[index - 1];
      currentList[index - 1] = { ...target, order: index - 1 };
      currentList[index] = { ...previous, order: index };

      const agent = AGENT_REGISTRY.find((a) => a.id === agentId);
      showToast(`Shifted "${target.title.slice(0, 32)}..." up to queue position #${index} for ${agent?.name || agentId}.`);

      return {
        ...prev,
        [agentId]: currentList,
      };
    });
  };

  // Reorder task: Move Down
  const moveTaskDown = (agentId: string, index: number) => {
    setAgentTaskQueues((prev) => {
      const currentList = [...(prev[agentId] || [])];
      if (index >= currentList.length - 1) return prev;
      const target = currentList[index];
      const next = currentList[index + 1];
      currentList[index + 1] = { ...target, order: index + 1 };
      currentList[index] = { ...next, order: index };

      const agent = AGENT_REGISTRY.find((a) => a.id === agentId);
      showToast(`Shifted "${target.title.slice(0, 32)}..." down to queue position #${index + 2} for ${agent?.name || agentId}.`);

      return {
        ...prev,
        [agentId]: currentList,
      };
    });
  };

  // Promote task directly to Top (#1 next)
  const promoteTaskToTop = (agentId: string, index: number) => {
    if (index === 0) return;
    setAgentTaskQueues((prev) => {
      const currentList = [...(prev[agentId] || [])];
      const [item] = currentList.splice(index, 1);
      currentList.unshift({ ...item, priority: 'p0', order: 0 });
      const updated = currentList.map((t, idx) => ({ ...t, order: idx }));

      const agent = AGENT_REGISTRY.find((a) => a.id === agentId);
      showToast(`🚀 Promoted "${item.title.slice(0, 32)}..." to TOP PRIORITY (#1 next in line) for ${agent?.name || agentId}!`);

      return {
        ...prev,
        [agentId]: updated,
      };
    });
  };

  // Change Task Priority
  const changeTaskPriority = (agentId: string, taskId: string, priority: AgentTaskPriority) => {
    setAgentTaskQueues((prev) => {
      const currentList = [...(prev[agentId] || [])];
      const updated = currentList.map((t) => (t.id === taskId ? { ...t, priority } : t));
      const target = updated.find((t) => t.id === taskId);
      const agent = AGENT_REGISTRY.find((a) => a.id === agentId);

      const priorityLabel = {
        p0: 'P0 Critical',
        p1: 'P1 High',
        p2: 'P2 Normal',
        p3: 'P3 Low',
      }[priority];

      showToast(`Priority adjusted: "${target?.title.slice(0, 28)}..." is now ${priorityLabel} for ${agent?.name || agentId}.`);

      return {
        ...prev,
        [agentId]: updated,
      };
    });
  };

  // Sort an agent's tasks by Priority (p0 -> p1 -> p2 -> p3)
  const sortAgentTasksByPriority = (agentId: string) => {
    const priorityWeight: Record<AgentTaskPriority, number> = { p0: 0, p1: 1, p2: 2, p3: 3 };
    setAgentTaskQueues((prev) => {
      const currentList = [...(prev[agentId] || [])];
      currentList.sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);
      const updated = currentList.map((t, idx) => ({ ...t, order: idx }));

      const agent = AGENT_REGISTRY.find((a) => a.id === agentId);
      showToast(`Tasks for ${agent?.name || agentId} sorted by priority (Critical → Low).`);

      return {
        ...prev,
        [agentId]: updated,
      };
    });
  };

  // Reset an agent's tasks to initial order
  const resetAgentTasks = (agentId: string) => {
    const agent = AGENT_REGISTRY.find((a) => a.id === agentId);
    if (!agent) return;
    setAgentTaskQueues((prev) => ({
      ...prev,
      [agentId]: agent.mandate.map((taskText, idx) => ({
        id: `${agent.id}-task-${idx}`,
        agentId: agent.id,
        title: taskText,
        priority: idx === 0 ? 'p1' : idx === 1 ? 'p1' : idx === 2 ? 'p2' : 'p3',
        status: 'pending',
        order: idx,
      })),
    }));
    showToast(`Reset task sequence for ${agent.name} to default order.`);
  };

  // Sort ALL agents tasks by priority
  const sortAllAgentsByPriority = () => {
    const priorityWeight: Record<AgentTaskPriority, number> = { p0: 0, p1: 1, p2: 2, p3: 3 };
    setAgentTaskQueues((prev) => {
      const nextQueues: Record<string, AgentTask[]> = {};
      Object.keys(prev).forEach((agentId) => {
        const sorted = [...prev[agentId]].sort(
          (a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]
        );
        nextQueues[agentId] = sorted.map((t, idx) => ({ ...t, order: idx }));
      });
      return nextQueues;
    });
    showToast(`⚡ All 20 agents' task queues automatically re-ordered by priority.`);
  };

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

  const getPriorityBadge = (priority: AgentTaskPriority) => {
    switch (priority) {
      case 'p0':
        return {
          label: 'P0 Critical',
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          dot: 'bg-rose-400',
        };
      case 'p1':
        return {
          label: 'P1 High',
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400',
        };
      case 'p2':
        return {
          label: 'P2 Normal',
          bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          dot: 'bg-indigo-400',
        };
      case 'p3':
        return {
          label: 'P3 Low',
          bg: 'bg-slate-800 text-slate-400 border-slate-700',
          dot: 'bg-slate-500',
        };
    }
  };

  // Count total tasks by priority across all agents
  const totalCounts = Object.values(agentTaskQueues).reduce<{
    p0: number;
    p1: number;
    p2: number;
    p3: number;
    total: number;
  }>(
    (acc, tasks: AgentTask[]) => {
      tasks.forEach((t) => {
        acc[t.priority] = (acc[t.priority] || 0) + 1;
        acc.total += 1;
      });
      return acc;
    },
    { p0: 0, p1: 0, p2: 0, p3: 0, total: 0 }
  );

  return (
    <div id="agent-swarm-grid-section" className="space-y-6">
      {/* Toast Notification for dynamic priority adjustments */}
      {toastNotice && (
        <div className="p-3 rounded-xl bg-indigo-950/90 border border-indigo-500/40 text-indigo-200 text-xs flex items-center justify-between shadow-lg shadow-indigo-500/10 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span className="font-mono">{toastNotice}</span>
          </div>
          <button
            onClick={() => setToastNotice(null)}
            className="text-slate-400 hover:text-white text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Live Swarm Run Banner indicating dynamic task prioritization is active */}
      {isRunningSwarm && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm animate-pulse">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="font-semibold">
              Live Swarm Execution In Progress: Real-time Task Re-ordering & Priority Shifting is ACTIVE!
            </span>
          </div>
          <span className="text-[11px] font-mono bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 text-amber-200">
            Reorder tasks below to alter immediate agent execution order
          </span>
        </div>
      )}

      {/* Top Banner with Swarm Philosophy & View Mode Toggles */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-base font-semibold text-white">Autonomous Multi-Agent Swarm Registry</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                20 SPECIALIZED ROLES
              </span>
              {isRunningSwarm && (
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono animate-pulse">
                  PARALLEL WORKERS ACTIVE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Coordinated by the Master Orchestrator. Inspect agents, re-order pending operational tasks, or adjust priority rankings dynamically during execution.
            </p>
          </div>

          {/* View Mode Toggle: Bento Grid vs Live Priority Queue */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
              <button
                id="btn-view-grid"
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Bento Grid</span>
              </button>
              <button
                id="btn-view-queue"
                onClick={() => setViewMode('queue')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  viewMode === 'queue'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Task Priority Queue ({totalCounts.total})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Priority Counts Strip & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="text-xs text-slate-400 font-mono">Priority Pool:</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">
              P0: {totalCounts.p0}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
              P1: {totalCounts.p1}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              P2: {totalCounts.p2}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              P3: {totalCounts.p3}
            </span>

            <button
              id="btn-sort-all-priorities"
              onClick={sortAllAgentsByPriority}
              className="ml-2 flex items-center space-x-1 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition"
              title="Re-order tasks across all 20 agents by priority (P0 Critical first)"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>Auto-Sort All by Priority</span>
            </button>
          </div>

          {/* Category Filters */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-400">Category:</span>
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
        <div className="relative">
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

      {/* VIEW 1: BENTO GRID */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredAgents.map((agent) => {
            const status = getAgentStatus(agent.id);
            const result = lastResults ? lastResults[agent.id] : null;
            const tasks = agentTaskQueues[agent.id] || [];
            const nextTask = tasks[0];
            const nextPriorityBadge = nextTask ? getPriorityBadge(nextTask.priority) : null;

            return (
              <div
                key={agent.id}
                id={`agent-card-${agent.index}`}
                className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 transition duration-200 flex flex-col justify-between shadow-sm hover:shadow-indigo-500/5 relative group"
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

                  {/* Next Up Task in Queue with Priority Badge */}
                  {nextTask && (
                    <div className="mt-3 p-2 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                          <Zap className="w-2.5 h-2.5 text-amber-400" />
                          <span>Next in Queue (#1)</span>
                        </span>
                        {nextPriorityBadge && (
                          <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${nextPriorityBadge.bg}`}>
                            {nextPriorityBadge.label}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-1">
                        {nextTask.title}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Action Controls: Re-order / Inspect */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  {/* Quick Reorder Trigger */}
                  <button
                    id={`btn-agent-tasks-${agent.index}`}
                    onClick={() => {
                      setInspectingAgent(agent);
                      setInspectorTab('tasks');
                    }}
                    className="flex items-center space-x-1.5 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 hover:text-white text-indigo-300 font-mono transition text-[11px] border border-slate-700/80"
                    title="Re-order and re-prioritize tasks for this agent"
                  >
                    <ListOrdered className="w-3 h-3 text-indigo-400" />
                    <span>Prioritize ({tasks.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      setInspectingAgent(agent);
                      setInspectorTab('overview');
                    }}
                    className="flex items-center space-x-1 text-slate-400 hover:text-indigo-400 transition font-medium"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: TASK PRIORITY QUEUE MATRIX */}
      {viewMode === 'queue' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <ListOrdered className="w-4 h-4 text-indigo-400" />
                <span>Live Swarm Task Priority & Dispatch Queue</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust the execution sequence of pending tasks across all 20 agents. During a live swarm run, tasks at the top are dispatched immediately.
              </p>
            </div>

            {/* Filter by Priority */}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-slate-400">Show:</span>
              {(['all', 'p0', 'p1', 'p2', 'p3'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`text-xs px-2 py-0.5 rounded font-mono transition ${
                    priorityFilter === p
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Agents Task Queue List */}
          <div className="space-y-4">
            {filteredAgents.map((agent) => {
              const tasks = agentTaskQueues[agent.id] || [];
              const filteredTasks = tasks.filter(
                (t) => priorityFilter === 'all' || t.priority === priorityFilter
              );

              if (filteredTasks.length === 0 && priorityFilter !== 'all') return null;

              return (
                <div
                  key={agent.id}
                  id={`agent-queue-block-${agent.index}`}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">
                        {agent.badge}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold text-white">{agent.name}</h4>
                          <span className="text-[10px] text-indigo-400 font-mono">({agent.role})</span>
                        </div>
                        <span className="text-[11px] text-slate-500">{agent.focusArea}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => sortAgentTasksByPriority(agent.id)}
                        className="text-[11px] font-mono px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
                      >
                        Sort by Priority
                      </button>
                      <button
                        onClick={() => resetAgentTasks(agent.id)}
                        className="text-[11px] font-mono px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 transition"
                      >
                        Reset Order
                      </button>
                    </div>
                  </div>

                  {/* Task List for this agent */}
                  <div className="space-y-2">
                    {tasks.map((task, idx) => {
                      const priorityBadge = getPriorityBadge(task.priority);
                      const isTop = idx === 0;

                      return (
                        <div
                          key={task.id}
                          className={`p-2.5 rounded-lg border transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                            isTop
                              ? 'bg-indigo-950/20 border-indigo-500/30'
                              : 'bg-slate-900/80 border-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span
                              className={`font-mono text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isTop
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {idx + 1}
                            </span>

                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-slate-200 font-medium">
                                  {task.title}
                                </span>
                                {isTop && (
                                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                                    {isRunningSwarm ? 'Executing Now' : 'Next in Line'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Reordering and Priority Controls */}
                          <div className="flex items-center space-x-2 self-end sm:self-auto">
                            {/* Priority Selector Pills */}
                            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-md p-0.5 space-x-0.5">
                              {(['p0', 'p1', 'p2', 'p3'] as const).map((p) => {
                                const isSelected = task.priority === p;
                                const pData = getPriorityBadge(p);
                                return (
                                  <button
                                    key={p}
                                    onClick={() => changeTaskPriority(agent.id, task.id, p)}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                                      isSelected
                                        ? pData.bg
                                        : 'text-slate-500 hover:text-slate-300'
                                    }`}
                                    title={`Set priority to ${pData.label}`}
                                  >
                                    {p.toUpperCase()}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Move Up / Down Buttons */}
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => moveTaskUp(agent.id, idx)}
                                disabled={idx === 0}
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                title="Move task up in queue"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => moveTaskDown(agent.id, idx)}
                                disabled={idx === tasks.length - 1}
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                title="Move task down in queue"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => promoteTaskToTop(agent.id, idx)}
                                disabled={idx === 0}
                                className="px-1.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-[10px] font-mono disabled:opacity-30 disabled:cursor-not-allowed transition"
                                title="Promote directly to #1 top priority"
                              >
                                Top
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* INSPECT AGENT DRAWER / MODAL WITH TASK RE-ORDERING & RE-PRIORITIZING */}
      {inspectingAgent && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-in fade-in">
          <div
            id="agent-detail-modal"
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
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
                    {isRunningSwarm && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono animate-pulse">
                        LIVE ACTIVE
                      </span>
                    )}
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

            {/* Inspector Tabs */}
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setInspectorTab('tasks')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium font-mono transition ${
                  inspectorTab === 'tasks'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Task Priority Queue ({agentTaskQueues[inspectingAgent.id]?.length || 0})</span>
              </button>
              <button
                onClick={() => setInspectorTab('overview')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium font-mono transition ${
                  inspectorTab === 'overview'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Domain & Mandates</span>
              </button>
              {lastResults && lastResults[inspectingAgent.id] && (
                <button
                  onClick={() => setInspectorTab('results')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium font-mono transition ${
                    inspectorTab === 'results'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Telemetry Audit</span>
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* TAB 1: TASK QUEUE RE-ORDERING & RE-PRIORITIZING */}
              {inspectorTab === 'tasks' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">
                        Manual Execution Order & Priority
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {isRunningSwarm
                          ? 'Swarm is running. Moving a task to #1 adjusts the immediate worker payload.'
                          : 'Re-order tasks with Up/Down buttons or set priority pills (P0-P3).'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => sortAgentTasksByPriority(inspectingAgent.id)}
                        className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 transition flex items-center space-x-1"
                      >
                        <ArrowUpDown className="w-3 h-3" />
                        <span>Sort Priority</span>
                      </button>
                      <button
                        onClick={() => resetAgentTasks(inspectingAgent.id)}
                        className="text-[11px] font-mono px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 transition"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Task Items List */}
                  <div className="space-y-2">
                    {(agentTaskQueues[inspectingAgent.id] || []).map((task, idx) => {
                      const priorityBadge = getPriorityBadge(task.priority);
                      const isTop = idx === 0;

                      return (
                        <div
                          key={task.id}
                          className={`p-3 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isTop
                              ? 'bg-indigo-950/30 border-indigo-500/40 shadow-sm'
                              : 'bg-slate-950 border-slate-800'
                          }`}
                        >
                          <div className="flex items-start sm:items-center space-x-3">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 mt-0.5 sm:mt-0 ${
                                isTop
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {idx + 1}
                            </span>

                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-white font-medium">
                                  {task.title}
                                </span>
                                {isTop && (
                                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                                    {isRunningSwarm ? 'Executing' : 'Next'}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 font-mono">
                                Queue Index: #{idx + 1} · Priority: {priorityBadge.label}
                              </span>
                            </div>
                          </div>

                          {/* Reordering and Priority Controls */}
                          <div className="flex items-center space-x-2 self-end sm:self-auto">
                            {/* Priority Selection Pills */}
                            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md p-0.5 space-x-0.5">
                              {(['p0', 'p1', 'p2', 'p3'] as const).map((p) => {
                                const isSelected = task.priority === p;
                                const pData = getPriorityBadge(p);
                                return (
                                  <button
                                    key={p}
                                    onClick={() => changeTaskPriority(inspectingAgent.id, task.id, p)}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                                      isSelected
                                        ? pData.bg
                                        : 'text-slate-500 hover:text-slate-300'
                                    }`}
                                    title={`Set priority to ${pData.label}`}
                                  >
                                    {p.toUpperCase()}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Move Up / Down Buttons */}
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => moveTaskUp(inspectingAgent.id, idx)}
                                disabled={idx === 0}
                                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                title="Move task up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => moveTaskDown(inspectingAgent.id, idx)}
                                disabled={idx === (agentTaskQueues[inspectingAgent.id]?.length || 0) - 1}
                                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                title="Move task down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => promoteTaskToTop(inspectingAgent.id, idx)}
                                disabled={idx === 0}
                                className="px-2 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-[10px] font-mono disabled:opacity-30 disabled:cursor-not-allowed transition"
                                title="Promote directly to #1 top priority"
                              >
                                Top
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: OVERVIEW & MANDATES */}
              {inspectorTab === 'overview' && (
                <div className="space-y-4">
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
                    <ul className="space-y-2">
                      {inspectingAgent.mandate.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                          <span className="text-indigo-400 font-mono font-bold">0{idx + 1}.</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 3: TELEMETRY RESULTS */}
              {inspectorTab === 'results' && lastResults && lastResults[inspectingAgent.id] && (
                <div className="space-y-3">
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
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                {agentTaskQueues[inspectingAgent.id]?.length || 0} tasks tracked in queue
              </span>
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
