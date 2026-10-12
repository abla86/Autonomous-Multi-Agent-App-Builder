import React, { useState, useEffect } from 'react';
import {
  FileCode,
  Plus,
  Save,
  Trash2,
  Download,
  Upload,
  Check,
  Code,
  FileText,
  Stethoscope,
  Edit3,
} from 'lucide-react';
import { Project, ProjectFile } from '../types';
import { CodeDoctor } from './CodeDoctor';
import { FileImportExportModal } from './FileImportExportModal';

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
  const [viewMode, setViewMode] = useState<'editor' | 'doctor'>('doctor');
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false);
  const [importExportInitialTab, setImportExportInitialTab] = useState<'import' | 'export'>('import');
  const [newFileName, setNewFileName] = useState('');
  const [newFilePath, setNewFilePath] = useState('/src/');

  const activeFile = project.files.find((f) => f.id === selectedFileId) || project.files[0];

  useEffect(() => {
    if (activeFile) {
      setFileContent(activeFile.content);
    }
  }, [activeFile?.id, activeFile?.content]);

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

  const handleApplyDoctorFix = async (updatedFile: ProjectFile) => {
    await onSaveFile({
      id: updatedFile.id,
      name: updatedFile.name,
      path: updatedFile.path,
      content: updatedFile.content,
      language: updatedFile.language,
    });
    setFileContent(updatedFile.content);
  };

  const handleSaveImportedFiles = async (files: Array<{ name: string; path: string; content: string; language: string }>) => {
    for (const f of files) {
      await onSaveFile(f);
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
    <div className="space-y-4">
      {/* Workspace Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col lg:flex-row min-h-[700px]">
        {/* File Tree Sidebar */}
        <div className="w-full lg:w-80 bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col">
          {/* Header */}
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                Repository Tree ({project.files.length})
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                id="btn-sidebar-import-files"
                onClick={() => {
                  setImportExportInitialTab('import');
                  setShowImportExportModal(true);
                }}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Importer Word, Excel, PDF, PPT eller ZIP"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
              </button>
              <button
                id="btn-add-file"
                onClick={() => setShowNewFileModal(true)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Create new file"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Files List */}
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

          {/* Import / Export Action Buttons */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-2">
            <button
              id="btn-trigger-import-modal"
              onClick={() => {
                setImportExportInitialTab('import');
                setShowImportExportModal(true);
              }}
              className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/40 transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Word / Excel / PDF / PPT / ZIP</span>
            </button>

            <button
              id="btn-export-project-bundle"
              onClick={() => {
                setImportExportInitialTab('export');
                setShowImportExportModal(true);
              }}
              className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Eksport (ZIP, DOCX, CSV, PDF)</span>
            </button>
          </div>
        </div>

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col bg-slate-900">
          {activeFile ? (
            <>
              {/* Workspace Top Bar with View Mode Switcher */}
              <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono text-slate-200 font-semibold">{activeFile.path}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    {fileContent.split('\n').length} lines
                  </span>
                </div>

                {/* View Mode Switcher: Code Doctor vs Raw Editor */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                    <button
                      id="view-mode-doctor"
                      onClick={() => setViewMode('doctor')}
                      className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition ${
                        viewMode === 'doctor'
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Code Doctor (Lese, Forstå &amp; Fikse)</span>
                    </button>
                    <button
                      id="view-mode-editor"
                      onClick={() => setViewMode('editor')}
                      className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition ${
                        viewMode === 'editor'
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Kildekode Editor</span>
                    </button>
                  </div>

                  {savedNotice && (
                    <span className="text-xs text-emerald-400 flex items-center space-x-1 font-mono">
                      <Check className="w-3.5 h-3.5" />
                      <span>Lagret</span>
                    </span>
                  )}

                  <button
                    id="btn-save-current-file"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Lagrer...' : 'Lagre'}</span>
                  </button>

                  {project.files.length > 1 && (
                    <button
                      id="btn-delete-file"
                      onClick={() => onDeleteFile(activeFile.id)}
                      className="p-1.5 rounded-md hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition"
                      title="Slett fil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* View Body */}
              {viewMode === 'doctor' ? (
                <div className="flex-1 p-4 overflow-y-auto bg-slate-950/60">
                  <CodeDoctor
                    file={activeFile}
                    projectId={project.id}
                    onApplyFix={handleApplyDoctorFix}
                  />
                </div>
              ) : (
                <div className="flex-1 p-4 bg-slate-950 font-mono text-xs overflow-hidden">
                  <textarea
                    id="file-content-editor"
                    value={fileContent}
                    onChange={(e) => setFileContent(e.target.value)}
                    className="w-full h-full bg-transparent text-slate-200 focus:outline-none resize-none font-mono text-xs leading-relaxed selection:bg-indigo-900"
                    spellCheck={false}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              Ingen fil valgt.
            </div>
          )}
        </div>
      </div>

      {/* Create New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateFile}
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white">Opprett Ny Kildekodefil</h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Filnavn (med filtype):</label>
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
              <label className="text-xs text-slate-400 block mb-1">Mappevei:</label>
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
                Avbryt
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Opprett Fil
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Universal File Import & Export Modal */}
      <FileImportExportModal
        project={project}
        isOpen={showImportExportModal}
        onClose={() => setShowImportExportModal(false)}
        onSaveFiles={handleSaveImportedFiles}
        initialTab={importExportInitialTab}
      />
    </div>
  );
};
