import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  PiggyBank,
  CheckCircle2,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { Subscription } from '../types';

interface SavingsSummaryBannerProps {
  toCancelCount: number;
  monthlySavings: number;
  yearlySavings: number;
  onBatchForceCancel: () => void;
  onExportReport: () => void;
}

export const SavingsSummaryBanner: React.FC<SavingsSummaryBannerProps> = ({
  toCancelCount,
  monthlySavings,
  yearlySavings,
  onBatchForceCancel,
  onExportReport,
}) => {
  if (toCancelCount === 0) {
    return (
      <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800">
              Ingen abonnementer merket for oppsigelse ennå
            </h3>
            <p className="text-xs text-slate-500">
              Trykk på «Avslutt / Si opp» på abonnementene du ikke lenger trenger for å beregne besparelse og tvinge fram oppsigelse.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-rose-950/90 via-slate-900 to-slate-900 text-white border border-rose-800/40 rounded-2xl p-4 sm:p-6 mb-6 shadow-lg relative overflow-hidden">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-rose-500/30 text-rose-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-rose-400/30">
                {toCancelCount} {toCancelCount === 1 ? 'abonnement' : 'abonnementer'} klar til oppsigelse
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1">
              Du frigjør <span className="text-emerald-400">{monthlySavings.toLocaleString('no-NO')} kr/mnd</span> ved å avslutte disse
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Tilsvarer en årlig besparelse på <strong className="text-white font-semibold">{yearlySavings.toLocaleString('no-NO')} kr i året</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={onExportReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 transition"
            title="Eksporter oppsigelsesliste som tekst eller PDF"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Last ned oversikt</span>
          </button>

          <button
            type="button"
            onClick={onBatchForceCancel}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Tving oppsigelser nå</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
