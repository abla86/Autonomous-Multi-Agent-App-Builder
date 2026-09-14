import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Lock, RefreshCw } from 'lucide-react';
import { SecurityReport } from '../types';

interface SecurityCenterProps {
  report: SecurityReport | null;
  isScanning: boolean;
  onRunScan: () => void;
}

export const SecurityCenter: React.FC<SecurityCenterProps> = ({
  report,
  isScanning,
  onRunScan,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Agent 7 Security & Vulnerability Sentinel</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automated source code auditor checking against OWASP Top 10 vulnerabilities, leaked API tokens, and injection vectors.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {report && (
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono block">SECURITY GRADE</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">{report.grade} ({report.score}/100)</span>
                </div>
              </div>
            )}

            <button
              id="btn-run-security-scan"
              onClick={onRunScan}
              disabled={isScanning}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition ${
                isScanning
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
              }`}
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning AST & Sources...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Run Security Vulnerability Scan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Checked Rules Checklist */}
        {report && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-5 pt-4 border-t border-slate-800 text-xs">
            {Object.entries(report.checkedRules).map(([rule, passed]) => (
              <div
                key={rule}
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between"
              >
                <span className="text-[11px] text-slate-300 capitalize">
                  {rule.replace(/([A-Z])/g, ' $1')}
                </span>
                {passed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vulnerabilities List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Detected Vulnerability Signatures</span>
          <span>{report ? `${report.vulnerabilities.length} issues found` : 'Awaiting scan'}</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {!report || report.vulnerabilities.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
              <p className="font-medium text-slate-200">Zero Critical Vulnerabilities Detected</p>
              <p className="text-slate-500 text-xs max-w-md">
                No plain text secrets, eval expressions, or XSS vectors found in project source code.
              </p>
            </div>
          ) : (
            report.vulnerabilities.map((vuln) => (
              <div key={vuln.id} className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{vuln.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      {vuln.severity}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{vuln.rule}</span>
                  </div>
                  <p className="text-xs text-slate-400">{vuln.description}</p>
                  <p className="text-xs text-indigo-400 font-mono mt-1">Resolution: {vuln.resolution}</p>
                </div>

                <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">
                  {vuln.file}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
