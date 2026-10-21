import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  FileText,
  FileSpreadsheet,
  Presentation,
  Archive,
  Printer,
  FileCode,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Eye,
  FileCheck,
  FolderArchive,
  Table,
} from 'lucide-react';
import { Project, ProjectFile, FileImportResult, ExportFormat } from '../types';
import { parseUniversalFile, exportProjectInFormat } from '../utils/fileConverters';

interface FileImportExportModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSaveFiles: (files: Array<{ name: string; path: string; content: string; language: string }>) => Promise<void>;
  initialTab?: 'import' | 'export';
}

export const FileImportExportModal: React.FC<FileImportExportModalProps> = ({
  project,
  isOpen,
  onClose,
  onSaveFiles,
  initialTab = 'import',
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>(initialTab);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importedResults, setImportedResults] = useState<FileImportResult[]>([]);
  const [previewFile, setPreviewFile] = useState<FileImportResult | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process Files
  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsProcessing(true);
    setFeedback(null);

    const parsedBatch: FileImportResult[] = [];

    try {
      for (let i = 0; i < fileList.length; i++) {
        const f = fileList[i];
        const results = await parseUniversalFile(f);
        parsedBatch.push(...results);
      }

      setImportedResults((prev) => [...prev, ...parsedBatch]);
      setFeedback({
        type: 'success',
        message: `Lest inn ${parsedBatch.length} fil(er). Se gjennom listen og bekreft import til prosjektet.`,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: `Feil under parsing av fil: ${err.message || 'Kunne ikke lese format.'}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await handleFiles(e.dataTransfer.files);
  };

  // Confirm Import into Project
  const handleConfirmImport = async () => {
    if (importedResults.length === 0) return;
    setIsProcessing(true);
    try {
      await onSaveFiles(
        importedResults.map((r) => ({
          name: r.name,
          path: r.path,
          content: r.content,
          language: r.language,
        }))
      );
      setFeedback({
        type: 'success',
        message: `Vellykket importert ${importedResults.length} fil(er) inn i ${project.name}!`,
      });
      setImportedResults([]);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: `Feil ved lagring: ${err.message}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Export
  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setFeedback(null);
    try {
      await exportProjectInFormat(project, format);
      setFeedback({
        type: 'success',
        message: `Vellykket eksportert prosjekt som ${format.toUpperCase()}!`,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: `Eksportfeil: ${err.message}`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              {activeTab === 'import' ? <Upload className="w-5 h-5" /> : <Download className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Universell Fil-Import &amp; Eksport (Word, Excel, PDF, PPT, ZIP)
              </h3>
              <p className="text-xs text-slate-400">
                Full toveis støtte for alle dokumentformater, regneark, presentasjoner, PDF og kildekode.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 flex space-x-2 border-b border-slate-800 bg-slate-950/40">
          <button
            id="tab-modal-import"
            onClick={() => setActiveTab('import')}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 text-xs font-semibold transition ${
              activeTab === 'import'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importer Filer (Word / Excel / PDF / PPT / ZIP)</span>
          </button>

          <button
            id="tab-modal-export"
            onClick={() => setActiveTab('export')}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 text-xs font-semibold transition ${
              activeTab === 'export'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Eksporter Prosjekt (Alle Formater)</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {feedback && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center space-x-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* TAB 1: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-600/10'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-950/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                  accept=".docx,.doc,.xlsx,.xls,.csv,.pptx,.ppt,.pdf,.zip,.ts,.tsx,.js,.jsx,.json,.py,.md,.txt,.html,.css,.sql,.env,.yaml,.yml"
                />

                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Upload className="w-6 h-6" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Dra og slipp filer her, eller <span className="text-indigo-400 underline">velg fra maskinen</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Støtter Word (.docx, .doc), Excel (.xlsx, .csv), PowerPoint (.pptx), PDF (.pdf), ZIP arkiv, samt kildekode (.ts, .tsx, .py, .json osv.)
                  </p>
                </div>

                {isProcessing && (
                  <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono pt-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Parser og dekomprimerer dokumentinnhold...</span>
                  </div>
                )}
              </div>

              {/* Parsed Results Staging Table */}
              {importedResults.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                      Klare for import ({importedResults.length} filer):
                    </h4>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setImportedResults([])}
                        className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
                      >
                        Tøm liste
                      </button>
                      <button
                        id="btn-confirm-import-all"
                        onClick={handleConfirmImport}
                        disabled={isProcessing}
                        className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Importer alle ({importedResults.length})</span>
                      </button>
                    </div>
                  </div>

                  <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                    <div className="max-h-60 overflow-y-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-900 text-slate-400 text-[11px] border-b border-slate-800">
                          <tr>
                            <th className="p-2.5">Filnavn &amp; Målvei</th>
                            <th className="p-2.5">Format</th>
                            <th className="p-2.5">Ekstrahert Sammendrag</th>
                            <th className="p-2.5 text-right">Forhåndsvis</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {importedResults.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/40">
                              <td className="p-2.5 text-slate-200 font-semibold truncate max-w-[200px]">
                                {item.name}
                                <div className="text-[10px] text-slate-500 font-normal">{item.path}</div>
                              </td>
                              <td className="p-2.5 text-indigo-300">{item.originalType}</td>
                              <td className="p-2.5 text-slate-400 text-[11px]">{item.summary}</td>
                              <td className="p-2.5 text-right">
                                <button
                                  onClick={() => setPreviewFile(item)}
                                  className="text-xs text-indigo-400 hover:text-indigo-300 font-sans"
                                >
                                  Vis
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Drawer */}
              {previewFile && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono">{previewFile.path}</span>
                    <button
                      onClick={() => setPreviewFile(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕ Lukk
                    </button>
                  </div>
                  <pre className="p-3 rounded bg-slate-900 text-slate-300 font-mono text-[11px] overflow-x-auto max-h-48">
                    {previewFile.content.slice(0, 2000)}
                    {previewFile.content.length > 2000 && '\n... [forkortet for forhåndsvisning]'}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Eksporter hele prosjektet <strong>{project.name}</strong> ({project.files.length} filer, {project.stats.linesOfCode} LOC) til ønsket format:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. ZIP */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition flex flex-col justify-between space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                      <Archive className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Fullt Prosjekt (ZIP)</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Komplett arkiv med mapper, README.md, manifest og alle kildekodefiler.
                      </p>
                    </div>
                  </div>
                  <button
                    id="btn-export-zip"
                    onClick={() => handleExport('zip')}
                    disabled={isExporting}
                    className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                  >
                    Last ned .ZIP
                  </button>
                </div>

                {/* 2. Word (.docx) */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition flex flex-col justify-between space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Word Dokument (.docx)</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Formatert spesifikasjonsdokument med arkitektur, koderapport og tabeller.
                      </p>
                    </div>
                  </div>
                  <button
                    id="btn-export-docx"
                    onClick={() => handleExport('docx')}
                    disabled={isExporting}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-semibold border border-slate-700 transition"
                  >
                    Last ned .DOCX
                  </button>
                </div>

                {/* 3. Excel (.xlsx / .csv) */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition flex flex-col justify-between space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Excel Regneark (.csv / .xlsx)</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Strukturert filinventar med linjetellinger, byte-størrelser og helsemetrikker.
                      </p>
                    </div>
                  </div>
                  <button
                    id="btn-export-csv"
                    onClick={() => handleExport('csv')}
                    disabled={isExporting}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold border border-slate-700 transition"
                  >
                    Last ned Regneark (.csv)
                  </button>
                </div>

                {/* 4. PowerPoint (.pptx / .md) */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition flex flex-col justify-between space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-amber-600/20 text-amber-400 border border-amber-500/30">
                      <Presentation className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">PowerPoint (.pptx outline)</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Slide-by-slide arkitekturpresentasjon med kulepunkter for styremøter.
                      </p>
                    </div>
                  </div>
                  <button
                    id="btn-export-pptx"
                    onClick={() => handleExport('docx')}
                    disabled={isExporting}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 transition"
                  >
                    Last ned Presentasjon
                  </button>
                </div>

                {/* 5. PDF Print Report */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition flex flex-col justify-between space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30">
                      <Printer className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Utskriftsvennlig PDF-rapport</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Full rapport for utskrift eller lagring som PDF med syntaxfarging og status.
                      </p>
                    </div>
                  </div>
                  <button
                    id="btn-export-pdf"
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold border border-slate-700 transition"
                  >
                    Generer PDF-rapport
                  </button>
                </div>

                {/* 6. JSON Manifest */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition flex flex-col justify-between space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">JSON Pakke (.json)</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Rå maskinlesbar JSON for integrasjon med CI/CD eller eksterne pipelines.
                      </p>
                    </div>
                  </div>
                  <button
                    id="btn-export-json"
                    onClick={() => handleExport('json')}
                    disabled={isExporting}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-semibold border border-slate-700 transition"
                  >
                    Last ned .JSON
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
