import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { motion } from 'motion/react';
import {
  Search,
  Clock,
  Trash2,
  TrendingUp,
  BarChart3,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Category } from '../types';

export interface SearchLogItem {
  id: string;
  query: string;
  timestamp: number;
  matchCount: number;
  category?: Category | 'Alle';
}

interface SearchLogAndChartProps {
  searchLog: SearchLogItem[];
  onSelectQuery: (query: string) => void;
  onDeleteQuery: (id: string) => void;
  onClearLog: () => void;
  onSelectCategory?: (category: Category) => void;
  selectedCategory?: Category;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Vitenskap': '#D4AF37',
  'Historie': '#F2D06B',
  'Kunst & Kultur': '#E6C665',
  'Natur & Dypet': '#10B981',
  'Glemte Oppfinnelser': '#F59E0B',
  'Alle': '#9CA3AF',
};

export const SearchLogAndChart: React.FC<SearchLogAndChartProps> = ({
  searchLog,
  onSelectQuery,
  onDeleteQuery,
  onClearLog,
  onSelectCategory,
  selectedCategory,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'timeline' | 'categories'>('timeline');
  const [isExpanded, setIsExpanded] = useState(true);

  // Time-based activity data (incorporating actual search log count)
  const timelineData = useMemo(() => {
    const days = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'I dag'];
    const baseSearches = [12, 19, 15, 24, 28, 35, 20];
    const baseDiscoveries = [8, 14, 11, 18, 22, 29, 17];

    // Add extra weight to "I dag" based on user's current session searches
    const todayExtra = Math.min(searchLog.length * 2, 40);

    return days.map((day, idx) => {
      const isToday = idx === days.length - 1;
      return {
        dag: day,
        søk: baseSearches[idx] + (isToday ? todayExtra : 0),
        oppdagelser: baseDiscoveries[idx] + (isToday ? Math.floor(todayExtra * 0.75) : 0),
      };
    });
  }, [searchLog.length]);

  // Category distribution data based on logged searches + baseline
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {
      'Vitenskap': 16,
      'Historie': 22,
      'Natur & Dypet': 14,
      'Kunst & Kultur': 11,
      'Glemte Oppfinnelser': 9,
    };

    // Increment from actual searches in log
    searchLog.forEach((item) => {
      if (item.category && item.category !== 'Alle' && counts[item.category] !== undefined) {
        counts[item.category] += 1;
      }
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      antall: count,
      color: CATEGORY_COLORS[name] || '#D4AF37',
    }));
  }, [searchLog]);

  const formatRelativeTime = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return 'Nettop';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m siden`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}t siden`;
    return 'Tidligere';
  };

  const sampleKeywords = [
    'Voynich',
    'Antikythera',
    'Kvantebiologi',
    'Bioluminescens',
    'Mary Celeste',
    'Alkjemi',
  ];

  return (
    <motion.div
      id="search-log-and-chart-card"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-[#16181D] border border-[#2D3139] hover:border-[#D4AF37]/50 rounded-xl overflow-hidden shadow-xl transition-colors mb-6"
    >
      {/* Header bar with toggle */}
      <div className="p-4 sm:p-5 border-b border-[#2D3139] flex flex-wrap items-center justify-between gap-3 bg-[#111318]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-serif font-bold text-white flex items-center gap-2">
              Søkelogg & Arkivstatistikk
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1C1E24] text-[#D4AF37] border border-[#2D3139]">
                {searchLog.length} oppføringer
              </span>
            </h3>
            <p className="text-[11px] text-gray-400">
              Oversikt over nylige søk og undersøkte temaer i arkivet
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chart View Mode Toggle */}
          <div className="inline-flex rounded-sm bg-[#1C1E24] p-0.5 border border-[#2D3139]">
            <button
              onClick={() => setActiveChartTab('timeline')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeChartTab === 'timeline'
                  ? 'bg-[#D4AF37] text-[#0F1115] font-bold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              Tidslinje
            </button>
            <button
              onClick={() => setActiveChartTab('categories')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeChartTab === 'categories'
                  ? 'bg-[#D4AF37] text-[#0F1115] font-bold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              Kategorier
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#1C1E24] transition-colors cursor-pointer"
            title={isExpanded ? 'Skjul detaljer' : 'Vis detaljer'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 cols: Interactive recharts graph */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                {activeChartTab === 'timeline'
                  ? 'Ukentlig Søke- & Utforskeraktivitet'
                  : 'Søkevolum fordelt på Kategorier'}
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                {activeChartTab === 'timeline' ? 'Siste 7 dager' : 'Aktiv arkivfordeling'}
              </span>
            </div>

            <div className="h-52 w-full bg-[#0F1115] p-3 rounded-lg border border-[#2D3139]">
              <ResponsiveContainer width="100%" height="100%">
                {activeChartTab === 'timeline' ? (
                  <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D3139" opacity={0.5} />
                    <XAxis dataKey="dag" stroke="#6B7280" fontSize={11} tickLine={false} />
                    <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#16181D',
                        borderColor: '#D4AF37',
                        borderRadius: '0.375rem',
                        fontSize: '11px',
                        color: '#E0E2E6',
                      }}
                      labelStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="søk"
                      name="Utførte søk"
                      stroke="#D4AF37"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#goldGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="oppdagelser"
                      name="Nye anomalier avdekket"
                      stroke="#10B981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#emeraldGradient)"
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D3139" opacity={0.5} />
                    <XAxis dataKey="name" stroke="#6B7280" fontSize={10} tickLine={false} />
                    <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#16181D',
                        borderColor: '#D4AF37',
                        borderRadius: '0.375rem',
                        fontSize: '11px',
                        color: '#E0E2E6',
                      }}
                      formatter={(val: number) => [`${val} søk`, 'Interesse']}
                    />
                    <Bar
                      dataKey="antall"
                      name="Søk per kategori"
                      radius={[4, 4, 0, 0]}
                      onClick={(data) => {
                        if (onSelectCategory && data && data.name) {
                          onSelectCategory(data.name as Category);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            selectedCategory === entry.name
                              ? '#F2D06B'
                              : entry.color || '#D4AF37'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2 px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                Søkevolum
                <span className="w-2 h-2 rounded-full bg-emerald-500 ml-2" />
                Avdekkede fakta
              </span>
              <span className="italic text-gray-500 hidden sm:inline">
                {activeChartTab === 'categories'
                  ? 'Klikk på en søyle for å filtrere biblioteket'
                  : 'Oppdateres sanntid i denne økten'}
              </span>
            </div>
          </div>

          {/* Right 5 cols: Søkelogg liste */}
          <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#2D3139] lg:pl-6 pt-4 lg:pt-0">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Nylige Søk
                </span>
                {searchLog.length > 0 && (
                  <button
                    onClick={onClearLog}
                    className="text-[11px] text-gray-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Tøm hele søkeloggen"
                  >
                    <Trash2 className="w-3 h-3" />
                    Tøm logg
                  </button>
                )}
              </div>

              {/* List of recent queries */}
              {searchLog.length === 0 ? (
                <div className="p-4 rounded-lg bg-[#0F1115] border border-[#2D3139] text-center text-xs text-gray-500 space-y-1">
                  <p>Ingen søk registrert i denne økten ennå.</p>
                  <p className="text-[10px] text-gray-600">
                    Søk på temaer i søkefeltet for å bygge opp din logg.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {searchLog.slice(0, 7).map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between p-2 rounded bg-[#0F1115] hover:bg-[#1C1E24] border border-[#2D3139] hover:border-[#D4AF37]/50 transition-all text-xs"
                    >
                      <button
                        onClick={() => onSelectQuery(item.query)}
                        className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
                      >
                        <Search className="w-3 h-3 text-[#D4AF37] shrink-0" />
                        <span className="text-gray-200 font-medium truncate group-hover:text-[#D4AF37] transition-colors">
                          &quot;{item.query}&quot;
                        </span>
                        {item.matchCount > 0 && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-[#16181D] text-gray-400 rounded shrink-0">
                            {item.matchCount} treff
                          </span>
                        )}
                      </button>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-[10px] text-gray-500 font-mono">
                          {formatRelativeTime(item.timestamp)}
                        </span>
                        <button
                          onClick={() => onDeleteQuery(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-rose-400 p-0.5 transition-opacity cursor-pointer"
                          title="Fjern fra søkelogg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick suggested archive searches */}
            <div className="mt-4 pt-3 border-t border-[#2D3139]">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-1.5">
                Foreslåtte Arkivsøk:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sampleKeywords.map((kw) => (
                  <button
                    key={kw}
                    onClick={() => onSelectQuery(kw)}
                    className="px-2 py-0.5 rounded-full bg-[#0F1115] hover:bg-[#D4AF37] text-gray-300 hover:text-[#0F1115] border border-[#2D3139] hover:border-[#D4AF37] text-[10px] transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-[#D4AF37] group-hover:text-[#0F1115]" />
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
