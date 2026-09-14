import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Upload,
  FileText,
  Search,
  Check,
  Plus,
  ArrowRight,
  AlertCircle,
  Building,
  Smartphone,
  CreditCard,
  Layers,
} from 'lucide-react';
import { Subscription, SubscriptionCategory, SubscriptionSource } from '../types';

interface FindSubscriptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubscriptions: (newSubs: Subscription[]) => void;
}

const SAMPLE_STATEMENT_TEXT = `DNB Kontoutskrift - Siste 30 dager - Konto: 1208.34.98124
12.09.2026  VIPPS*VG PLUSS                    -149,00 NOK   (Avtale #984210)
10.09.2026  SATS AS AVTALEGIRO                -749,00 NOK   (Faste trekk)
08.09.2026  SPOTIFY P1092834 STOCKHOLM        -199,00 NOK   (Mastercard 4289)
05.09.2026  APPLE.COM/BILL ITUNES.COM         -39,00 NOK    (iCloud+ 50GB)
03.09.2026  NETFLIX.COM AMSTERDAM             -189,00 NOK   (Korttransaksjon)
01.09.2026  TELENOR NORGE AS MOBIL            -449,00 NOK   (eFaktura)
28.08.2026  PODIMO LYDBØKER APS               -119,00 NOK   (Korttrekk)
25.08.2026  ADOBE SYSTEMS SOFTWARE            -715,00 NOK   (Årsavtale mnd)
22.08.2026  OPENAI *CHATGPT SUBSCRIPTION      -240,00 NOK   (USD 20.00 kurs 12.0)
19.08.2026  VIAPLAY NORGE AS                  -179,00 NOK   (Viaplay Medium)
15.08.2026  REMA 1000 MAJORSTUEN              -482,50 NOK   (Varekjøp)`;

const POPULAR_SERVICES_CATALOG: Array<{
  name: string;
  category: SubscriptionCategory;
  price: number;
  cycle: 'monthly' | 'yearly';
  source: SubscriptionSource;
  cancellationUrl: string;
  supportEmail: string;
}> = [
  {
    name: 'Netflix Standard',
    category: 'streaming',
    price: 159,
    cycle: 'monthly',
    source: 'card_charge',
    cancellationUrl: 'https://www.netflix.com/youraccount',
    supportEmail: 'support@netflix.com',
  },
  {
    name: 'Spotify Premium Individual',
    category: 'music',
    price: 139,
    cycle: 'monthly',
    source: 'card_charge',
    cancellationUrl: 'https://www.spotify.com/account/overview/',
    supportEmail: 'support@spotify.com',
  },
  {
    name: 'TV 2 Play Favoritt',
    category: 'streaming',
    price: 249,
    cycle: 'monthly',
    source: 'card_charge',
    cancellationUrl: 'https://play.tv2.no/konto',
    supportEmail: 'kundeservice@tv2.no',
  },
  {
    name: 'SATS Medlemskap',
    category: 'fitness',
    price: 699,
    cycle: 'monthly',
    source: 'bank_direct_debit',
    cancellationUrl: 'https://www.sats.no/min-side',
    supportEmail: 'kundeservice@sats.no',
  },
  {
    name: 'Apple iCloud+ 200GB',
    category: 'cloud',
    price: 39,
    cycle: 'monthly',
    source: 'apple_app_store',
    cancellationUrl: 'https://support.apple.com/billing',
    supportEmail: 'support@apple.com',
  },
  {
    name: 'YouTube Premium',
    category: 'streaming',
    price: 169,
    cycle: 'monthly',
    source: 'google_play',
    cancellationUrl: 'https://payments.google.com/subscriptions',
    supportEmail: 'support@google.com',
  },
  {
    name: 'VG+ (Schibsted)',
    category: 'news',
    price: 149,
    cycle: 'monthly',
    source: 'vipps',
    cancellationUrl: 'https://minkonto.schibsted.no/',
    supportEmail: 'kundeservice@vg.no',
  },
  {
    name: 'Dagbladet Pluss',
    category: 'news',
    price: 119,
    cycle: 'monthly',
    source: 'card_charge',
    cancellationUrl: 'https://www.dagbladet.no/pluss/minside',
    supportEmail: 'kundeservice@aller.no',
  },
  {
    name: 'Storytel Lydbøker',
    category: 'music',
    price: 189,
    cycle: 'monthly',
    source: 'card_charge',
    cancellationUrl: 'https://www.storytel.com/no/nn/account',
    supportEmail: 'support.no@storytel.com',
  },
  {
    name: 'ChatGPT Plus (OpenAI)',
    category: 'software',
    price: 240,
    cycle: 'monthly',
    source: 'card_charge',
    cancellationUrl: 'https://chatgpt.com/#settings/Subscription',
    supportEmail: 'support@openai.com',
  },
  {
    name: 'Adobe Creative Cloud',
    category: 'software',
    price: 715,
    cycle: 'monthly',
    source: 'card_charge',
    cancellationUrl: 'https://account.adobe.com/plans',
    supportEmail: 'support@adobe.com',
  },
  {
    name: 'Microsoft 365 Personal',
    category: 'software',
    price: 119,
    cycle: 'monthly',
    source: 'card_charge',
    cancellationUrl: 'https://account.microsoft.com/services',
    supportEmail: 'support@microsoft.com',
  },
];

export const FindSubscriptionsModal: React.FC<FindSubscriptionsModalProps> = ({
  isOpen,
  onClose,
  onAddSubscriptions,
}) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'presets' | 'manual'>('scan');

  // Scanner state
  const [inputText, setInputText] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [detectedResults, setDetectedResults] = useState<Subscription[]>([]);
  const [selectedDetectedIds, setSelectedDetectedIds] = useState<Set<string>>(new Set());
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Manual state
  const [manualName, setManualName] = useState('');
  const [manualPrice, setManualPrice] = useState<number>(149);
  const [manualCategory, setManualCategory] = useState<SubscriptionCategory>('streaming');
  const [manualSource, setManualSource] = useState<SubscriptionSource>('card_charge');
  const [manualRenewalDate, setManualRenewalDate] = useState('2026-10-01');
  const [manualSupportEmail, setManualSupportEmail] = useState('');
  const [manualNotes, setManualNotes] = useState('');

  if (!isOpen) return null;

  const handleScanText = async () => {
    if (!inputText.trim()) return;
    setIsScanning(true);
    setScanMessage(null);

    try {
      const res = await fetch('/api/subscriptions/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: inputText }),
      });

      const data = await res.json();
      if (data.subscriptions && Array.isArray(data.subscriptions)) {
        const mapped: Subscription[] = data.subscriptions.map((item: any, idx: number) => ({
          id: `detected-${Date.now()}-${idx}`,
          name: item.name || 'Ukjent abonnement',
          category: (item.category as SubscriptionCategory) || 'other',
          price: Number(item.price) || 99,
          billingCycle: item.billingCycle || 'monthly',
          source: (item.source as SubscriptionSource) || 'card_charge',
          status: 'to_cancel', // Default to suggest cancellation or keep
          nextRenewalDate: '2026-10-01',
          customerReference: item.customerReference || '',
          cancellationUrl: item.cancellationUrl || '',
          supportEmail: item.supportEmail || '',
          cancellationNoticeDays: item.cancellationNoticeDays || 14,
          notes: item.notes || 'Automatisk oppdaget fra utskrift',
          dateDiscovered: new Date().toISOString().split('T')[0],
        }));

        setDetectedResults(mapped);
        setSelectedDetectedIds(new Set(mapped.map((m) => m.id)));
        setScanMessage(`Fant ${mapped.length} abonnementer i teksten!`);
      } else {
        setScanMessage('Fant ingen gjentakende abonnementer i denne teksten.');
      }
    } catch (err) {
      console.error('Feil ved skanning:', err);
      setScanMessage('Det oppstod en feil under skanningen. Vennligst prøv igjen.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleUseSample = () => {
    setInputText(SAMPLE_STATEMENT_TEXT);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleToggleDetectedItem = (id: string) => {
    const next = new Set(selectedDetectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedDetectedIds(next);
  };

  const handleImportDetected = () => {
    const toImport = detectedResults.filter((r) => selectedDetectedIds.has(r.id));
    if (toImport.length > 0) {
      onAddSubscriptions(toImport);
      onClose();
    }
  };

  const handleAddPreset = (preset: (typeof POPULAR_SERVICES_CATALOG)[0]) => {
    const newSub: Subscription = {
      id: `sub-preset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: preset.name,
      category: preset.category,
      price: preset.price,
      billingCycle: preset.cycle,
      source: preset.source,
      status: 'to_cancel',
      nextRenewalDate: '2026-10-01',
      cancellationUrl: preset.cancellationUrl,
      supportEmail: preset.supportEmail,
      cancellationNoticeDays: 14,
      notes: 'Lagt til fra hurtigvelger',
      dateDiscovered: new Date().toISOString().split('T')[0],
    };
    onAddSubscriptions([newSub]);
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    const newSub: Subscription = {
      id: `sub-manual-${Date.now()}`,
      name: manualName,
      category: manualCategory,
      price: Number(manualPrice) || 0,
      billingCycle: 'monthly',
      source: manualSource,
      status: 'to_cancel',
      nextRenewalDate: manualRenewalDate || '2026-10-01',
      supportEmail: manualSupportEmail,
      cancellationNoticeDays: 14,
      notes: manualNotes || 'Manuelt registrert',
      dateDiscovered: new Date().toISOString().split('T')[0],
    };

    onAddSubscriptions([newSub]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div
        id="find-subscriptions-modal"
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Finn alle dine abonnementer</h2>
              <p className="text-xs text-slate-400">
                Skann kontoutskrift, Vipps, Apple/Google-kvitteringer eller velg kjente tjenester
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

        {/* Tabs */}
        <div className="bg-slate-100 px-5 pt-3 border-b border-slate-200 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'scan'
                ? 'bg-white text-slate-900 border-emerald-600'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Smart-skann (Bank & Kvittering)
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'presets'
                ? 'bg-white text-slate-900 border-emerald-600'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              Norske & Populære Tjenester
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'manual'
                ? 'bg-white text-slate-900 border-emerald-600'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-slate-500" />
              Legg til manuelt
            </span>
          </button>
        </div>

        {/* Tab contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* TAB 1: Smart Scan */}
          {activeTab === 'scan' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-emerald-950">
                  <strong>Avansert AI-detektor:</strong> Lim inn transaksjonstekst fra nettbanken din (DNB, SpareBank 1, Nordea, Sbanken), Vipps faste trekk, Apple ID-kvitteringer eller kredittkortfaktura. Systemet finner automatisk gjentakende faste trekk, beløp og oppsigelseskontakt.
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Lim inn kontoutskrift eller transaksjonsliste:
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="use-sample-statement-btn"
                      onClick={handleUseSample}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 hover:bg-emerald-100 transition"
                    >
                      Bruk eksempel-kontoutskrift
                    </button>
                    <label className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 cursor-pointer hover:bg-slate-200 transition">
                      <span>Last opp fil (.txt/.csv)</span>
                      <input
                        type="file"
                        accept=".txt,.csv"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>

                <textarea
                  id="scan-raw-text"
                  rows={6}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Lim inn tekst her, f.eks. '08.09 NETFLIX.COM -189 NOK' eller 'SATS AVTALEGIRO -749 NOK'..."
                  className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  id="run-ai-scan-btn"
                  onClick={handleScanText}
                  disabled={isScanning || !inputText.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-500 disabled:opacity-50 shadow-sm transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isScanning ? 'Analyserer kontoutskrift...' : 'Start AI-skanning'}</span>
                </button>

                {scanMessage && (
                  <span className="text-xs font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                    {scanMessage}
                  </span>
                )}
              </div>

              {/* Scan Results */}
              {detectedResults.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Oppdagede abonnementer ({detectedResults.length}):
                    </h3>
                    <span className="text-xs text-slate-500">
                      Huk av for tjenestene du vil importere
                    </span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {detectedResults.map((item) => {
                      const isChecked = selectedDetectedIds.has(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleDetectedItem(item.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                            isChecked
                              ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400/50'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleDetectedItem(item.id)}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <div>
                              <div className="text-xs sm:text-sm font-bold text-slate-900">
                                {item.name}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {item.notes} • Oppsigelsesfrist: {item.cancellationNoticeDays} dager
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs sm:text-sm font-bold text-slate-900">
                              {item.price} kr
                            </div>
                            <div className="text-[10px] text-slate-500">per måned</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      id="import-detected-btn"
                      onClick={handleImportDetected}
                      disabled={selectedDetectedIds.size === 0}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Importer {selectedDetectedIds.size} valgte abonnementer</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Presets Catalog */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Klikk på tjenestene du abonnerer på for å legge dem direkte til i din oversikt med oppdaterte markedspriser og oppsigelseslenker:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
                {POPULAR_SERVICES_CATALOG.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs flex items-center justify-between transition"
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-500">{item.price} kr / mnd</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddPreset(item)}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white rounded-lg transition text-slate-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Legg til</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Manual Registration */}
          {activeTab === 'manual' && (
            <form onSubmit={handleAddManual} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Abonnementsnavn *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="f.eks. Dagens Næringsliv, Elixia, Fjordkraft"
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pris per termin (NOK) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value as SubscriptionCategory)}
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  >
                    <option value="streaming">Film & Serier (Streaming)</option>
                    <option value="music">Musikk & Lydbøker</option>
                    <option value="software">Programvare & AI</option>
                    <option value="fitness">Trening & Helse</option>
                    <option value="news">Aviser & Nyheter</option>
                    <option value="cloud">Skylagring & Backup</option>
                    <option value="telecom">Mobil & Bredbånd</option>
                    <option value="utility">Strøm & Husholdning</option>
                    <option value="other">Annet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Opprinnelse / Betalingsmåte
                  </label>
                  <select
                    value={manualSource}
                    onChange={(e) => setManualSource(e.target.value as SubscriptionSource)}
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  >
                    <option value="card_charge">Korttrekk (Visa/Mastercard)</option>
                    <option value="bank_direct_debit">AvtaleGiro / Bank direkte</option>
                    <option value="vipps">Vipps faste betalinger</option>
                    <option value="apple_app_store">Apple App Store (iOS)</option>
                    <option value="google_play">Google Play (Android)</option>
                    <option value="klarna">Klarna abonnement</option>
                    <option value="email_invoice">Faktura på e-post</option>
                    <option value="paypal">PayPal</option>
                    <option value="manual">Annet / Ukjent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Neste fornyelsesdato
                  </label>
                  <input
                    type="date"
                    value={manualRenewalDate}
                    onChange={(e) => setManualRenewalDate(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kundeservice e-post (til oppsigelse)
                  </label>
                  <input
                    type="email"
                    value={manualSupportEmail}
                    onChange={(e) => setManualSupportEmail(e.target.value)}
                    placeholder="support@tjeneste.no"
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notater / Referanse
                </label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="f.eks. kundenummer, avtalenotat..."
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 transition"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Opprett abonnement</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
