import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Mail,
  Copy,
  Check,
  Printer,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  FileCheck2,
  Send,
  Building,
} from 'lucide-react';
import { Subscription, UserContactProfile } from '../types';

interface ForcedCancellationModalProps {
  subscription: Subscription | null;
  userProfile: UserContactProfile;
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancellation: (id: string, letter: string) => void;
}

export const ForcedCancellationModal: React.FC<ForcedCancellationModalProps> = ({
  subscription,
  userProfile,
  isOpen,
  onClose,
  onConfirmCancellation,
}) => {
  const [cancellationReason, setCancellationReason] = useState<string>('Generell oppsigelse etter eget ønske');
  const [customLetter, setCustomLetter] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [recipientEmail, setRecipientEmail] = useState<string>('');

  useEffect(() => {
    if (!subscription) return;
    setRecipientEmail(subscription.supportEmail || '');
    generateStandardLetter(subscription, userProfile, cancellationReason);
  }, [subscription, userProfile]);

  const generateStandardLetter = (
    sub: Subscription,
    profile: UserContactProfile,
    reason: string
  ) => {
    const today = new Date().toLocaleDateString('no-NO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const letter = `FORMELT VARSEL OM OPPSIGELSE OG TILBAKETREKKING AV TREKKFULLMAKT

Dato: ${today}
Til: Kundeservice / Oppsigelsesavdeling for ${sub.name}
E-post mottaker: ${sub.supportEmail || '[Fylles inn hvis kjent]'}

Kundeopplysninger:
Navn: ${profile.fullName || '[Ditt navn]'}
E-post: ${profile.email || '[Din e-post]'}
${profile.phone ? `Telefon: ${profile.phone}\n` : ''}${sub.customerReference ? `Kunde- / abonnementsreferanse: ${sub.customerReference}\n` : ''}
KRAV OM OPPSIGELSE:
Herved meddeles det formelt at jeg sier opp mitt abonnement på "${sub.name}" (terminbeløp: ${sub.price} kr ${sub.billingCycle === 'yearly' ? 'pr. år' : 'pr. måned'}).

Oppsigelsen gjøres gjeldende med umiddelbar virkning, subsidiært ved utløpet av inneværende forhåndsbetalte periode. 

TILBAKETREKKING AV TREKKFULLMAKT:
Samtidig kaller jeg herved med øyeblikkelig virkning tilbake enhver fullmakt til automatisk betalingstrekk, AvtaleGiro, eFaktura eller belastning av mitt betalingskort (Mastercard/Visa/Vipps) for perioder etter oppsigelsesdatoen. 

JURIDISK GRUNNLAG OG ANSVAR:
Oppsigelsen er basert på forbrukerens alminnelige oppsigelsesrett i henhold til avtaleloven, forbrukerkjøpsloven og angrerettloven § 20. Dersom det likevel foretas trekk etter at dette varsel er meddelt, vil trekket umiddelbart bli krevd tilbakeført og bestridt i henhold til Finansavtalelovens § 2-10 om uautoriserte betalingstransaksjoner.

KRAV OM BEKREFTELSE:
Jeg ber om skriftlig bekreftelse per e-post innen 14 dager på:
1. At oppsigelsen er registrert og endelig bekreftet.
2. Nøyaktig dato for opphør av tjenesten.
3. Bekreftelse på at alle faste trekkordre og kortlagringer er slettet.

Med vennlig hilsen,
${profile.fullName || '[Ditt navn]'}
${profile.email || ''}`;

    setCustomLetter(letter);
  };

  const handleRegenerateWithAi = async () => {
    if (!subscription) return;
    setIsLoadingAi(true);
    try {
      const response = await fetch('/api/subscriptions/generate-cancellation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          customerName: userProfile.fullName,
          customerEmail: userProfile.email,
          customerPhone: userProfile.phone,
          reason: cancellationReason,
        }),
      });
      const data = await response.json();
      if (data.letter) {
        setCustomLetter(data.letter);
      }
    } catch (err) {
      console.error('Feil ved generering av AI-oppsigelse:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    if (!subscription) return;
    const subject = encodeURIComponent(`Formell oppsigelse av abonnement: ${subscription.name} - ${userProfile.fullName}`);
    const body = encodeURIComponent(customLetter);
    const targetEmail = recipientEmail || subscription.supportEmail || '';
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
  };

  if (!isOpen || !subscription) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div
        id="forced-cancellation-modal"
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Tving Oppsigelse: {subscription.name}</h2>
              <p className="text-xs text-slate-400">
                Juridisk bindende oppsigelsesvarsel med krav om stans av trekkfullmakt
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Quick Notice Banner */}
          <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-rose-900 leading-relaxed">
              <strong>Lovfestet rett:</strong> I henhold til norsk forbrukerlovgivning og EU-direktiver kan ingen tjenesteyter nekte deg å si opp et løpende abonnement. Dette brevet tilbakekaller også automatisk trekkfullmakten, slik at banken kan bistå med tilbakeføring om de likevel forsøker å trekke.
            </div>
          </div>

          {/* Form parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mottaker e-post (Kundeservice / Oppsigelse)
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="f.eks. kundeservice@tjeneste.no"
                className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Oppsigelsesgrunn (Valgfritt)
              </label>
              <select
                value={cancellationReason}
                onChange={(e) => {
                  setCancellationReason(e.target.value);
                  generateStandardLetter(subscription, userProfile, e.target.value);
                }}
                className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800"
              >
                <option value="Generell oppsigelse etter eget ønske">Generell oppsigelse etter eget ønske</option>
                <option value="Tjenesten er for kostbar i forhold til nytte">For kostbar i forhold til nytte</option>
                <option value="Uakseptable prisøkninger eller vilkårsendringer">Uakseptable prisøkninger/vilkår</option>
                <option value="Benytter lovfestet 14 dagers angrerett">Angrerett (innenfor 14 dager)</option>
                <option value="Tjenesten fungerer ikke som avtalt">Mangler/feil ved tjenesten</option>
              </select>
            </div>
          </div>

          {/* Action bar for letter generation */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Formell oppsigelsestekst
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRegenerateWithAi}
                disabled={isLoadingAi}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isLoadingAi ? 'Genererer...' : 'Skreddersy med AI'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Kopiert!' : 'Kopier tekst'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
                title="Skriv ut eller lagre som PDF"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Utskrift / PDF</span>
              </button>
            </div>
          </div>

          {/* Letter Editor / Preview */}
          <div className="relative">
            <textarea
              id="cancellation-letter-textarea"
              rows={12}
              value={customLetter}
              onChange={(e) => setCustomLetter(e.target.value)}
              className="w-full font-mono text-xs sm:text-sm p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 leading-relaxed resize-y"
            />
          </div>

          {/* Portal direct links */}
          {subscription.cancellationUrl && (
            <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between text-xs text-slate-700">
              <span className="flex items-center gap-1.5 font-medium">
                <Building className="w-4 h-4 text-slate-500" />
                Har tjenesten en nettportal for oppsigelse?
              </span>
              <a
                href={subscription.cancellationUrl}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 hover:underline"
              >
                <span>Åpne oppsigelsesside</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-5 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Send varselet per e-post eller post, og merk den deretter som oppsagt.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleSendEmail}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 transition shadow-sm"
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>Send e-post nå</span>
            </button>

            <button
              type="button"
              id="confirm-cancellation-btn"
              onClick={() => {
                onConfirmCancellation(subscription.id, customLetter);
                onClose();
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs sm:text-sm font-semibold hover:bg-rose-500 transition shadow-sm"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Merk som formelt oppsagt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
