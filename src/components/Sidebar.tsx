import React from 'react';
import { LayoutDashboard, BookMarked, HelpCircle, Compass, Lightbulb, Bookmark } from 'lucide-react';

export type NavTab = 'dashboard' | 'library' | 'quiz' | 'mysteries' | 'proposals';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenSuggestModal: () => void;
  bookmarkedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenSuggestModal,
  bookmarkedCount,
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashbord', icon: LayoutDashboard },
    { id: 'library' as NavTab, label: 'Biblioteket', icon: BookMarked, badge: bookmarkedCount > 0 ? bookmarkedCount : undefined },
    { id: 'quiz' as NavTab, label: 'Quiz-arena', icon: HelpCircle },
    { id: 'mysteries' as NavTab, label: 'Globale Mysterier', icon: Compass, badge: 'Daglig' },
    { id: 'proposals' as NavTab, label: 'Brukerforslag', icon: Lightbulb },
  ];

  return (
    <aside
      id="main-sidebar"
      className="w-56 border-r border-[#2D3139] bg-[#111318] p-4 flex flex-col gap-2 shrink-0 select-none"
    >
      {/* Navigation links */}
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-md text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-[#D4AF37]/15 text-[#D4AF37] border-l-2 border-[#D4AF37]'
                  : 'text-gray-400 hover:bg-[#1C1E24] hover:text-[#E0E2E6]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-gray-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                  isActive ? 'bg-[#D4AF37] text-[#0F1115]' : 'bg-[#2D3139] text-gray-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick stats note */}
      <div className="mt-6 px-3 py-2 bg-[#16181D]/60 rounded border border-[#2D3139]/50 text-xs text-gray-400">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Dagens kuratorkode
        </p>
        <p className="font-mono text-[11px] text-[#D4AF37]">#VOYNICH-408-B</p>
      </div>

      {/* User contribution card matching the Professional Polish specification */}
      <div className="mt-auto border-t border-[#2D3139] pt-4">
        <div className="p-4 bg-gradient-to-b from-[#1C1E24] to-transparent rounded-lg border border-[#2D3139]">
          <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-[#D4AF37]" />
            Ditt bidrag
          </p>
          <p className="text-[11px] leading-relaxed text-gray-400 mb-3">
            Har du funnet noe verden ikke vet? Del din sjeldenhet eller foreslå et mysterium.
          </p>
          <button
            id="sidebar-propose-topic-btn"
            onClick={onOpenSuggestModal}
            className="w-full py-2 bg-[#D4AF37] hover:bg-[#F2D06B] text-[#0F1115] text-xs font-bold rounded-sm uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
          >
            Foreslå Tema
          </button>
        </div>
      </div>
    </aside>
  );
};
