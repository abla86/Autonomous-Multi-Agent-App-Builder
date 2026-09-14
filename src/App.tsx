/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Ban,
  ArrowUpDown,
  Download,
  RotateCcw,
} from 'lucide-react';
import { Header } from './components/Header';
import { SubscriptionCard } from './components/SubscriptionCard';
import { SavingsSummaryBanner } from './components/SavingsSummaryBanner';
import { ForcedCancellationModal } from './components/ForcedCancellationModal';
import { BankBlockModal } from './components/BankBlockModal';
import { FindSubscriptionsModal } from './components/FindSubscriptionsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { BatchCancelModal } from './components/BatchCancelModal';
import { INITIAL_SUBSCRIPTIONS, CATEGORY_LABELS } from './data/initialSubscriptions';
import {
  Subscription,
  SubscriptionStatus,
  SubscriptionCategory,
  SubscriptionSource,
  UserContactProfile,
} from './types';

const STORAGE_KEY_SUBS = 'abonnementsfinner_subs_v1';
const STORAGE_KEY_PROFILE = 'abonnementsfinner_profile_v1';

export default function App() {
  // Subscriptions state with local persistence
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUBS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Kunne ikke laste lagrede abonnementer:', e);
    }
    return INITIAL_SUBSCRIPTIONS;
  });

  // User Profile state
  const [userProfile, setUserProfile] = useState<UserContactProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Kunne ikke laste brukerprofil:', e);
    }
    return {
      fullName: 'Annebeth Andersen',
      email: 'annebeth.andersen@gmail.com',
      phone: '+47 912 34 567',
      address: 'Oslo, Norge',
    };
  });

  // Save to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SUBS, JSON.stringify(subscriptions));
    } catch (e) {
      console.error('Lagringsfeil:', e);
    }
  }, [subscriptions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(userProfile));
    } catch (e) {
      console.error('Lagringsfeil profil:', e);
    }
  }, [userProfile]);

  // Filtering and sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SubscriptionStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price_desc' | 'price_asc' | 'date' | 'name'>('price_desc');

  // Modals state
  const [isFinderOpen, setIsFinderOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBatchCancelOpen, setIsBatchCancelOpen] = useState(false);
  const [selectedForcedSub, setSelectedForcedSub] = useState<Subscription | null>(null);
  const [selectedBankSub, setSelectedBankSub] = useState<Subscription | null>(null);

  // Status updates
  const handleUpdateStatus = (id: string, newStatus: SubscriptionStatus) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          return { ...sub, status: newStatus };
        }
        return sub;
      })
    );
  };

  // Add new detected or custom subscriptions
  const handleAddSubscriptions = (newSubs: Subscription[]) => {
    setSubscriptions((prev) => {
      // Avoid duplicate names
      const existingNames = new Set(prev.map((s) => s.name.toLowerCase().trim()));
      const filtered = newSubs.filter((n) => !existingNames.has(n.name.toLowerCase().trim()));
      return [...filtered, ...prev];
    });
  };

  // Delete subscription
  const handleDeleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  };

  // Confirm formal cancellation
  const handleConfirmCancellation = (id: string, letter: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          return {
            ...sub,
            status: 'cancelled',
            forcedNoticeSentAt: new Date().toISOString(),
            forcedNoticeLetter: letter,
          };
        }
        return sub;
      })
    );
  };

  // Confirm bank block
  const handleConfirmBankBlock = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          return {
            ...sub,
            status: 'force_blocked',
            bankBlockRequestedAt: new Date().toISOString(),
          };
        }
        return sub;
      })
    );
  };

  // Batch confirm all to_cancel
  const handleBatchConfirmAll = (ids: string[]) => {
    const idSet = new Set(ids);
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (idSet.has(sub.id)) {
          return {
            ...sub,
            status: 'cancelled',
            forcedNoticeSentAt: new Date().toISOString(),
          };
        }
        return sub;
      })
    );
  };

  // Reset to default sample
  const handleResetToDefault = () => {
    if (window.confirm('Vil du tilbakestille listen til eksempelet med norske abonnementer?')) {
      setSubscriptions(INITIAL_SUBSCRIPTIONS);
    }
  };

  // Filtered & sorted subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((sub) => {
        if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
        if (categoryFilter !== 'all' && sub.category !== categoryFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = sub.name.toLowerCase().includes(q);
          const matchNotes = sub.notes?.toLowerCase().includes(q);
          const matchRef = sub.customerReference?.toLowerCase().includes(q);
          if (!matchName && !matchNotes && !matchRef) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'date') return new Date(a.nextRenewalDate).getTime() - new Date(b.nextRenewalDate).getTime();
        return a.name.localeCompare(b.name, 'no');
      });
  }, [subscriptions, statusFilter, categoryFilter, searchQuery, sortBy]);

  // Telemetry counts
  const toCancelSubs = useMemo(() => subscriptions.filter((s) => s.status === 'to_cancel'), [subscriptions]);
  const monthlySavings = useMemo(() => {
    return toCancelSubs.reduce((acc, sub) => {
      if (sub.billingCycle === 'yearly') return acc + Math.round(sub.price / 12);
      if (sub.billingCycle === 'weekly') return acc + Math.round(sub.price * 4.33);
      return acc + sub.price;
    }, 0);
  }, [toCancelSubs]);

  // Export full report to plain text / print
  const handleExportReport = () => {
    const today = new Date().toLocaleDateString('no-NO');
    let text = `ABONNEMENTSOVERSIKT OG OPPSIGELSERAPPORT\nDato: ${today}\nKunde: ${userProfile.fullName} (${userProfile.email})\n\n`;

    text += `OPPSUMMERING:\n`;
    text += `Totalt antall abonnementer: ${subscriptions.length}\n`;
    text += `Merket for oppsigelse: ${toCancelSubs.length} (Månedlig besparelse: ${monthlySavings} kr/mnd)\n\n`;

    text += `1. SKAL AVSLUTTES / OPPSIGELSE PÅTVUNGET:\n`;
    toCancelSubs.forEach((s) => {
      text += `- ${s.name}: ${s.price} kr (${s.billingCycle}) | Ref: ${s.customerReference || 'Ingen'} | Kilde: ${s.source}\n`;
    });

    text += `\n2. SKAL BEHOLDES:\n`;
    subscriptions
      .filter((s) => s.status === 'keep')
      .forEach((s) => {
        text += `- ${s.name}: ${s.price} kr (${s.billingCycle}) | Kilde: ${s.source}\n`;
      });

    text += `\n3. FULLFØRT OPPSAGT / TVANGSSTOPPET:\n`;
    subscriptions
      .filter((s) => s.status === 'cancelled' || s.status === 'force_blocked')
      .forEach((s) => {
        text += `- ${s.name}: ${s.price} kr | Status: ${s.status === 'cancelled' ? 'Formelt oppsagt' : 'Tvangsstoppet i bank'}\n`;
      });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `abonnementer-rapport-${today.replace(/\./g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        subscriptions={subscriptions}
        onOpenFinder={() => setIsFinderOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        userProfile={userProfile}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Savings & Batch Action Banner */}
        <SavingsSummaryBanner
          toCancelCount={toCancelSubs.length}
          monthlySavings={monthlySavings}
          yearlySavings={monthlySavings * 12}
          onBatchForceCancel={() => setIsBatchCancelOpen(true)}
          onExportReport={handleExportReport}
        />

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                id="search-subscriptions-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Søk etter abonnement, referanse eller notat..."
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
              />
            </div>

            {/* Sorting & Reset */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="price_desc">Pris (høyest først)</option>
                  <option value="price_asc">Pris (lavest først)</option>
                  <option value="name">Navn (A-Å)</option>
                  <option value="date">Neste fornyelse</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Alle kategorier</option>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-xs text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition"
                title="Gjenopprett eksempelliste"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Status Decision Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 text-xs no-scrollbar">
            <button
              type="button"
              id="filter-all"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Alle ({subscriptions.length})
            </button>

            <button
              type="button"
              id="filter-keep"
              onClick={() => setStatusFilter('keep')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                statusFilter === 'keep'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Skal beholdes ({subscriptions.filter((s) => s.status === 'keep').length})</span>
            </button>

            <button
              type="button"
              id="filter-cancel"
              onClick={() => setStatusFilter('to_cancel')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                statusFilter === 'to_cancel'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/50'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Skal avsluttes ({subscriptions.filter((s) => s.status === 'to_cancel').length})</span>
            </button>

            <button
              type="button"
              id="filter-completed"
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                statusFilter === 'cancelled'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Fullført oppsagt ({subscriptions.filter((s) => s.status === 'cancelled').length})</span>
            </button>

            <button
              type="button"
              id="filter-bank-blocked"
              onClick={() => setStatusFilter('force_blocked')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                statusFilter === 'force_blocked'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
              }`}
            >
              <Ban className="w-3.5 h-3.5 text-amber-600" />
              <span>Tvangsstoppet i bank ({subscriptions.filter((s) => s.status === 'force_blocked').length})</span>
            </button>
          </div>
        </div>

        {/* Subscriptions Grid */}
        {filteredSubscriptions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Ingen abonnementer matcher filteret</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Prøv å endre søkeordene dine eller tilbakestill status-filteret. Du kan også skanne inn nye abonnementer når som helst.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setCategoryFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition"
              >
                Nullstill filtre
              </button>
              <button
                type="button"
                onClick={() => setIsFinderOpen(true)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition"
              >
                Finn / Skann abonnementer
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredSubscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onUpdateStatus={handleUpdateStatus}
                onOpenForceCancelModal={(sub) => setSelectedForcedSub(sub)}
                onOpenBankBlockModal={(sub) => setSelectedBankSub(sub)}
                onDeleteSubscription={handleDeleteSubscription}
              />
            ))}
          </div>
        )}

        {/* Legal & Consumer Rights Info Section */}
        <section className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Beskyttet av norsk forbrukerkjøpslov, angrerettloven § 20 og Finansavtaleloven § 2-10 (stopp av trekk).
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportReport}
              className="text-slate-600 hover:text-slate-900 font-medium hover:underline flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Last ned juridisk samlerapport</span>
            </button>
          </div>
        </section>
      </main>

      {/* Modals */}
      <ForcedCancellationModal
        subscription={selectedForcedSub}
        userProfile={userProfile}
        isOpen={Boolean(selectedForcedSub)}
        onClose={() => setSelectedForcedSub(null)}
        onConfirmCancellation={handleConfirmCancellation}
      />

      <BankBlockModal
        subscription={selectedBankSub}
        userProfile={userProfile}
        isOpen={Boolean(selectedBankSub)}
        onClose={() => setSelectedBankSub(null)}
        onConfirmBankBlock={handleConfirmBankBlock}
      />

      <FindSubscriptionsModal
        isOpen={isFinderOpen}
        onClose={() => setIsFinderOpen(false)}
        onAddSubscriptions={handleAddSubscriptions}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        onSaveProfile={(updated) => setUserProfile(updated)}
      />

      <BatchCancelModal
        isOpen={isBatchCancelOpen}
        onClose={() => setIsBatchCancelOpen(false)}
        toCancelSubscriptions={toCancelSubs}
        userProfile={userProfile}
        onConfirmAllCancelled={handleBatchConfirmAll}
      />
    </div>
  );
}
