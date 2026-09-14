import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, Clock, ShieldAlert, Activity, RefreshCw } from 'lucide-react';
import { Project, TestSuiteSummary, TestItem } from '../types';

interface TestStudioProps {
  project: Project;
  testSummary: TestSuiteSummary | null;
  isRunningTests: boolean;
  onRunTests: () => void;
}

export const TestStudio: React.FC<TestStudioProps> = ({
  project,
  testSummary,
  isRunningTests,
  onRunTests,
}) => {
  const [suiteFilter, setSuiteFilter] = useState<'all' | 'unit' | 'integration' | 'api' | 'e2e'>('all');

  const filteredTests = testSummary
    ? testSummary.tests.filter((t) => (suiteFilter === 'all' ? true : t.suite === suiteFilter))
    : [];

  return (
    <div className="space-y-6">
      {/* Test Studio Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Agent 11 & 12 Test Engineering Studio</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automated regression suite executing genuine assertions. Strict mandate:
              <strong className="text-slate-300"> Zero mock bypass · No fake success · Zero disabled tests</strong>.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {testSummary && (
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  {testSummary.passed} PASSED
                </span>
                {testSummary.failed > 0 && (
                  <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                    {testSummary.failed} FAILED
                  </span>
                )}
                <span className="text-slate-500">{testSummary.durationMs}ms</span>
              </div>
            )}

            <button
              id="btn-run-tests-suite"
              onClick={onRunTests}
              disabled={isRunningTests}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition ${
                isRunningTests
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
              }`}
            >
              {isRunningTests ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing Tests...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Full Test Suite</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-2 mt-5 pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-500">Suite Filter:</span>
          {(['all', 'unit', 'integration', 'api', 'e2e'] as const).map((s) => (
            <button
              key={s}
              id={`filter-suite-${s}`}
              onClick={() => setSuiteFilter(s)}
              className={`text-xs px-2.5 py-1 rounded capitalize font-medium transition ${
                suiteFilter === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tests List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Test Assertion Case</span>
          <span>Execution Details</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredTests.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No test run recorded yet. Click "Execute Full Test Suite" above to launch tests.
            </div>
          ) : (
            filteredTests.map((test) => (
              <div key={test.id} className="p-4 hover:bg-slate-800/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  {test.status === 'passed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-white">{test.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase bg-slate-800 text-indigo-400 border border-slate-700">
                        {test.suite}
                      </span>
                    </div>
                    <code className="text-[11px] font-mono text-slate-400 mt-1 block">
                      {test.assertion}
                    </code>
                    {test.details && (
                      <p className="text-xs text-slate-400 mt-1">{test.details}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs font-mono text-slate-400 flex-shrink-0 self-end sm:self-center">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{test.durationMs}ms</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                      test.status === 'passed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {test.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
