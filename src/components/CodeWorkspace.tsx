import React, { useState } from 'react';
import { FileCode, Plus, Save, Trash2, Download, Check, Code, FileText } from 'lucide-react';
import { Project, ProjectFile } from '../types';

interface CodeWorkspaceProps {
  project: Project;
  onSaveFile: (file: { id?: string; name: string; path: string; content: string; language: string }) => Promise<void>;
  onDeleteFile: (fileId: string) => Promise<void>;
  onExport: () => void;
}

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({
  project,
  onSaveFile,
  onDeleteFile,
  onExport,
}) => {
  const [selectedFileId, setSelectedFileId] = useState<string>(project.files[0]?.id || '');
  const [fileContent, setFileContent] = useState<string>(project.files[0]?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFilePath, setNewFilePath] = useState('/src/');

  const activeFile = project.files.find((f) => f.id === selectedFileId) || project.files[0];

  const handleSelectFile = (file: ProjectFile) => {
    setSelectedFileId(file.id);
    setFileContent(file.content);
  };

  const handleSave = async () => {
    if (!activeFile) return;
    setIsSaving(true);
    try {
      await onSaveFile({
        id: activeFile.id,
        name: activeFile.name,
        path: activeFile.path,
        content: fileContent,
        language: activeFile.language,
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    } catch (err) {
      console.error('Failed to save file:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const finalPath = newFilePath.endsWith('/')
      ? `${newFilePath}${newFileName.trim()}`
      : `${newFilePath}/${newFileName.trim()}`;

    const ext = newFileName.split('.').pop() || 'ts';
    const lang = ext === 'tsx' || ext === 'ts' ? 'typescript' : ext === 'json' ? 'json' : 'javascript';

    await onSaveFile({
      name: newFileName.trim(),
      path: finalPath,
      content: `// ${newFileName.trim()}\n// Created for ${project.name}\n`,
      language: lang,
    });

    setNewFileName('');
    setShowNewFileModal(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col lg:flex-row h-[650px]">
      {/* File Tree Sidebar */}
      <div className="w-full lg:w-72 bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileCode className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Repository Tree
            </span>
          </div>
          <button
            id="btn-add-file"
            onClick={() => setShowNewFileModal(true)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Create new file"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {project.files.map((file) => {
            const isSelected = activeFile && activeFile.id === file.id;
            return (
              <button
                key={file.id}
                id={`file-item-${file.id}`}
                onClick={() => handleSelectFile(file)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                  isSelected
                    ? 'bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <Code className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span className="truncate">{file.path}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{file.language}</span>
              </button>
            );
          })}
        </div>

        {/* Export action */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80">
          <button
            id="btn-export-project-bundle"
            onClick={onExport}
            className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Code Archive</span>
          </button>
        </div>
      </div>

      {/* Code Editor Panel */}
      <div className="flex-1 flex flex-col bg-slate-900">
        {activeFile ? (
          <>
            {/* Editor Top Bar */}
            <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono text-slate-200 font-semibold">{activeFile.path}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {fileContent.split('\n').length} lines
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {savedNotice && (
                  <span className="text-xs text-emerald-400 flex items-center space-x-1 font-mono">
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved</span>
                  </span>
                )}

                <button
                  id="btn-save-current-file"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save File'}</span>
                </button>

                {project.files.length > 1 && (
                  <button
                    id="btn-delete-file"
                    onClick={() => onDeleteFile(activeFile.id)}
                    className="p-1.5 rounded-md hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition"
                    title="Delete file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Editor Textarea */}
            <div className="flex-1 p-4 bg-slate-950 font-mono text-xs overflow-hidden">
              <textarea
                id="file-content-editor"
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="w-full h-full bg-transparent text-slate-200 focus:outline-none resize-none font-mono text-xs leading-relaxed selection:bg-indigo-900"
                spellCheck={false}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
            No file selected.
          </div>
        )}
      </div>

      {/* Create New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateFile}
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white">Create New Code File</h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">File Name (with extension):</label>
              <input
                id="input-new-file-name"
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="controller.ts"
                className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Directory Path:</label>
              <input
                id="input-new-file-path"
                type="text"
                value={newFilePath}
                onChange={(e) => setNewFilePath(e.target.value)}
                placeholder="/src/controllers/"
                className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                required
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewFileModal(false)}
                className="px-3 py-1.5 rounded text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Create File
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
