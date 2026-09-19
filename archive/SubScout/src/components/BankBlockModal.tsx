import React, { useState } from 'react';
import {
  X,
  Ban,
  Building2,
  CreditCard,
  Smartphone,
  Copy,
  Check,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Subscription, UserContactProfile } from '../types';

interface BankBlockModalProps {
  subscription: Subscription | null;
  userProfile: UserContactProfile;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBankBlock: (id: string) => void;
}

export const BankBlockModal: React.FC<BankBlockModalProps> = ({
  subscription,
  userProfile,
  isOpen,
  onClose,
  onConfirmBankBlock,
}) => {
  const [copiedBankLetter, setCopiedBankLetter] = useState<boolean>(false);
  const [selectedBank, setSelectedBank] = useState<'dnb' | 'sparebank1' | 'nordea' | 'sbanken' | 'vipps'>('dnb');

  if (!isOpen || !subscription) return null;

  const today = new Date().toLocaleDateString('no-NO');

  const bankMessageTemplate = `Melding til banken vedrørende sperring og tvangsstopp av trekk:

Kunde: ${userProfile.fullName || '[Ditt navn]'}
Fødselsnr / Kundenr: [Ditt fødselsnummer eller kontonummer]
Dato: ${today}

Gjelder: Sperring av uautoriserte gjentakende trekk fra "${subscription.name}"

Jeg har den ${today} formelt sagt opp mitt abonnement og skriftlig tilbakekalt enhver trekkfullmakt overfor ${subscription.name} (${subscription.price} kr/mnd).

I medhold av Finansavtaleloven § 2-10 og § 4-1 ber jeg herved banken om:
1. Å sperre forhandler/brukersted "${subscription.name}" for fremtidige automatiske trekk på mine kort og kontoer.
2. Slette eventuell tilknyttet AvtaleGiro-fullmakt.
3. Avvise og umiddelbart tilbakeføre (chargeback) eventuelle trekk som forsøkes gjennomført fra dette brukerstedet etter denne dato.

Vennligst bekreft at sperringen er iverksatt.

Hilsen,
${userProfile.fullName || '[Ditt navn]'}
${userProfile.phone || ''}`;

  const handleCopyBankMessage = () => {
    navigator.clipboard.writeText(bankMessageTemplate);
    setCopiedBankLetter(true);
    setTimeout(() => setCopiedBankLetter(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div
        id="bank-block-modal"
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Tving trekkstopp via bank</h2>
              <p className="text-xs text-slate-400">
                Slik tvinger du stans i betalingene dersom brukerstedet nekter eller ignorerer oppsigelse
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

        {/* Modal content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Target detail */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-900">
              <strong>Mottaker av trekk:</strong> {subscription.name} ({subscription.price} kr/
              {subscription.billingCycle === 'yearly' ? 'år' : 'mnd'})
              <div className="mt-1 text-xs text-amber-800">
                Ved å stanse trekket hos banken eller i Vipps, mister selskapet muligheten til å belaste kontoen din uavhengig av deres egne interne oppsigelsessystemer.
              </div>
            </div>
          </div>

          {/* Quick Bank Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
              Velg din bank for spesifikke instrukser:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => setSelectedBank('dnb')}
                className={`p-2 rounded-lg text-xs font-medium border text-center transition ${
                  selectedBank === 'dnb'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                DNB
              </button>
              <button
                type="button"
                onClick={() => setSelectedBank('sparebank1')}
                className={`p-2 rounded-lg text-xs font-medium border text-center transition ${
                  selectedBank === 'sparebank1'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                SpareBank 1
              </button>
              <button
                type="button"
                onClick={() => setSelectedBank('nordea')}
                className={`p-2 rounded-lg text-xs font-medium border text-center transition ${
                  selectedBank === 'nordea'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Nordea
              </button>
              <button
                type="button"
                onClick={() => setSelectedBank('sbanken')}
                className={`p-2 rounded-lg text-xs font-medium border text-center transition ${
                  selectedBank === 'sbanken'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Sbanken
              </button>
              <button
                type="button"
                onClick={() => setSelectedBank('vipps')}
                className={`p-2 rounded-lg text-xs font-medium border text-center transition ${
                  selectedBank === 'vipps'
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Vipps Trekk
              </button>
            </div>
          </div>

          {/* Instructions container */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-500" />
              Framgangsmåte i {selectedBank.toUpperCase()}:
            </h4>

            {selectedBank === 'vipps' ? (
              <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside leading-relaxed">
                <li>Åpne Vipps-appen på mobilen din.</li>
                <li>Trykk på <strong>Profil</strong> nede i høyre hjørne.</li>
                <li>Velg <strong>Faste betalinger</strong> eller <strong>Abonnementer</strong>.</li>
                <li>Finn <strong>{subscription.name}</strong> i listen.</li>
                <li>Trykk <strong>Avslutt avtale</strong> for å permanent sperre fremtidige trekk.</li>
              </ol>
            ) : (
              <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside leading-relaxed">
                <li>
                  <strong>Sperre AvtaleGiro / eFaktura:</strong> Logg inn i nettbanken, gå til <em>Betalinger &gt; AvtaleGiro</em>. Finn oppdraget knyttet til {subscription.name} og velg <em>«Slett avtale»</em> eller <em>«Stopp trekk»</em>.
                </li>
                <li>
                  <strong>Gjentakende korttrekk (Visa/Mastercard):</strong> Gå til <em>Kort &gt; Kortinnstillinger</em> i mobilbanken. Flere banker lar deg blokkere netthandel for bestemte utenlandske brukersteder, eller du kan sende melding til kundeservice for forhandlersperre.
                </li>
                <li>
                  <strong>Uautorisert trekk (Reklamasjon):</strong> Dersom de trekker etter at du har sagt opp, har banken plikt til å tilbakeføre beløpet via chargeback iht. Finansavtaleloven § 2-10.
                </li>
              </ol>
            )}
          </div>

          {/* Formell melding til banken */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Ferdig melding du kan sende i nettbankens meldingsboks:
              </label>
              <button
                type="button"
                onClick={handleCopyBankMessage}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded transition"
              >
                {copiedBankLetter ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copiedBankLetter ? 'Kopiert!' : 'Kopier'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={8}
              value={bankMessageTemplate}
              className="w-full text-xs font-mono p-3 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 leading-relaxed resize-none"
            />
          </div>
        </div>

        {/* Footer actions */}
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
            id="confirm-bank-block-btn"
            onClick={() => {
              onConfirmBankBlock(subscription.id);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs sm:text-sm font-semibold hover:bg-amber-500 shadow-sm transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Merk som tvangsstoppet i bank</span>
          </button>
        </div>
      </div>
    </div>
  );
};
