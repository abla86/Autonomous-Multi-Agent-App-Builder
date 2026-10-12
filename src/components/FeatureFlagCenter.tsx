import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Shield,
  Zap,
  Bot,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { FeatureFlag, FeatureFlagCategory } from '../types';
import { api } from '../services/api';
import { clientLogger } from '../services/clientLogger';

export const FeatureFlagCenter: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New flag form
  const [newKey, setNewKey] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newCategory, setNewCategory] = useState<FeatureFlagCategory>('experimental');
  const [newRollout, setNewRollout] = useState<number>(100);

  const loadFlags = async () => {
    setIsLoading(true);
    try {
      const data = await api.getFeatureFlags();
      setFlags(data);
    } catch (e) {
      console.error('Failed to load feature flags:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFlags();
  }, []);

  const handleToggle = async (key: string) => {
    try {
      const updated = await api.toggleFeatureFlag(key);
      setFlags((prev) => prev.map((f) => (f.key === key ? updated : f)));
      clientLogger.userAction('FEATURE_FLAG_TOGGLED', `Feature flag "${key}" set to ${updated.enabled}`, {
        key,
        enabled: updated.enabled,
      });
    } catch (e) {
      console.error('Failed to toggle feature flag:', e);
    }
  };

  const handleRolloutChange = async (key: string, rolloutPercentage: number) => {
    try {
      const updated = await api.updateFeatureFlag(key, { rolloutPercentage });
      setFlags((prev) => prev.map((f) => (f.key === key ? updated : f)));
    } catch (e) {
      console.error('Failed to update rollout percentage:', e);
    }
  };

  const handleCreateFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey || !newName) return;

    try {
      const created = await api.createFeatureFlag({
        key: newKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        name: newName.trim(),
        description: newDesc.trim(),
        category: newCategory,
        enabled: true,
        rolloutPercentage: newRollout,
        environment: 'all',
      });

      setFlags((prev) => [created, ...prev]);
      setShowAddModal(false);
      setNewKey('');
      setNewName('');
      setNewDesc('');
      clientLogger.userAction('FEATURE_FLAG_CREATED', `Created feature flag "${created.key}"`);
    } catch (e) {
      console.error('Failed to create flag:', e);
    }
  };

  const handleResetDefaults = async () => {
    if (confirm('Reset all feature flags to initial factory defaults?')) {
      const reset = await api.resetFeatureFlags();
      setFlags(reset);
      clientLogger.userAction('FEATURE_FLAGS_RESET', 'Reset feature flags to defaults');
    }
  };

  const filteredFlags = flags.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const enabledCount = flags.filter((f) => f.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Dynamic Feature Flag Control</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  ZERO-DEPLOYMENT TOGGLES
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Toggle features on/off instantly at runtime across reliability, swarm orchestrator, and testing pipelines.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700/60 text-xs font-mono">
              <span className="text-slate-400">ACTIVE: </span>
              <strong className="text-emerald-400">{enabledCount}</strong> / {flags.length} Flags
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Flag</span>
            </button>

            <button
              onClick={handleResetDefaults}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
              title="Reset flags to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search feature flags by name, key, or mandate..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {['all', 'reliability', 'swarm', 'editor', 'security', 'experimental'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Flags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFlags.map((flag) => {
          return (
            <div
              key={flag.key}
              className={`p-5 rounded-xl border transition shadow-md flex flex-col justify-between ${
                flag.enabled
                  ? 'bg-slate-900 border-indigo-500/40'
                  : 'bg-slate-900/60 border-slate-800 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{flag.name}</h3>
                    <code className="text-[11px] text-indigo-400 font-mono mt-0.5 block">{flag.key}</code>
                  </div>

                  <button
                    onClick={() => handleToggle(flag.key)}
                    className="focus:outline-none transition flex-shrink-0"
                    title={flag.enabled ? 'Click to disable' : 'Click to enable'}
                  >
                    {flag.enabled ? (
                      <ToggleRight className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-600" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-300 mt-2">{flag.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-400">
                    {flag.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Env: {flag.environment}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-400 font-mono">Rollout:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={flag.rolloutPercentage}
                    onChange={(e) => handleRolloutChange(flag.key, parseInt(e.target.value, 10))}
                    className="w-16 accent-indigo-500"
                  />
                  <span className="text-[10px] font-mono font-bold text-white">{flag.rolloutPercentage}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Flag Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create New Dynamic Feature Flag</h3>

            <form onSubmit={handleCreateFlag} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Flag Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (!newKey) {
                      setNewKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
                    }
                  }}
                  placeholder="e.g. Heuristic Code Auto-Repair"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Key Identifier (code key)</label>
                <input
                  type="text"
                  required
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="heuristic_code_repair"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What does this feature toggle control?"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="reliability">Reliability</option>
                    <option value="swarm">Swarm</option>
                    <option value="editor">Editor</option>
                    <option value="security">Security</option>
                    <option value="experimental">Experimental</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Rollout %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newRollout}
                    onChange={(e) => setNewRollout(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow"
                >
                  Create Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
