import React from 'react';
import { Award, Columns3, Dumbbell, Globe, History, List } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { AppRoute } from '../types/models';

interface NavigationShellProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  onOpenLanguage: () => void;
  children: React.ReactNode;
}

interface NavItem {
  route: AppRoute;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { route: 'home', label: 'Workouts', icon: Dumbbell },
  { route: 'splits', label: 'Splits', icon: Columns3 },
  { route: 'muscles', label: 'Muscles', icon: Award },
  { route: 'exercises', label: 'Exercises', icon: List },
  { route: 'history', label: 'History', icon: History },
];

export const NavigationShell: React.FC<NavigationShellProps> = ({
  currentRoute,
  onNavigate,
  onOpenLanguage,
  children,
}) => {
  const { t } = useI18n();
  const isSession = currentRoute === 'session';

  return (
    <div className="min-h-screen flex flex-col bg-[#080A0F] text-[#F0F6FC] relative">
      {/* Subtle atmospheric color accents */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 start-1/4 w-[520px] h-[520px] rounded-full bg-[#FF6D00]/[0.06] blur-[120px]" />
        <div className="absolute top-1/3 -end-32 w-[460px] h-[460px] rounded-full bg-[#00E5FF]/[0.05] blur-[120px]" />
        <div className="absolute -bottom-40 start-1/3 w-[480px] h-[480px] rounded-full bg-[#B26BFF]/[0.05] blur-[120px]" />
      </div>

      {/* Desktop + Mobile Top Header (hidden on active session screen which has its own studio bar) */}
      {!isSession && (
        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#0B0E15]/85 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-8">
            {/* Zone 1: Brand Title */}
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer group"
            >
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6D00] to-[#FF9E40] flex items-center justify-center text-[#080A0F] shadow-[0_0_16px_rgba(255,109,0,0.4)] group-hover:scale-105 transition-transform">
                <Dumbbell className="w-4 h-4 stroke-[2.5]" />
              </span>
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#F0F6FC]">
                {t('BENCH PR TRACKER')}
              </span>
            </button>

            {/* Zone 2: Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              {NAV_ITEMS.map((item) => {
                const active =
                  currentRoute === item.route ||
                  (item.route === 'splits' && currentRoute === 'split-detail');
                const Icon = item.icon;
                return (
                  <button
                    key={item.route}
                    type="button"
                    onClick={() => onNavigate(item.route)}
                    className={`relative flex items-center gap-1.5 py-1.5 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      active ? 'text-[#FF6D00]' : 'text-[#8B949E] hover:text-[#F0F6FC]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t(item.label)}</span>
                    {active && (
                      <span className="absolute -bottom-[19px] inset-x-0 h-[2px] rounded-full bg-gradient-to-r from-[#FF6D00] via-[#FF9E40] to-[#00E5FF]" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Language Switcher */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onOpenLanguage}
                aria-label={t('Language')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161B24] border border-white/10 text-xs font-bold text-[#00E5FF] hover:bg-[#1E2532] hover:border-[#00E5FF]/40 transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{t('Language')}</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`relative z-10 flex-1 ${!isSession ? 'pb-20 md:pb-8' : ''}`}>
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      {!isSession && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-[#0D1119]/95 backdrop-blur-xl">
          <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
            {NAV_ITEMS.map((item) => {
              const active =
                currentRoute === item.route ||
                (item.route === 'splits' && currentRoute === 'split-detail');
              const Icon = item.icon;
              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => onNavigate(item.route)}
                  className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    active ? 'text-[#FF6D00]' : 'text-[#6E7681] hover:text-[#8B949E]'
                  }`}
                >
                  <div
                    className={`px-3 py-1 rounded-full transition-all ${
                      active ? 'bg-[#FF6D00]/15 shadow-[0_0_12px_rgba(255,109,0,0.25)]' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">
                    {t(item.label)}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};
