import React, { useState } from 'react';
import { X, Sparkles, FolderPlus } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => Promise<void>;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreate(name.trim(), description.trim());
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderPlus className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Initialize Autonomous Project</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          The 20-Agent Autonomous Swarm will immediately inspect the codebase, establish AST mappings, run diagnostics, and enforce production tests.
        </p>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Project Name</label>
          <input
            id="input-new-project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Realtime Analytics Pipeline"
            required
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Architecture Description</label>
          <textarea
            id="input-new-project-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief summary of domain logic, backend endpoints, and storage requirements..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs transition"
          >
            Cancel
          </button>
          <button
            id="btn-confirm-create-project"
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition"
          >
            {isSubmitting ? 'Initializing...' : 'Scaffold & Register'}
          </button>
        </div>
      </form>
    </div>
  );
};
