import React from 'react';
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldAlert,
  Calendar,
  AlertTriangle,
  Mail,
  Ban,
  FileText,
  Trash2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Subscription } from '../types';
import { SOURCE_LABELS, CATEGORY_LABELS } from '../data/initialSubscriptions';

interface SubscriptionCardProps {
  subscription: Subscription;
  onUpdateStatus: (id: string, status: Subscription['status']) => void;
  onOpenForceCancelModal: (subscription: Subscription) => void;
  onOpenBankBlockModal: (subscription: Subscription) => void;
  onDeleteSubscription: (id: string) => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onUpdateStatus,
  onOpenForceCancelModal,
  onOpenBankBlockModal,
  onDeleteSubscription,
}) => {
  const sourceInfo = SOURCE_LABELS[subscription.source] || SOURCE_LABELS.manual;
  const categoryName = CATEGORY_LABELS[subscription.category] || 'Annet';

  const isKeep = subscription.status === 'keep';
  const isToCancel = subscription.status === 'to_cancel';
  const isCancelled = subscription.status === 'cancelled';
  const isForceBlocked = subscription.status === 'force_blocked';

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('no-NO', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      id={`sub-card-${subscription.id}`}
      className={`rounded-xl border transition-all duration-200 bg-white shadow-sm hover:shadow-md ${
        isToCancel
          ? 'border-rose-200 ring-1 ring-rose-300/50 bg-rose-50/10'
          : isCancelled
          ? 'border-slate-200 bg-slate-50/70 opacity-90'
          : isForceBlocked
          ? 'border-amber-300 bg-amber-50/20'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* Top badges & price */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${sourceInfo.bg} ${sourceInfo.iconColor}`}>
                {sourceInfo.label}
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {categoryName}
              </span>
              {subscription.cancellationNoticeDays > 0 && (
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                  {subscription.cancellationNoticeDays} dagers frist
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-slate-900 truncate" title={subscription.name}>
              {subscription.name}
            </h3>
            {subscription.customerReference && (
              <p className="text-xs text-slate-500 truncate mt-0.5" title={subscription.customerReference}>
                Ref: {subscription.customerReference}
              </p>
            )}
          </div>

          {/* Cost display */}
          <div className="text-right shrink-0">
            <div className="text-lg sm:text-xl font-black text-slate-900">
              {subscription.price.toLocaleString('no-NO')} kr
            </div>
            <div className="text-xs text-slate-500 font-medium capitalize">
              {subscription.billingCycle === 'monthly'
                ? 'per måned'
                : subscription.billingCycle === 'yearly'
                ? 'per år'
                : subscription.billingCycle === 'weekly'
                ? 'per uke'
                : 'per termin'}
            </div>
          </div>
        </div>

        {/* Date / billing detail */}
        <div className="flex items-center gap-2 text-xs text-slate-600 mb-4 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Neste fornyelse: <strong className="font-semibold text-slate-800">{formatDate(subscription.nextRenewalDate)}</strong></span>
          {subscription.notes && (
            <span className="hidden sm:inline text-slate-400 ml-auto truncate max-w-[200px]" title={subscription.notes}>
              • {subscription.notes}
            </span>
          )}
        </div>

        {/* Core Decision Selector: BEHOLD vs AVSLUTT */}
        <div className="bg-slate-100/80 p-1 rounded-lg flex items-center gap-1 mb-4">
          <button
            type="button"
            id={`keep-btn-${subscription.id}`}
            onClick={() => onUpdateStatus(subscription.id, 'keep')}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5 ${
              isKeep
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isKeep ? 'text-white' : 'text-slate-400'}`} />
            <span>Behold abonnement</span>
          </button>

          <button
            type="button"
            id={`cancel-btn-${subscription.id}`}
            onClick={() => onUpdateStatus(subscription.id, 'to_cancel')}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5 ${
              isToCancel || isCancelled || isForceBlocked
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <XCircle className={`w-4 h-4 ${isToCancel || isCancelled || isForceBlocked ? 'text-white' : 'text-slate-400'}`} />
            <span>Avslutt / Si opp</span>
          </button>
        </div>

        {/* Status Actions based on Decision */}
        {isKeep && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-500">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Aktivt og godkjent
            </span>
            <button
              onClick={() => onDeleteSubscription(subscription.id)}
              className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
              title="Fjern fra listen"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {isToCancel && (
          <div className="pt-2 border-t border-rose-100 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-rose-800">
              <span className="font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Merket for avslutning
              </span>
              <span className="text-rose-600/90 font-medium">
                Sparer {subscription.price} kr/{subscription.billingCycle === 'yearly' ? 'år' : 'mnd'}
              </span>
            </div>

            {/* Forced cancellation main triggers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              <button
                id={`force-cancel-action-${subscription.id}`}
                onClick={() => onOpenForceCancelModal(subscription)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 shadow-xs transition"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Tving oppsigelse nå</span>
              </button>

              <button
                id={`bank-block-action-${subscription.id}`}
                onClick={() => onOpenBankBlockModal(subscription)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 text-slate-100 text-xs font-semibold hover:bg-slate-700 transition"
              >
                <Ban className="w-3.5 h-3.5 text-amber-400" />
                <span>Sperr trekk i bank</span>
              </button>
            </div>

            {subscription.cancellationUrl && (
              <a
                href={subscription.cancellationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 mt-1 hover:underline py-0.5"
              >
                <span>Gå til direkte avbestilling hos {subscription.name}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {isCancelled && (
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-700">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span className="font-semibold text-slate-800">Fullført oppsagt</span>
              {subscription.forcedNoticeSentAt && (
                <span className="text-[11px] text-slate-500">
                  ({formatDate(subscription.forcedNoticeSentAt)})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenForceCancelModal(subscription)}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Se oppsigelse</span>
              </button>
              <button
                onClick={() => onDeleteSubscription(subscription.id)}
                className="text-slate-400 hover:text-rose-600 p-1"
                title="Fjern fra oversikten"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {isForceBlocked && (
          <div className="pt-2 border-t border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-amber-900 font-semibold">
              <Ban className="w-3.5 h-3.5 text-amber-600" />
              <span>Tvangsstopp aktivert hos bank/kort</span>
            </div>
            <button
              onClick={() => onOpenBankBlockModal(subscription)}
              className="text-xs text-amber-800 hover:underline font-medium"
            >
              Vis bankinstruks
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
