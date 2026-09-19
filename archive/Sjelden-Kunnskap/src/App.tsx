import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Search,
  BookOpen,
  HelpCircle,
  Compass,
  Bookmark,
  Heart,
  Share2,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Award,
  Send,
  Loader2,
  RotateCcw,
  Eye,
  SlidersHorizontal,
  Flame,
  ThumbsUp,
  FileText,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import {
  Category,
  RareFact,
  Mystery,
  QuizQuestion,
  TopicProposal,
  TopicDossier,
  UserStats,
} from './types';
import { INITIAL_FACTS } from './data/mockFacts';
import { INITIAL_MYSTERIES } from './data/mockMysteries';
import { INITIAL_QUIZ_QUESTIONS } from './data/mockQuizzes';
import { INITIAL_PROPOSALS } from './data/mockProposals';
import {
  AstrolabeIllustration,
  CabinetTipIllustration,
  CipherTipIllustration,
  ManuscriptTipIllustration,
} from './components/TipIllustrations';
import { ShareMysteryModal } from './components/ShareMysteryModal';
import {
  generateSecureMysteryShareUrl,
  copyTextSafelyToClipboard,
  sanitizeMysteryId,
} from './utils/security';
import { motion } from 'motion/react';
import { SearchLogAndChart, SearchLogItem } from './components/SearchLogAndChart';

type ActiveTab = 'dashboard' | 'library' | 'quiz' | 'mysteries' | 'proposals';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Alle');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);

  // Core Data State
  const [facts, setFacts] = useState<RareFact[]>(INITIAL_FACTS);
  const [mysteries] = useState<Mystery[]>(INITIAL_MYSTERIES);
  const [quizzes] = useState<QuizQuestion[]>(INITIAL_QUIZ_QUESTIONS);
  const [proposals, setProposals] = useState<TopicProposal[]>(INITIAL_PROPOSALS);

  // Selected Detail Modals / Views
  const [activeFactModal, setActiveFactModal] = useState<RareFact | null>(null);
  const [activeMysteryId, setActiveMysteryId] = useState<string>(INITIAL_MYSTERIES[0].id);
  const [revealedClues, setRevealedClues] = useState<Record<string, number[]>>({
    voynich: [1],
    antikythera: [1],
    'mary-celeste': [1],
  });
  const [mysteryUserTheory, setMysteryUserTheory] = useState<Record<string, string>>({});
  const [mysteryRevealedSolution, setMysteryRevealedSolution] = useState<Record<string, boolean>>({});
  const [mysteryHintLoading, setMysteryHintLoading] = useState(false);
  const [mysteryHintText, setMysteryHintText] = useState<string | null>(null);

  // Quiz State
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Mini-Quiz on Dashboard
  const [miniQuizSelected, setMiniQuizSelected] = useState<number | null>(null);
  const [miniQuizAnswered, setMiniQuizAnswered] = useState(false);

  // User Stats & Local Storage
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('sjelden_kunnskap_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      solvedMysteries: [],
      quizScore: 240,
      quizzesTaken: 4,
      streakDays: 6,
      bookmarkedFactIds: ['fact-1'],
      likedFactIds: ['fact-1', 'fact-3'],
      archiveRank: 'Arkivar',
    };
  });

  useEffect(() => {
    localStorage.setItem('sjelden_kunnskap_stats', JSON.stringify(stats));
  }, [stats]);

  // Topic Proposal Form & AI Generation
  const [proposedTitle, setProposedTitle] = useState('');
  const [proposedCategory, setProposedCategory] = useState('Vitenskap');
  const [proposedDescription, setProposedDescription] = useState('');
  const [isGeneratingDossier, setIsGeneratingDossier] = useState(false);
  const [activeDossierModal, setActiveDossierModal] = useState<TopicDossier | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Social Share & Secure Clipboard State for Dagens Mysterium
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [heroCopied, setHeroCopied] = useState(false);
  const [heroFeedbackToast, setHeroFeedbackToast] = useState<string | null>(null);

  // Deep-linking with strict parameter sanitization & validation
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const mysteryParam = searchParams.get('mystery');
        if (mysteryParam) {
          const sanitizedId = sanitizeMysteryId(mysteryParam);
          const matched = mysteries.find((m) => m.id === sanitizedId);
          if (matched) {
            setActiveMysteryId(matched.id);
          }
        }
      } catch {
        // Safe fallback against malformed query strings
      }
    }
  }, [mysteries]);

  const handleHeroQuickCopy = async (mysteryId: string) => {
    const url = generateSecureMysteryShareUrl(mysteryId);
    const success = await copyTextSafelyToClipboard(url);
    if (success) {
      setHeroCopied(true);
      setHeroFeedbackToast('Sikker permalenke kopiert til utklippstavlen!');
      setTimeout(() => {
        setHeroCopied(false);
        setHeroFeedbackToast(null);
      }, 3000);
    } else {
      // Fallback: open share modal so user can copy or share manually
      setIsShareModalOpen(true);
    }
  };

  // Search History Log state with local persistence & graph metrics
  const [searchLog, setSearchLog] = useState<SearchLogItem[]>(() => {
    try {
      const saved = localStorage.getItem('sjelden_kunnskap_search_log');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      { id: 'log-1', query: 'Voynich-manuskriptet', timestamp: Date.now() - 1000 * 60 * 18, matchCount: 1, category: 'Historie' },
      { id: 'log-2', query: 'Kvantebiologi', timestamp: Date.now() - 1000 * 60 * 65, matchCount: 1, category: 'Vitenskap' },
      { id: 'log-3', query: 'Antikythera', timestamp: Date.now() - 1000 * 60 * 240, matchCount: 1, category: 'Glemte Oppfinnelser' },
      { id: 'log-4', query: 'Bioluminescens', timestamp: Date.now() - 1000 * 60 * 420, matchCount: 1, category: 'Natur & Dypet' },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('sjelden_kunnskap_search_log', JSON.stringify(searchLog));
    } catch {
      // ignore
    }
  }, [searchLog]);

  const handleAddSearchLog = (query: string, cat?: Category) => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;
    const matchCount = facts.filter(
      (f) =>
        f.title.toLowerCase().includes(trimmed.toLowerCase()) ||
        f.summary.toLowerCase().includes(trimmed.toLowerCase())
    ).length;

    setSearchLog((prev) => {
      const filtered = prev.filter((item) => item.query.toLowerCase() !== trimmed.toLowerCase());
      const newItem: SearchLogItem = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        query: trimmed,
        timestamp: Date.now(),
        matchCount,
        category: cat || (selectedCategory === 'Alle' ? 'Vitenskap' : selectedCategory),
      };
      return [newItem, ...filtered].slice(0, 20);
    });
  };

  const handleSelectQuery = (query: string) => {
    setSearchQuery(query);
    setActiveTab('library');
    handleAddSearchLog(query);
  };

  const handleDeleteQuery = (id: string) => {
    setSearchLog((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearLog = () => {
    setSearchLog([]);
  };

  // Handle Likes
  const toggleLikeFact = (factId: string) => {
    const isLiked = stats.likedFactIds.includes(factId);
    setFacts((prev) =>
      prev.map((f) => (f.id === factId ? { ...f, likes: f.likes + (isLiked ? -1 : 1) } : f))
    );
    setStats((prev) => ({
      ...prev,
      likedFactIds: isLiked
        ? prev.likedFactIds.filter((id) => id !== factId)
        : [...prev.likedFactIds, factId],
    }));
  };

  // Handle Bookmarks
  const toggleBookmarkFact = (factId: string) => {
    const isBookmarked = stats.bookmarkedFactIds.includes(factId);
    setStats((prev) => ({
      ...prev,
      bookmarkedFactIds: isBookmarked
        ? prev.bookmarkedFactIds.filter((id) => id !== factId)
        : [...prev.bookmarkedFactIds, factId],
    }));
  };

  // Filtered Facts
  const filteredFacts = useMemo(() => {
    return facts.filter((f) => {
      const matchesCategory = selectedCategory === 'Alle' || f.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.tag.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBookmark = !onlyBookmarked || stats.bookmarkedFactIds.includes(f.id);
      return matchesCategory && matchesSearch && matchesBookmark;
    });
  }, [facts, selectedCategory, searchQuery, onlyBookmarked, stats.bookmarkedFactIds]);

  // Active Mystery
  const activeMystery = useMemo(() => {
    return mysteries.find((m) => m.id === activeMysteryId) || mysteries[0];
  }, [mysteries, activeMysteryId]);

  // Reveal a clue in the active mystery
  const handleRevealClue = (clueNumber: number) => {
    setRevealedClues((prev) => {
      const current = prev[activeMystery.id] || [];
      if (!current.includes(clueNumber)) {
        return {
          ...prev,
          [activeMystery.id]: [...current, clueNumber].sort((a, b) => a - b),
        };
      }
      return prev;
    });
  };

  // Request AI Hint for Mystery
  const handleRequestMysteryHint = async () => {
    setMysteryHintLoading(true);
    setMysteryHintText(null);
    try {
      const res = await fetch('/api/mystery-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mysteryTitle: activeMystery.title,
          currentClues: revealedClues[activeMystery.id] || [1],
          userTheory: mysteryUserTheory[activeMystery.id] || 'Ingen valgt enda',
        }),
      });
      const data = await res.json();
      setMysteryHintText(data.hint || 'Ingen hint tilgjengelig.');
    } catch (e) {
      setMysteryHintText(
        'Observér detaljene i de fysiske bevisene. Det uforklarlige har ofte et naturlig opphav som ble oversett i panikken.'
      );
    } finally {
      setMysteryHintLoading(false);
    }
  };

  // Submit Community Proposal & Generate AI Dossier
  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposedTitle.trim()) return;

    setIsGeneratingDossier(true);
    try {
      const res = await fetch('/api/explore-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: proposedTitle,
          category: proposedCategory,
        }),
      });
      const dossier: TopicDossier = await res.json();

      const newProposal: TopicProposal = {
        id: `prop-${Date.now()}`,
        title: proposedTitle,
        description:
          proposedDescription ||
          `En kuratert dypdykking i ukjente og obskure sider ved ${proposedTitle}.`,
        category: proposedCategory,
        author: 'Arkivar Jensen (Deg)',
        votes: 1,
        status: 'avdekket',
        createdAt: new Date().toISOString().split('T')[0],
        dossier: dossier,
      };

      setProposals((prev) => [newProposal, ...prev]);
      setActiveDossierModal(dossier);
      setProposedTitle('');
      setProposedDescription('');
      setFeedbackMessage('Tema registrert og arkiv-dossier ble generert!');
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setFeedbackMessage('Kunne ikke generere dossier, men forslaget er sendt til kuratorene.');
    } finally {
      setIsGeneratingDossier(false);
    }
  };

  // Handle Proposal Vote
  const handleVoteProposal = (propId: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === propId ? { ...p, votes: p.votes + 1 } : p))
    );
  };

  // Handle Main Quiz Selection
  const handleQuizAnswer = (index: number) => {
    if (hasSubmittedAnswer) return;
    setSelectedAnswerIndex(index);
    setHasSubmittedAnswer(true);

    const isCorrect = index === quizzes[currentQuizIndex].correctAnswerIndex;
    if (isCorrect) {
      setQuizScore((prev) => prev + 100);
      setStats((prev) => ({
        ...prev,
        quizScore: prev.quizScore + 100,
      }));
    }
  };

  const handleNextQuiz = () => {
    setSelectedAnswerIndex(null);
    setHasSubmittedAnswer(false);
    setCurrentQuizIndex((prev) => (prev + 1) % quizzes.length);
  };

  // Daily Featured Fact (first one)
  const dailyFact = facts[0];

  return (
    <div
      id="app-root"
      className="flex flex-col h-screen w-full bg-[#0F1115] text-[#E0E2E6] font-sans overflow-hidden select-none"
    >
      {/* =========================================================================
          TOP NAVBAR - Matches Professional Polish Design
      ========================================================================= */}
      <header
        id="app-topbar"
        className="flex items-center justify-between px-6 h-16 border-b border-[#2D3139] bg-[#16181D] z-20 shrink-0"
      >
        {/* Brand */}
        <div
          id="brand-logo-button"
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-gradient-to-tr from-[#D4AF37] to-[#F2D06B] rounded-sm flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
            <span className="text-[#0F1115] font-bold text-lg leading-none">S</span>
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight uppercase">
              Sjelden <span className="text-[#D4AF37]">Kunnskap</span>
            </span>
          </div>
        </div>

        {/* Search Bar & Global Controls */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab === 'dashboard' && e.target.value.trim().length > 0) {
                  setActiveTab('library');
                }
              }}
              placeholder="Finn obskure fakta, mysterier, arkiv..."
              className="pl-9 pr-4 py-1.5 bg-[#1C1E24] border border-[#2D3139] rounded-full text-sm text-[#E0E2E6] placeholder-gray-500 w-72 focus:outline-none focus:border-[#D4AF37] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* User Profile / Status in Archival hierarchy */}
          <div className="flex items-center gap-3 border-l border-[#2D3139] pl-6">
            <div className="text-right hidden sm:block">
              <div className="flex items-center gap-1 justify-end">
                <Flame className="w-3 h-3 text-[#D4AF37]" />
                <span className="text-xs font-semibold text-gray-400">
                  {stats.streakDays} dager streak
                </span>
              </div>
              <p className="text-xs font-bold text-[#E0E2E6] tracking-wide">
                Nivå 14 · {stats.archiveRank} Jensen
              </p>
            </div>
            <div
              id="user-avatar-badge"
              className="w-9 h-9 rounded-full bg-[#2D3139] border border-[#D4AF37] flex items-center justify-center text-xs font-bold text-[#D4AF37] shadow-inner"
              title="Arkivar Jensen - Rangering: Mester"
            >
              AJ
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN CONTAINER WITH SIDEBAR & CONTENT AREA
      ========================================================================= */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR NAVIGATION - Exactly matching theme structure */}
        <aside
          id="app-sidebar"
          className="w-60 border-r border-[#2D3139] bg-[#111318] p-4 flex flex-col gap-2 shrink-0 select-none overflow-y-auto"
        >
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 py-1">
            Navigasjon
          </div>

          <button
            id="tab-btn-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors text-left ${
              activeTab === 'dashboard'
                ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-[#D4AF37]'
                : 'hover:bg-[#1C1E24] text-gray-400 hover:text-[#E0E2E6]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Dashbord</span>
          </button>

          <button
            id="tab-btn-library"
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors text-left ${
              activeTab === 'library'
                ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-[#D4AF37]'
                : 'hover:bg-[#1C1E24] text-gray-400 hover:text-[#E0E2E6]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Biblioteket</span>
            <span className="ml-auto text-[10px] bg-[#2D3139] px-1.5 py-0.5 rounded text-gray-400">
              {facts.length}
            </span>
          </button>

          <button
            id="tab-btn-quiz"
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors text-left ${
              activeTab === 'quiz'
                ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-[#D4AF37]'
                : 'hover:bg-[#1C1E24] text-gray-400 hover:text-[#E0E2E6]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Quiz-arena</span>
            <span className="ml-auto text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-1.5 py-0.5 rounded font-mono">
              {stats.quizScore}p
            </span>
          </button>

          <button
            id="tab-btn-mysteries"
            onClick={() => setActiveTab('mysteries')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors text-left ${
              activeTab === 'mysteries'
                ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-[#D4AF37]'
                : 'hover:bg-[#1C1E24] text-gray-400 hover:text-[#E0E2E6]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Globale Mysterier</span>
            <span className="ml-auto text-[10px] bg-red-950/60 text-red-400 border border-red-800/40 px-1.5 py-0.5 rounded">
              3 åpne
            </span>
          </button>

          <button
            id="tab-btn-proposals"
            onClick={() => setActiveTab('proposals')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors text-left ${
              activeTab === 'proposals'
                ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-[#D4AF37]'
                : 'hover:bg-[#1C1E24] text-gray-400 hover:text-[#E0E2E6]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Foreslå & AI-Dossier</span>
          </button>

          {/* Bottom Card for Topic Contribution */}
          <div className="mt-auto border-t border-[#2D3139] pt-4">
            <div className="p-4 bg-gradient-to-b from-[#1C1E24] to-transparent rounded-lg border border-[#2D3139]">
              <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" /> Ditt bidrag
              </p>
              <p className="text-[11px] leading-relaxed text-gray-400 mb-3">
                Har du funnet et obskurt fenomen verden ikke vet om? Få generert et komplett
                arkivdossier.
              </p>
              <button
                id="btn-sidebar-propose"
                onClick={() => setActiveTab('proposals')}
                className="w-full py-2 bg-[#D4AF37] hover:bg-[#F2D06B] text-[#0F1115] text-xs font-bold rounded-sm uppercase tracking-wider transition-colors"
              >
                Foreslå Tema
              </button>
            </div>
          </div>
        </aside>

        {/* =========================================================================
            MAIN VIEW CONTENT AREA
        ========================================================================= */}
        <main className="flex-1 overflow-y-auto bg-[#0F1115] p-6">
          {/* =====================================================================
              VIEW: DASHBOARD (Matches the Professional Polish layout)
          ===================================================================== */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto">
              {/* Left 8 columns: Hero Spotlight + 2-col Split Widget */}
              <section className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                {/* HERO SPOTLIGHT: Dagens Mysterium */}
                <motion.div
                  id="dashboard-mystery-hero"
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="relative h-88 rounded-xl overflow-hidden border border-[#2D3139] hover:border-[#D4AF37]/50 group shadow-2xl bg-gradient-to-br from-[#16181D] via-[#111318] to-[#0A0B0E] transition-colors"
                >
                  {/* Decorative background texture simulating an ancient codex */}
                  <div
                    className="absolute inset-0 bg-cover bg-center grayscale opacity-25 mix-blend-overlay transition-transform duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at center, #D4AF37 1px, transparent 1px), radial-gradient(circle at 20px 20px, #2D3139 1px, transparent 1px)',
                      backgroundSize: '24px 24px',
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-[#0F1115]/80 to-transparent" />

                  {/* Atmospheric Vector Cipher Watermark */}
                  <div className="absolute top-4 right-28 opacity-15 pointer-events-none hidden sm:block">
                    <CipherTipIllustration size={180} />
                  </div>

                  {/* Corner archival seal & quick share */}
                  <div className="absolute top-6 right-6 border border-[#D4AF37]/30 bg-[#16181D]/80 backdrop-blur px-3 py-1.5 rounded-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest text-gray-300 font-mono">
                      Aktiv Sak · {activeMystery.era}
                    </span>
                    <span className="text-[#2D3139]">|</span>
                    <button
                      id="hero-corner-share-btn"
                      onClick={() => setIsShareModalOpen(true)}
                      title="Del på sosiale medier eller kopier permalenke"
                      className="text-gray-400 hover:text-[#D4AF37] transition-colors p-0.5 cursor-pointer flex items-center gap-1 text-[10px] uppercase tracking-wider"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span className="hidden sm:inline">Del</span>
                    </button>
                  </div>

                  {/* Content in bottom of Hero */}
                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <div className="flex flex-wrap items-center gap-2.5 mb-3">
                      <div className="inline-block px-3 py-1 bg-[#D4AF37] text-[#0F1115] text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
                        Dagens Mysterium
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded font-mono">
                        <ShieldCheck className="w-3 h-3" /> Verifisert Permalenke
                      </span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-serif italic text-white mb-2 tracking-tight">
                      {activeMystery.title}
                    </h2>
                    <p className="text-gray-300 max-w-xl text-sm leading-relaxed mb-6 line-clamp-3">
                      {activeMystery.brief}
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        id="hero-start-decoding-btn"
                        onClick={() => setActiveTab('mysteries')}
                        className="px-6 sm:px-8 py-3 bg-white hover:bg-[#D4AF37] text-[#0F1115] font-bold text-xs uppercase tracking-widest rounded-sm transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4" />
                        Begynn Dekoding
                      </button>

                      {/* SOCIAL MEDIA SHARE BUTTON */}
                      <button
                        id="hero-social-share-btn"
                        onClick={() => setIsShareModalOpen(true)}
                        className="px-5 py-3 bg-[#1C1E24] hover:bg-[#2D3139] border border-[#2D3139] hover:border-[#D4AF37]/60 text-gray-200 hover:text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-all flex items-center gap-2 cursor-pointer shadow-md group"
                        title="Del mysteriet på sosiale medier (X, Facebook, LinkedIn, WhatsApp, E-post)"
                      >
                        <Share2 className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                        Del Sak
                      </button>

                      {/* QUICK CLIPBOARD COPY BUTTON WITH SAFE FALLBACK */}
                      <button
                        id="hero-copy-mystery-link-btn"
                        onClick={() => handleHeroQuickCopy(activeMystery.id)}
                        className={`px-4 py-3 rounded-sm border text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                          heroCopied
                            ? 'bg-emerald-900/80 border-emerald-500 text-emerald-200'
                            : 'bg-[#16181D]/90 hover:bg-[#1C1E24] border-[#2D3139] hover:border-[#D4AF37]/40 text-gray-300 hover:text-white'
                        }`}
                        title="Kopier sikker permalenke til utklippstavlen"
                      >
                        {heroCopied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            Lenke Kopiert!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-[#D4AF37]" />
                            Kopier Lenke
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          const nextIdx =
                            (mysteries.findIndex((m) => m.id === activeMysteryId) + 1) %
                            mysteries.length;
                          setActiveMysteryId(mysteries[nextIdx].id);
                        }}
                        className="px-4 py-3 bg-[#1C1E24] hover:bg-[#2D3139] text-gray-300 text-xs font-semibold uppercase tracking-wider rounded-sm border border-[#2D3139] transition-colors cursor-pointer"
                      >
                        Vis Neste Sak ({activeMysteryId === 'voynich' ? 'Antikythera' : 'Mary Celeste'})
                      </button>
                    </div>

                    {/* Quick Toast Notification */}
                    {heroFeedbackToast && (
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-950/90 border border-emerald-700/80 rounded text-xs text-emerald-300 font-sans shadow-lg animate-fadeIn">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        {heroFeedbackToast}
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* 2-Column Split: Interaktiv Quiz & Dagens Visste-du-at */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                  {/* CARD 1: Interaktiv Quiz Box */}
                  <motion.div
                    id="dash-interactive-quiz-card"
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="bg-[#16181D] border border-[#2D3139] hover:border-[#D4AF37]/60 p-5 rounded-xl flex flex-col justify-between shadow-lg transition-colors"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-[#D4AF37] flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
                          Interaktiv Quiz
                        </h3>
                        <span className="text-[10px] bg-[#2D3139] px-2 py-0.5 rounded text-gray-300 font-mono">
                          Nivå: Ekspert
                        </span>
                      </div>

                      <p className="text-base font-serif mb-4 text-[#E0E2E6] leading-snug">
                        {quizzes[0].question}
                      </p>

                      <div className="space-y-2 mb-4">
                        {quizzes[0].options.slice(0, 3).map((opt, idx) => {
                          const isCorrect = idx === quizzes[0].correctAnswerIndex;
                          const isChosen = miniQuizSelected === idx;
                          let btnStyle =
                            'bg-[#1C1E24] border-[#2D3139] text-gray-300 hover:border-[#D4AF37]';
                          if (miniQuizAnswered) {
                            if (isCorrect) {
                              btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200';
                            } else if (isChosen) {
                              btnStyle = 'bg-red-950/60 border-red-500 text-red-200';
                            }
                          }
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                if (!miniQuizAnswered) {
                                  setMiniQuizSelected(idx);
                                  setMiniQuizAnswered(true);
                                  if (isCorrect) {
                                    setStats((prev) => ({
                                      ...prev,
                                      quizScore: prev.quizScore + 50,
                                    }));
                                  }
                                }
                              }}
                              className={`w-full p-3 border text-sm text-left rounded-sm transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {miniQuizAnswered && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              )}
                              {miniQuizAnswered && isChosen && !isCorrect && (
                                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {miniQuizAnswered ? (
                      <div className="pt-2 border-t border-[#2D3139] text-xs text-gray-400">
                        <p className="line-clamp-2 text-gray-300 italic mb-2">
                          {quizzes[0].explanation}
                        </p>
                        <button
                          onClick={() => setActiveTab('quiz')}
                          className="text-[#D4AF37] hover:underline text-xs font-semibold flex items-center gap-1"
                        >
                          Ta hele quizen i Quiz-arenaen <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-500 text-right">
                        Velg et alternativ for umiddelbar verifisering
                      </div>
                    )}
                  </motion.div>

                  {/* CARD 2: Visste du at? */}
                  <motion.div
                    id="dash-did-you-know-card"
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="bg-[#16181D] border border-[#2D3139] hover:border-[#D4AF37]/60 p-5 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-lg transition-colors"
                  >
                    <div className="absolute -right-4 -bottom-4 w-28 h-28 border-4 border-[#D4AF37]/10 rounded-full pointer-events-none" />

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-[#D4AF37] flex items-center gap-2">
                          <Flame className="w-4 h-4 text-[#D4AF37]" />
                          Visste du at?
                        </h3>
                        <span className="text-[10px] bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded font-mono">
                          {dailyFact.rarityScore}% Sjeldenhet
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 mb-3 italic">
                        &quot;Verden er merkeligere enn vi kan forestille oss.&quot;
                      </p>

                      <div className="bg-[#0F1115] p-4 border-l-2 border-[#D4AF37] rounded-r-md mb-4">
                        <h4 className="font-serif font-bold text-sm text-white mb-1">
                          {dailyFact.title}
                        </h4>
                        <p className="text-xs leading-relaxed text-gray-300">
                          {dailyFact.summary}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#2D3139]/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1.5">
                          <div className="w-6 h-6 rounded-full bg-amber-700 border border-[#16181D] flex items-center justify-center text-[9px] font-bold text-white">
                            K
                          </div>
                          <div className="w-6 h-6 rounded-full bg-indigo-700 border border-[#16181D] flex items-center justify-center text-[9px] font-bold text-white">
                            M
                          </div>
                          <div className="w-6 h-6 rounded-full bg-emerald-700 border border-[#16181D] flex items-center justify-center text-[9px] font-bold text-white">
                            A
                          </div>
                        </div>
                        <span className="text-[11px] text-gray-400">
                          +{dailyFact.likes} lærte dette i dag
                        </span>
                      </div>

                      <button
                        onClick={() => setActiveFactModal(dailyFact)}
                        className="text-xs font-bold text-[#D4AF37] hover:text-[#F2D06B] flex items-center gap-1"
                      >
                        Les arkivnotat <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* Right 4 columns: Kunnskapshull + Premium Medlemskap / Archive Milestone */}
              <section className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                {/* Kunnskapshull: Trender i det ukjente */}
                <motion.div
                  id="dashboard-knowledge-gaps-card"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="bg-[#16181D] border border-[#2D3139] hover:border-[#D4AF37]/60 rounded-xl flex-1 flex flex-col shadow-lg transition-colors"
                >
                  <div className="p-5 border-b border-[#2D3139] flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-widest text-[#D4AF37]">
                        Kunnskapshull
                      </h3>
                      <p className="text-xs text-gray-500">Trender i det ukjente</p>
                    </div>
                    <span className="text-[10px] bg-[#1C1E24] border border-[#2D3139] text-gray-400 px-2 py-1 rounded">
                      Live Telemetri
                    </span>
                  </div>

                  <div className="p-5 space-y-5">
                    {/* Bar 1 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-300 font-medium">Kvantebiologi</span>
                        <span className="text-[#D4AF37] font-mono font-semibold">
                          88% uutforsket
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#2D3139] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#B8962B] to-[#D4AF37] rounded-full"
                          style={{ width: '88%' }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-500">
                        Fotosyntetisk superposisjon og fuglers magnetiske kryptokromer.
                      </p>
                    </div>

                    {/* Bar 2 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-300 font-medium">Dypvannsarkeologi</span>
                        <span className="text-[#D4AF37] font-mono font-semibold">
                          95% uutforsket
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#2D3139] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#B8962B] to-[#D4AF37] rounded-full"
                          style={{ width: '95%' }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-500">
                        Hadal-sonens bunnsedimenter og forliste bronsealder-flåter.
                      </p>
                    </div>

                    {/* Bar 3 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-300 font-medium">Glemte Språk & Ciffere</span>
                        <span className="text-[#D4AF37] font-mono font-semibold">
                          72% uutforsket
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#2D3139] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#B8962B] to-[#D4AF37] rounded-full"
                          style={{ width: '72%' }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-500">
                        Lineær A, Rongorongo-tavlene og Voynich-ciffere.
                      </p>
                    </div>

                    {/* Bar 4 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-300 font-medium">Uforklarlige Naturfenomener</span>
                        <span className="text-[#D4AF37] font-mono font-semibold">
                          81% uutforsket
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#2D3139] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#B8962B] to-[#D4AF37] rounded-full"
                          style={{ width: '81%' }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-500">
                        Kulelyn, Hessdalsfenomenet og mørk materie-korrelasjoner.
                      </p>
                    </div>
                  </div>

                  {/* Neste milepæl Box */}
                  <div className="mt-auto p-5 border-t border-[#2D3139]">
                    <div className="bg-[#1C1E24] p-4 rounded-lg border border-dashed border-[#2D3139] text-center">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold">
                        Neste Arkiv-Milepæl
                      </p>
                      <p className="text-sm font-semibold text-white">
                        Lås opp: &apos;Vatikanets Hemmeligheter&apos;
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Fullfør 1 mysterium til og 2 quizer for dekoding.
                      </p>
                      <div className="flex justify-center gap-1.5 mt-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#2D3139]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#2D3139]" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* TIP ILLUSTRATION & KURATORTIPS WIDGET */}
                <motion.div
                  id="dashboard-curator-tip-card"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="bg-[#16181D] border border-[#2D3139] rounded-xl p-5 relative overflow-hidden flex items-center gap-4 group hover:border-[#D4AF37]/60 shadow-lg transition-colors"
                >
                  <div className="shrink-0 p-1.5 bg-[#111318] rounded-lg border border-[#2D3139] group-hover:border-[#D4AF37]/40 transition-colors">
                    <AstrolabeIllustration size={72} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-[#D4AF37] font-mono uppercase tracking-widest font-bold">
                        Kuratortips #14 · Tip Illustration
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#E0E2E6] mb-1 font-serif">
                      Utforsk &apos;Dagens Mysterium&apos;
                    </h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                      Arkivets mysterier løses ved å koble obskure fakta fra vitenskap, historie og natur. Hver sjeldenhet du undersøker gir nøkler til tapte kilder.
                    </p>
                  </div>
                </motion.div>

                {/* Arkivets Spesialstatus / Premium-kort fra temaet */}
                <motion.div
                  id="dashboard-membership-card"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="bg-gradient-to-br from-[#D4AF37] to-[#B8962B] p-5 rounded-xl text-[#0F1115] shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2 opacity-10">
                    <Award className="w-20 h-20 text-[#0F1115]" />
                  </div>
                  <h4 className="font-bold text-xs uppercase tracking-wider mb-1">
                    Kuratorkollegiets Arkivtilgang
                  </h4>
                  <p className="text-[12px] leading-snug mb-4 font-medium opacity-95">
                    Få tilgang til eksklusive primærkilder, uutgitte manuskripter og AI-drevet
                    dypdykk i uavklarte historiske anomalier.
                  </p>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-2xl font-black font-serif">49,- </span>
                      <span className="text-xs font-bold opacity-80">/mnd</span>
                    </div>
                    <button
                      onClick={() => {
                        setFeedbackMessage('Du har full tilgang som Mesterarkivar i forhåndsvisningen!');
                        setTimeout(() => setFeedbackMessage(null), 3500);
                      }}
                      className="bg-[#0F1115] hover:bg-black text-white text-xs px-4 py-2 rounded-sm font-bold uppercase tracking-wider transition-colors shadow"
                    >
                      Aktiv Mester
                    </button>
                  </div>
                </motion.div>
              </section>
            </div>
          )}

          {/* =====================================================================
              VIEW: BIBLIOTEKET (Obskure fakta, filter, dypdykk)
          ===================================================================== */}
          {activeTab === 'library' && (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header & Filter Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2D3139] pb-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-[#D4AF37]" />
                    Arkivets Bibliotek
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Dokumenterte sjeldenheter, oversette anomalier og historiske finurligheter.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOnlyBookmarked(!onlyBookmarked)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                      onlyBookmarked
                        ? 'bg-[#D4AF37] text-[#0F1115] border-[#D4AF37]'
                        : 'bg-[#16181D] text-gray-300 border-[#2D3139] hover:border-[#D4AF37]'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    Bokmerker ({stats.bookmarkedFactIds.length})
                  </button>

                  <button
                    onClick={() => {
                      const randomFact = facts[Math.floor(Math.random() * facts.length)];
                      setActiveFactModal(randomFact);
                    }}
                    className="px-3 py-1.5 bg-[#1C1E24] hover:bg-[#2D3139] text-[#D4AF37] border border-[#2D3139] rounded-sm text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Tilfeldig Sjeldenhet
                  </button>
                </div>
              </div>

              {/* Søkelogg & Arkiv-Graf (Recharts Aktivitet og Kategori-fordeling) */}
              <SearchLogAndChart
                searchLog={searchLog}
                onSelectQuery={handleSelectQuery}
                onDeleteQuery={handleDeleteQuery}
                onClearLog={handleClearLog}
                onSelectCategory={(cat) => setSelectedCategory(cat)}
                selectedCategory={selectedCategory}
              />

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {(
                  [
                    'Alle',
                    'Kunst & Kultur',
                    'Vitenskap',
                    'Historie',
                    'Natur & Dypet',
                    'Glemte Oppfinnelser',
                  ] as Category[]
                ).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap rounded-full transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#D4AF37] text-[#0F1115] font-bold shadow'
                        : 'bg-[#16181D] text-gray-400 border border-[#2D3139] hover:text-white hover:border-gray-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Facts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFacts.map((fact) => {
                  const isBookmarked = stats.bookmarkedFactIds.includes(fact.id);
                  const isLiked = stats.likedFactIds.includes(fact.id);

                  return (
                    <motion.article
                      key={fact.id}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="bg-[#16181D] border border-[#2D3139] hover:border-[#D4AF37]/60 rounded-xl p-5 flex flex-col justify-between transition-colors group shadow-md"
                    >
                      <div>
                        {/* Card Header: Category & Rarity Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded">
                            {fact.category}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] font-mono text-amber-300/90 font-semibold bg-[#1C1E24] px-2 py-0.5 rounded border border-[#2D3139]">
                            <span>{fact.rarityScore}%</span>
                            <span className="text-[9px] text-gray-400 font-sans">sjeldenhet</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3
                          onClick={() => setActiveFactModal(fact)}
                          className="font-serif text-lg text-white font-bold mb-2 group-hover:text-[#F2D06B] cursor-pointer transition-colors leading-snug"
                        >
                          {fact.title}
                        </h3>

                        {/* Summary */}
                        <p className="text-xs text-gray-300 leading-relaxed mb-4 line-clamp-3">
                          {fact.summary}
                        </p>

                        {/* Obscure Detail highlight teaser */}
                        {fact.obscureDetails && fact.obscureDetails.length > 0 && (
                          <div className="p-2.5 bg-[#0F1115] border-l-2 border-[#D4AF37] rounded-r text-[11px] text-gray-400 italic mb-4">
                            &quot;{fact.obscureDetails[0]}&quot;
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Meta + Actions */}
                      <div className="pt-3 border-t border-[#2D3139] flex items-center justify-between text-xs">
                        <span className="text-[10px] text-gray-500 font-mono">
                          {fact.readingTimeMin} min lesing · #{fact.tag}
                        </span>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleLikeFact(fact.id)}
                            className={`flex items-center gap-1 text-xs transition-colors ${
                              isLiked ? 'text-rose-400 font-semibold' : 'text-gray-400 hover:text-white'
                            }`}
                            title="Marker som fascinerende"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400' : ''}`}
                            />
                            <span>{fact.likes}</span>
                          </button>

                          <button
                            onClick={() => toggleBookmarkFact(fact.id)}
                            className={`transition-colors ${
                              isBookmarked
                                ? 'text-[#D4AF37]'
                                : 'text-gray-400 hover:text-white'
                            }`}
                            title="Bokmerk for senere"
                          >
                            <Bookmark
                              className={`w-3.5 h-3.5 ${
                                isBookmarked ? 'fill-[#D4AF37]' : ''
                              }`}
                            />
                          </button>

                          <button
                            onClick={() => setActiveFactModal(fact)}
                            className="bg-[#1C1E24] hover:bg-[#D4AF37] hover:text-[#0F1115] text-gray-300 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider border border-[#2D3139] transition-all"
                          >
                            Dypdykk
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>

              {filteredFacts.length === 0 && (
                <div className="text-center py-16 bg-[#16181D] border border-[#2D3139] rounded-xl p-8">
                  <HelpCircle className="w-12 h-12 text-[#D4AF37] mx-auto mb-3 opacity-60" />
                  <h3 className="text-base font-bold text-white mb-1">
                    Ingen sjeldenheter funnet for dette søket
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">
                    Prøv å endre søkeord eller tilbakestill kategorifiltrene.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('Alle');
                      setOnlyBookmarked(false);
                    }}
                    className="px-4 py-2 bg-[#D4AF37] text-[#0F1115] text-xs font-bold rounded-sm uppercase tracking-wider"
                  >
                    Tilbakestill filtre
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              VIEW: QUIZ-ARENA (Flervalgsquiz med arkivvurdering og umiddelbar feedback)
          ===================================================================== */}
          {activeTab === 'quiz' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between border-b border-[#2D3139] pb-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-2">
                    <HelpCircle className="w-6 h-6 text-[#D4AF37]" />
                    Arkivets Quiz-arena
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Test din evne til å skille historiske sannheter fra myter og forglemmelser.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block">
                    Total Arkivpoengsum
                  </span>
                  <span className="text-xl font-mono font-bold text-[#D4AF37]">
                    {stats.quizScore} Pts
                  </span>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  Spørsmål {currentQuizIndex + 1} av {quizzes.length}
                </span>
                <span className="text-[10px] bg-[#1C1E24] border border-[#2D3139] px-2 py-0.5 rounded text-[#D4AF37] font-semibold">
                  Vanskelighetsgrad: {quizzes[currentQuizIndex].difficulty}
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#1C1E24] rounded-full overflow-hidden border border-[#2D3139]">
                <div
                  className="h-full bg-gradient-to-r from-[#B8962B] to-[#D4AF37] transition-all duration-300"
                  style={{
                    width: `${((currentQuizIndex + 1) / quizzes.length) * 100}%`,
                  }}
                />
              </div>

              {/* Question Card */}
              <div className="bg-[#16181D] border border-[#2D3139] p-6 sm:p-8 rounded-xl shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded">
                    {quizzes[currentQuizIndex].category}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">+100 poeng ved suksess</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-serif text-white leading-relaxed">
                  {quizzes[currentQuizIndex].question}
                </h3>

                {/* Options */}
                <div className="space-y-3">
                  {quizzes[currentQuizIndex].options.map((opt, idx) => {
                    const isSelected = selectedAnswerIndex === idx;
                    const isCorrect = idx === quizzes[currentQuizIndex].correctAnswerIndex;

                    let btnClasses =
                      'bg-[#1C1E24] border-[#2D3139] text-gray-200 hover:border-[#D4AF37] hover:bg-[#232730]';

                    if (hasSubmittedAnswer) {
                      if (isCorrect) {
                        btnClasses =
                          'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-medium';
                      } else if (isSelected) {
                        btnClasses = 'bg-red-950/60 border-red-500 text-red-200';
                      } else {
                        btnClasses = 'bg-[#1C1E24] border-[#2D3139] opacity-40 text-gray-400';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={hasSubmittedAnswer}
                        onClick={() => handleQuizAnswer(idx)}
                        className={`w-full p-4 border rounded-sm text-sm sm:text-base text-left transition-all flex items-start justify-between gap-3 ${btnClasses}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#2D3139] text-gray-300 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="leading-snug">{opt}</span>
                        </div>
                        {hasSubmittedAnswer && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        )}
                        {hasSubmittedAnswer && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Card when answered */}
                {hasSubmittedAnswer && (
                  <div className="p-5 bg-[#0F1115] border-l-4 border-[#D4AF37] rounded-r space-y-3 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      {selectedAnswerIndex === quizzes[currentQuizIndex].correctAnswerIndex ? (
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Korrekt avdekket! (+100 poeng)
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Ikke helt, men her er den virkelige
                          historien:
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {quizzes[currentQuizIndex].explanation}
                    </p>
                    <div className="pt-2 border-t border-[#2D3139] text-[11px] text-gray-400">
                      <span className="text-[#D4AF37] font-semibold">Bonusfaktum: </span>
                      {quizzes[currentQuizIndex].bonusDidYouKnow}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={handleNextQuiz}
                        className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F2D06B] text-[#0F1115] text-xs font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-2"
                      >
                        Neste Arkivspørsmål <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =====================================================================
              VIEW: GLOBALE MYSTERIER (Dagens mysterium med spor, AI-hint og teorier)
          ===================================================================== */}
          {activeTab === 'mysteries' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Mystery Navigation Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D3139] pb-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-2">
                    <KeyRound className="w-6 h-6 text-[#D4AF37]" />
                    Globale Mysterier & Glemte Gåter
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Undersøk bevisene, dechiffrer spor og test dine teorier mot historiske fakta.
                  </p>
                </div>

                {/* Switch Mystery Tabs */}
                <div className="flex items-center gap-2 bg-[#16181D] p-1 border border-[#2D3139] rounded-lg">
                  {mysteries.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setActiveMysteryId(m.id);
                        setMysteryHintText(null);
                      }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                        activeMysteryId === m.id
                          ? 'bg-[#D4AF37] text-[#0F1115] font-bold shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {m.id === 'voynich'
                        ? 'Voynich'
                        : m.id === 'antikythera'
                        ? 'Antikythera'
                        : 'Mary Celeste'}
                    </button>
                  ))}
                </div>
              </div>

              {/* EXPLORE DAGENS MYSTERIUM BANNER WITH TIP ILLUSTRATION */}
              <div
                id="explore-daily-mystery-banner"
                className="bg-[#16181D] border border-[#D4AF37]/50 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden"
              >
                <div className="flex items-center gap-5">
                  <div className="shrink-0 p-2 bg-[#111318] rounded-xl border border-[#D4AF37]/30 shadow-inner">
                    <ManuscriptTipIllustration size={80} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 rounded text-[10px] font-mono font-bold uppercase tracking-wider">
                        Tip Illustration · Dyp Læring
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {revealedClues[activeMystery.id]?.length || 1} av {activeMystery.clues.length} spor avdekket
                      </span>
                    </div>
                    <h3 className="text-lg font-serif font-bold text-white mb-1">
                      Utforsk &apos;Dagens Mysterium&apos; gjennom obskure fakta
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed max-w-2xl font-sans">
                      Dette mysteriet kan ikke løses med overflatekunnskap. Utforsk glemte kilder, kjemiske analyser og historiske anomalier i biblioteket for å finne de avgjørende bevisene.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSearchQuery(activeMystery.id === 'voynich' ? 'Voynich' : activeMystery.id === 'antikythera' ? 'Antikythera' : 'Celeste');
                    setActiveTab('library');
                  }}
                  className="px-5 py-3 bg-[#D4AF37] hover:bg-[#F2D06B] text-[#0F1115] font-bold text-xs uppercase tracking-wider rounded-sm transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  Utforsk tilknyttede fakta i Biblioteket
                </button>
              </div>

              {/* Active Mystery Case File */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 8 cols: Brief, Clues, Investigation */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Case Brief Header */}
                  <div className="bg-[#16181D] border border-[#2D3139] p-6 rounded-xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-[#D4AF37] text-[#0F1115] text-[10px] font-bold uppercase tracking-widest rounded-sm">
                          Dagens Hovedsak
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          {activeMystery.location}
                        </span>
                      </div>
                      <span className="text-xs text-amber-300 font-mono bg-[#1C1E24] border border-[#2D3139] px-2.5 py-1 rounded">
                        Status: {activeMystery.status}
                      </span>
                    </div>

                    <h3 className="text-3xl font-serif italic text-white">
                      {activeMystery.title}
                    </h3>
                    <p className="text-xs text-[#D4AF37] font-semibold uppercase tracking-wider">
                      {activeMystery.subtitle}
                    </p>

                    <p className="text-sm text-gray-300 leading-relaxed bg-[#0F1115] p-4 rounded border-l-2 border-[#D4AF37]">
                      {activeMystery.brief}
                    </p>

                    <div className="text-xs text-gray-400 italic">
                      <span className="font-semibold text-gray-300">Arkivarens fotnote: </span>
                      {activeMystery.archiveNotes}
                    </div>
                  </div>

                  {/* Interaktive Spor & Bevismateriale */}
                  <div className="bg-[#16181D] border border-[#2D3139] p-6 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#D4AF37]" />
                        Bevismateriale & Ledetråder ({activeMystery.clues.length})
                      </h4>
                      <span className="text-[11px] text-gray-500">
                        Trykk på et spor for å avdekke skjulte data
                      </span>
                    </div>

                    <div className="space-y-3">
                      {activeMystery.clues.map((clue) => {
                        const isRevealed = (revealedClues[activeMystery.id] || []).includes(
                          clue.number
                        );

                        return (
                          <div
                            key={clue.id}
                            onClick={() => handleRevealClue(clue.number)}
                            className={`p-4 border rounded-sm transition-all cursor-pointer ${
                              isRevealed
                                ? 'bg-[#1C1E24] border-[#D4AF37]/60 shadow'
                                : 'bg-[#0F1115] border-[#2D3139] hover:border-gray-500 opacity-80'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#2D3139] text-[#D4AF37] text-[10px] font-mono font-bold flex items-center justify-center">
                                  #{clue.number}
                                </span>
                                <span className="text-sm font-serif font-bold text-white">
                                  {clue.title}
                                </span>
                              </div>
                              <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-[#2D3139] text-gray-400 rounded">
                                {clue.type}
                              </span>
                            </div>

                            <p className="text-xs text-gray-400 mb-2">{clue.description}</p>

                            {isRevealed ? (
                              <div className="mt-2 pt-2 border-t border-[#2D3139] text-xs text-amber-100/90 leading-relaxed bg-[#0F1115] p-3 rounded">
                                <span className="text-[#D4AF37] font-bold">Avdekket: </span>
                                {clue.revealedText}
                              </div>
                            ) : (
                              <div className="text-[11px] text-[#D4AF37] flex items-center gap-1 font-semibold">
                                <Eye className="w-3 h-3" /> Klikk for å dekode beviset...
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* AI Hint Section */}
                  <div className="bg-[#16181D] border border-[#2D3139] p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                        Står du fast i analysen?
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Konsulter Arkiv-AIen for et kryptisk ledetråd-hint basert på de avdekkede
                        bevisene.
                      </p>
                    </div>

                    <button
                      onClick={handleRequestMysteryHint}
                      disabled={mysteryHintLoading}
                      className="px-4 py-2 bg-[#1C1E24] hover:bg-[#2D3139] text-[#D4AF37] text-xs font-bold uppercase tracking-wider rounded-sm border border-[#2D3139] hover:border-[#D4AF37] transition-all shrink-0 flex items-center gap-2"
                    >
                      {mysteryHintLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Lightbulb className="w-3.5 h-3.5" />
                      )}
                      Be om Arkiv-hint
                    </button>
                  </div>

                  {mysteryHintText && (
                    <div className="p-4 bg-[#0F1115] border-l-4 border-[#D4AF37] rounded-r text-xs sm:text-sm text-gray-300 leading-relaxed animate-fadeIn">
                      <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" /> AI-Arkivarens Ledetråd:
                      </p>
                      &quot;{mysteryHintText}&quot;
                    </div>
                  )}
                </div>

                {/* Right 4 cols: Hypoteser, Stemmegiving, Vitenskapelig Løsning */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Hypoteser & Teorier */}
                  <div className="bg-[#16181D] border border-[#2D3139] p-5 rounded-xl space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                      Fremtredende Hypoteser
                    </h4>
                    <p className="text-xs text-gray-400">
                      Hvilken forklaring anser du som mest sannsynlig?
                    </p>

                    <div className="space-y-3">
                      {activeMystery.theories.map((theory) => {
                        const isChosen = mysteryUserTheory[activeMystery.id] === theory.id;

                        return (
                          <div
                            key={theory.id}
                            onClick={() =>
                              setMysteryUserTheory((prev) => ({
                                ...prev,
                                [activeMystery.id]: theory.id,
                              }))
                            }
                            className={`p-3.5 border rounded-sm cursor-pointer transition-all ${
                              isChosen
                                ? 'bg-[#1C1E24] border-[#D4AF37] text-white shadow'
                                : 'bg-[#0F1115] border-[#2D3139] text-gray-300 hover:border-gray-500'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h5 className="text-xs font-serif font-bold text-white">
                                {theory.title}
                              </h5>
                              <span className="text-[9px] font-mono text-[#D4AF37] shrink-0">
                                {theory.votes} stemmer
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed mb-2">
                              {theory.description}
                            </p>
                            <span className="text-[10px] text-amber-200/80 italic">
                              {theory.scientificConfidence}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Historical resolution trigger */}
                    <div className="pt-2">
                      <button
                        onClick={() =>
                          setMysteryRevealedSolution((prev) => ({
                            ...prev,
                            [activeMystery.id]: !prev[activeMystery.id],
                          }))
                        }
                        className="w-full py-2.5 bg-[#D4AF37] hover:bg-[#F2D06B] text-[#0F1115] text-xs font-bold uppercase tracking-wider rounded-sm transition-colors shadow"
                      >
                        {mysteryRevealedSolution[activeMystery.id]
                          ? 'Skjul Vitenskapelig Løsning'
                          : 'Avslør Vitenskapelig Konsensus'}
                      </button>
                    </div>

                    {mysteryRevealedSolution[activeMystery.id] && (
                      <div className="p-4 bg-[#0F1115] border border-[#D4AF37]/40 rounded text-xs text-gray-300 leading-relaxed space-y-2">
                        <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest block">
                          Moderne Historisk Status:
                        </span>
                        <p>{activeMystery.historicalResolution}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              VIEW: FORESLÅ TEMA & AI-DOSSIER
          ===================================================================== */}
          {activeTab === 'proposals' && (
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="border-b border-[#2D3139] pb-4">
                <h2 className="text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-[#D4AF37]" />
                  Foreslå Tema & Generer AI-Dossier
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Har du et obskurt historisk fenomen eller uutforsket vitenskapelig tema? Send det inn,
                  og la plattformens AI-arkivar umiddelbart sammenstille et dyptgående dossier.
                </p>
              </div>

              {feedbackMessage && (
                <div className="p-4 bg-emerald-950/60 border border-emerald-500/60 rounded text-xs text-emerald-200 flex items-center justify-between">
                  <span>{feedbackMessage}</span>
                  <button
                    onClick={() => setFeedbackMessage(null)}
                    className="text-xs text-emerald-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Proposal Form Card */}
              <div className="bg-[#16181D] border border-[#2D3139] p-6 rounded-xl shadow-xl space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-[#D4AF37]" />
                  Meld inn et kunnskapshull
                </h3>

                <form onSubmit={handleSubmitProposal} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300">
                        Tema / Navn på fenomenet
                      </label>
                      <input
                        type="text"
                        required
                        value={proposedTitle}
                        onChange={(e) => setProposedTitle(e.target.value)}
                        placeholder="f.eks. 'Tanganyika-latterepidemien i 1962' eller 'Kvantebiologi i fugletrekk'"
                        className="w-full px-3.5 py-2 bg-[#1C1E24] border border-[#2D3139] rounded text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300">Kategori</label>
                      <select
                        value={proposedCategory}
                        onChange={(e) => setProposedCategory(e.target.value)}
                        className="w-full px-3.5 py-2 bg-[#1C1E24] border border-[#2D3139] rounded text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                      >
                        <option value="Vitenskap">Vitenskap</option>
                        <option value="Historie">Historie</option>
                        <option value="Kunst & Kultur">Kunst & Kultur</option>
                        <option value="Natur & Dypet">Natur & Dypet</option>
                        <option value="Glemte Oppfinnelser">Glemte Oppfinnelser</option>
                        <option value="Koder & Mystikk">Koder & Mystikk</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">
                      Hva er det du lurer på eller har oppdaget? (Valgfritt)
                    </label>
                    <textarea
                      rows={3}
                      value={proposedDescription}
                      onChange={(e) => setProposedDescription(e.target.value)}
                      placeholder="Beskriv bakgrunnen eller hva som gjør dette spesielt fascinerende..."
                      className="w-full px-3.5 py-2 bg-[#1C1E24] border border-[#2D3139] rounded text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-gray-500">
                      * Genererer umiddelbart et fullverdig arkivdokument via server-side AI.
                    </span>
                    <button
                      type="submit"
                      disabled={isGeneratingDossier || !proposedTitle.trim()}
                      className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F2D06B] text-[#0F1115] text-xs font-bold uppercase tracking-wider rounded-sm transition-all shadow flex items-center gap-2 disabled:opacity-50"
                    >
                      {isGeneratingDossier ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Dekoder arkiver...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Generer Dossier & Send Inn
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Community Proposals List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#D4AF37]">
                    Fellesskapets Foreslåtte Temaer ({proposals.length})
                  </h3>
                  <span className="text-xs text-gray-500">Stem frem dine favoritter</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {proposals.map((prop) => (
                    <div
                      key={prop.id}
                      className="bg-[#16181D] border border-[#2D3139] p-5 rounded-xl flex flex-col justify-between space-y-3 hover:border-gray-500 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded">
                            {prop.category}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {prop.createdAt}
                          </span>
                        </div>

                        <h4 className="font-serif font-bold text-white text-base mb-1">
                          {prop.title}
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {prop.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#2D3139] flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">Av: {prop.author}</span>

                        <div className="flex items-center gap-2">
                          {prop.dossier && (
                            <button
                              onClick={() => setActiveDossierModal(prop.dossier!)}
                              className="px-2.5 py-1 bg-[#1C1E24] hover:bg-[#2D3139] text-[#D4AF37] text-[11px] font-bold rounded uppercase tracking-wider border border-[#2D3139] flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" /> Se Dossier
                            </button>
                          )}

                          <button
                            onClick={() => handleVoteProposal(prop.id)}
                            className="px-2.5 py-1 bg-[#1C1E24] hover:bg-[#2D3139] text-gray-300 hover:text-white text-[11px] font-semibold rounded border border-[#2D3139] flex items-center gap-1"
                          >
                            <ThumbsUp className="w-3 h-3 text-[#D4AF37]" />
                            <span>{prop.votes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          MODAL: FULL FACT DETAIL (Deep Dive Reader)
      ========================================================================= */}
      {activeFactModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setActiveFactModal(null)}
        >
          <div
            className="bg-[#16181D] border border-[#D4AF37]/50 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveFactModal(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white text-lg w-8 h-8 rounded-full bg-[#1C1E24] border border-[#2D3139] flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#D4AF37] text-[#0F1115] text-[10px] font-bold uppercase tracking-widest rounded-sm">
                {activeFactModal.category}
              </span>
              <span className="text-xs font-mono text-amber-300/90 font-semibold bg-[#1C1E24] px-2.5 py-0.5 rounded border border-[#2D3139]">
                {activeFactModal.rarityScore}% Sjeldenhet
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif text-white font-bold leading-tight">
              {activeFactModal.title}
            </h2>

            <div className="p-4 bg-[#0F1115] border-l-2 border-[#D4AF37] rounded-r text-sm text-gray-300 leading-relaxed italic">
              {activeFactModal.summary}
            </div>

            <div className="space-y-4 text-sm text-gray-200 leading-relaxed">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                Den Fullstendige Beretningen
              </h4>
              <p>{activeFactModal.fullStory}</p>
            </div>

            {/* Obscure Details list */}
            {activeFactModal.obscureDetails && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  Avdekkede Kuriositeter
                </h4>
                <ul className="space-y-2">
                  {activeFactModal.obscureDetails.map((detail, idx) => (
                    <li
                      key={idx}
                      className="p-3 bg-[#1C1E24] border border-[#2D3139] rounded text-xs text-gray-300 flex items-start gap-2.5"
                    >
                      <span className="text-[#D4AF37] font-bold mt-0.5">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Source Attribution */}
            <div className="pt-4 border-t border-[#2D3139] flex flex-wrap items-center justify-between text-xs text-gray-400 gap-2">
              <span className="font-mono text-[11px]">Kilde: {activeFactModal.source}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleLikeFact(activeFactModal.id)}
                  className="px-3 py-1 bg-[#1C1E24] hover:bg-[#2D3139] rounded text-xs text-gray-300 flex items-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>{activeFactModal.likes}</span>
                </button>
                <button
                  onClick={() => toggleBookmarkFact(activeFactModal.id)}
                  className="px-3 py-1 bg-[#1C1E24] hover:bg-[#2D3139] rounded text-xs text-gray-300 flex items-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>
                    {stats.bookmarkedFactIds.includes(activeFactModal.id)
                      ? 'Lagret'
                      : 'Bokmerk'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: GENERATED AI DOSSIER DETAIL
      ========================================================================= */}
      {activeDossierModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setActiveDossierModal(null)}
        >
          <div
            className="bg-[#16181D] border border-[#D4AF37] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveDossierModal(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white text-lg w-8 h-8 rounded-full bg-[#1C1E24] border border-[#2D3139] flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#D4AF37] text-[#0F1115] text-[10px] font-bold uppercase tracking-widest rounded-sm">
                Offisielt Arkiv-Dossier
              </span>
              <span className="text-xs font-mono text-[#D4AF37] bg-[#1C1E24] px-2.5 py-0.5 rounded border border-[#2D3139]">
                {activeDossierModal.rarityScore || 94}% Sjeldenhet
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif text-white font-bold">
              {activeDossierModal.title}
            </h2>

            <div className="p-4 bg-[#0F1115] border-l-2 border-[#D4AF37] rounded-r text-sm text-gray-300 leading-relaxed font-serif">
              {activeDossierModal.coreFact}
            </div>

            <div className="space-y-2 text-sm text-gray-300 leading-relaxed">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                Kuratert Historisk Bakgrunn
              </h4>
              <p>{activeDossierModal.detailedStory}</p>
            </div>

            {activeDossierModal.obscureDetails && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  Sentrale Anomalier & Detaljer
                </h4>
                <ul className="space-y-2">
                  {activeDossierModal.obscureDetails.map((det, i) => (
                    <li
                      key={i}
                      className="p-3 bg-[#1C1E24] border border-[#2D3139] rounded text-xs text-gray-300 flex items-start gap-2"
                    >
                      <span className="text-[#D4AF37] font-bold">•</span>
                      <span>{det}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-[#2D3139] text-xs text-gray-500 font-mono">
              Arkivert kildereferanse: {activeDossierModal.source}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: SOCIAL MEDIA SHARE & SECURE LINK FOR DAGENS MYSTERIUM
      ========================================================================= */}
      <ShareMysteryModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        mystery={activeMystery}
      />
    </div>
  );
}
