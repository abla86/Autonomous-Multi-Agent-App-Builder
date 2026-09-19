import React from 'react';
import { ShieldCheck, Plus, User, Sparkles, AlertCircle, ArrowDownRight } from 'lucide-react';
import { Subscription, UserContactProfile } from '../types';

interface HeaderProps {
  subscriptions: Subscription[];
  onOpenFinder: () => void;
  onOpenProfile: () => void;
  userProfile: UserContactProfile;
}

export const Header: React.FC<HeaderProps> = ({
  subscriptions,
  onOpenFinder,
  onOpenProfile,
  userProfile,
}) => {
  // Monthly calculations
  const calculateMonthlyPrice = (sub: Subscription) => {
    if (sub.billingCycle === 'yearly') return Math.round(sub.price / 12);
    if (sub.billingCycle === 'weekly') return Math.round(sub.price * 4.33);
    if (sub.billingCycle === 'quarterly') return Math.round(sub.price / 3);
    return sub.price;
  };

  const activeSubs = subscriptions.filter((s) => s.status !== 'cancelled' && s.status !== 'force_blocked');
  const toCancelSubs = subscriptions.filter((s) => s.status === 'to_cancel');
  const cancelledSubs = subscriptions.filter((s) => s.status === 'cancelled' || s.status === 'force_blocked');

  const totalMonthlyCost = activeSubs.reduce((acc, sub) => acc + calculateMonthlyPrice(sub), 0);
  const potentialMonthlySavings = toCancelSubs.reduce((acc, sub) => acc + calculateMonthlyPrice(sub), 0);
  const totalYearlySavings = potentialMonthlySavings * 12;

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-sm shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Abonnementsfinner & Oppsigelse</h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-medium px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Aktiv beskyttelse
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Finn alle abonnementer uansett kilde • Velg behold eller avslutt • Tving oppsigelser
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              id="open-profile-btn"
              onClick={onOpenProfile}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
              title="Endre navn og kontaktinfo brukt i oppsigelsesbrev"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span className="truncate max-w-[120px] sm:max-w-none">{userProfile.fullName || 'Avsenderprofil'}</span>
            </button>

            <button
              id="open-finder-btn"
              onClick={onOpenFinder}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-sm hover:shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>Finn / Skann abonnementer</span>
            </button>
          </div>
        </div>

        {/* Quick financial telemetry stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-800">
            <div className="text-xs text-slate-400">Aktive abonnementer</div>
            <div className="text-lg font-bold text-white flex items-baseline gap-1.5">
              <span>{activeSubs.length}</span>
              <span className="text-xs font-normal text-slate-500">av {subscriptions.length} totalt</span>
            </div>
          </div>

          <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-800">
            <div className="text-xs text-slate-400">Løpende månedskostnad</div>
            <div className="text-lg font-bold text-slate-100">{totalMonthlyCost.toLocaleString('no-NO')} kr</div>
          </div>

          <div className="bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/40">
            <div className="text-xs text-rose-300 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Skal avsluttes</span>
            </div>
            <div className="text-lg font-bold text-rose-200">{toCancelSubs.length} tjenester</div>
          </div>

          <div className="bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/40">
            <div className="text-xs text-emerald-300 font-medium flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>Du sparer ved oppsigelse</span>
            </div>
            <div className="text-lg font-bold text-emerald-300">
              {potentialMonthlySavings.toLocaleString('no-NO')} kr<span className="text-xs text-emerald-400/80 font-normal">/mnd</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
