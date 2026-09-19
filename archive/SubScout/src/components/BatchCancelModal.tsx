import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  CheckCircle2,
  Mail,
  Copy,
  Check,
  Printer,
  ExternalLink,
  Ban,
  FileCheck2,
} from 'lucide-react';
import { Subscription, UserContactProfile } from '../types';

interface BatchCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  toCancelSubscriptions: Subscription[];
  userProfile: UserContactProfile;
  onConfirmAllCancelled: (ids: string[]) => void;
}

export const BatchCancelModal: React.FC<BatchCancelModalProps> = ({
  isOpen,
  onClose,
  toCancelSubscriptions,
  userProfile,
  onConfirmAllCancelled,
}) => {
  const [copiedBatch, setCopiedBatch] = useState(false);

  if (!isOpen) return null;

  const today = new Date().toLocaleDateString('no-NO');

  const batchText = `SAMLETS OPPSIGELSESLISTE OG KRAV OM STANS AV TREKK

Dato: ${today}
Kunde: ${userProfile.fullName || '[Ditt navn]'}
E-post: ${userProfile.email || '[Din e-post]'}
${userProfile.phone ? `Telefon: ${userProfile.phone}\n` : ''}
Følgende abonnementer er formelt sagt opp med umiddelbar virkning:

${toCancelSubscriptions
  .map(
    (s, idx) =>
      `${idx + 1}. ${s.name}
   - Beløp: ${s.price} kr (${s.billingCycle})
   - Opprinnelse: ${s.source}
   - Referanse: ${s.customerReference || 'Ikke spesifisert'}
   - Kontakt / Oppsigelse: ${s.supportEmail || s.cancellationUrl || 'Direkte'}`
  )
  .join('\n\n')}

JURIDISK ERKVERV:
Alle tilknyttede betalingsoppdrag, AvtaleGiro-trekk, eFaktura og kortfullmakter tilknyttet ovennevnte tjenester kalles herved formelt tilbake i samsvar med avtaleloven, forbrukerkjøpsloven og angrerettloven. Eventuelle trekk etter oppsigelsesdato vil bli krevet tilbakeført via bank iht. Finansavtaleloven § 2-10.`;

  const handleCopyBatch = () => {
    navigator.clipboard.writeText(batchText);
    setCopiedBatch(true);
    setTimeout(() => setCopiedBatch(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmAll = () => {
    const ids = toCancelSubscriptions.map((s) => s.id);
    onConfirmAllCancelled(ids);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div
        id="batch-cancel-modal"
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Tving oppsigelser på {toCancelSubscriptions.length} valgte abonnementer
              </h2>
              <p className="text-xs text-slate-400">
                Samlet oversikt over formelle oppsigelser og direkte avbestillingslenker
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            aria-label="Lukk modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Abonnementer som skal avsluttes:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyBatch}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                {copiedBatch ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBatch ? 'Kopiert!' : 'Kopier samlerapport'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Skriv ut</span>
              </button>
            </div>
          </div>

          {/* List of services to cancel */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {toCancelSubscriptions.map((sub) => (
              <div
                key={sub.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">{sub.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {sub.price} kr/{sub.billingCycle === 'yearly' ? 'år' : 'mnd'} • Ref: {sub.customerReference || 'Registrert e-post'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {sub.cancellationUrl && (
                    <a
                      href={sub.cancellationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition"
                    >
                      <span>Gå til oppsigelse</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {sub.supportEmail && (
                    <a
                      href={`mailto:${sub.supportEmail}?subject=${encodeURIComponent('Oppsigelse av abonnement: ' + sub.name)}&body=${encodeURIComponent(`Herved sies abonnement på ${sub.name} opp med umiddelbar virkning fra ${userProfile.fullName || 'Kunde'}.`)}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition"
                    >
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span>Send e-post</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Preview of batch formal notice */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Juridisk samlevarsel (kopi for arkiv og bank):
            </label>
            <textarea
              readOnly
              rows={8}
              value={batchText}
              className="w-full text-xs font-mono p-3 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 leading-relaxed resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Lukk
          </button>

          <button
            type="button"
            id="batch-confirm-all-btn"
            onClick={handleConfirmAll}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs sm:text-sm font-bold hover:bg-rose-500 shadow-sm transition"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Merk alle {toCancelSubscriptions.length} som formelt oppsagt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
