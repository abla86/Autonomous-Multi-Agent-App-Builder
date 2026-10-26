import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, Download, RefreshCw, FileText, Check } from 'lucide-react';
import { Project, DeploymentGateCheck } from '../types';
import { api } from '../services/api';

interface ProductionGateProps {
  project: Project;
  onExport: () => void;
}

export const ProductionGate: React.FC<ProductionGateProps> = ({ project, onExport }) => {
  const [checks, setChecks] = useState<DeploymentGateCheck[]>([]);
  const [readyForDeploy, setReadyForDeploy] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchChecks = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDeployChecks(project.id);
      setChecks(data.checks);
      setReadyForDeploy(data.readyForDeploy);
      setScore(data.score);
    } catch (err) {
      console.error('Failed to get deployment checks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChecks();
  }, [project.id]);

  return (
    <div className="space-y-6">
      {/* Evidence-based deployment gate status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${readyForDeploy ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-amber-500/10 border-amber-500/30 text-amber-400"}`}>
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">Deployment Readiness Checks</h2>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${readyForDeploy ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                  {readyForDeploy ? 'CHECKS PASSED' : checks.length ? 'BLOCKED / INCOMPLETE' : isLoading ? 'CHECKING' : 'UNAVAILABLE'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Evidence-based checks only. Unverified build, runtime security, dependency and browser tests block deployment readiness.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              id="btn-re-audit-gate"
              onClick={fetchChecks}
              disabled={isLoading}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Re-evaluate Gate</span>
            </button>

            <button
              id="btn-download-deployment-archive"
              onClick={onExport}
              className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Project JSON</span>
            </button>
          </div>
        </div>

        {/* Verification metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-800 text-center">
          <div>
            <span className="text-[11px] text-slate-500 font-mono block">GATE CHECK SCORE</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">{score}%</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-mono block">CHECKS PASSED</span>
            <span className="text-xl font-bold text-slate-200 font-mono">{checks.filter(c => c.status === 'pass').length} / {checks.length}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-mono block">GATE MODE</span>
            <span className="text-xl font-bold text-indigo-400 font-mono">Evidence-based</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-mono block">DEPLOYMENT CHECKS</span>
            <span className={`text-xl font-bold font-mono ${readyForDeploy ? "text-emerald-400" : "text-rose-400"}`}>{readyForDeploy ? "CHECKS PASSED" : "BLOCKED"}</span>
          </div>
        </div>
      </div>

      {/* 16-Point Final Acceptance Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Deployment Check Results</span>
          <span>{checks.length} Evidence Checks</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {checks.map((check) => (
            <div key={check.id} className="p-3.5 hover:bg-slate-800/20 transition flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 ${check.status === 'pass' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : check.status === 'fail' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                  {check.status === 'pass' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-100">{check.label}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                      {check.agentRef}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{check.notes}</p>
                </div>
              </div>

              <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full uppercase font-semibold flex-shrink-0 ${check.status === 'pass' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : check.status === 'fail' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                {check.status === 'pass' ? 'PASSED' : check.status === 'fail' ? 'FAILED' : 'NOT VERIFIED'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
