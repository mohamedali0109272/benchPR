import React, { useMemo, useState } from 'react';
import { Award, Flame, Search, Trophy, User, X } from 'lucide-react';
import { AppLogo } from '../components/AppLogo';
import { useWorkout } from '../context/WorkoutContext';
import { RankingEngine } from '../data/RankingEngine';
import { useI18n } from '../i18n/I18nContext';
import { PublicProfileEntity } from '../types/models';
import { auth } from '../services/firebase';

type LeaderboardCategory = 'bench' | 'squat' | 'deadlift' | 'total';

export const CommunityScreen: React.FC = () => {
  const { t } = useI18n();
  const { communityProfiles, weightUnit } = useWorkout();
  const [category, setCategory] = useState<LeaderboardCategory>('bench');
  const [searchQuery, setSearchQuery] = useState('');

  const currentUserUid = auth.currentUser?.uid;

  const rankedProfiles = useMemo(() => {
    const list = [...communityProfiles];
    return list.sort((a, b) => {
      const getVal = (p: PublicProfileEntity) => {
        switch (category) {
          case 'bench':
            return p.bestBench ?? 0;
          case 'squat':
            return p.bestSquat ?? 0;
          case 'deadlift':
            return p.bestDeadlift ?? 0;
          case 'total':
            return (p.bestBench ?? 0) + (p.bestSquat ?? 0) + (p.bestDeadlift ?? 0);
        }
      };
      return getVal(b) - getVal(a);
    });
  }, [communityProfiles, category]);

  const filteredProfiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rankedProfiles;
    return rankedProfiles.filter((p) =>
      (p.displayName || 'Athlete').toLowerCase().includes(q),
    );
  }, [rankedProfiles, searchQuery]);

  const formatWt = (kgVal?: number) => {
    if (typeof kgVal !== 'number' || kgVal <= 0) return '—';
    const converted = RankingEngine.fromKg(kgVal, weightUnit);
    const rounded = Math.round(converted * 10) / 10;
    return `${rounded} ${weightUnit}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between gap-3 animate-enter">
        <div className="flex items-center gap-2.5">
          <AppLogo className="w-6 h-6 text-[#FF2D55]" />
          <h1 className="text-xl font-black tracking-wide text-[#F0F6FC]">
            {t('COMMUNITY PRs')}
          </h1>
        </div>
        <span className="px-3 py-1 rounded-xl bg-[#131822] border border-white/10 text-xs font-bold font-mono-num text-[#00E5FF]">
          {communityProfiles.length} {t('athletes')}
        </span>
      </div>

      {/* Category Tabs */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-2 animate-enter"
        style={{ animationDelay: '40ms' }}
      >
        {(
          [
            ['bench', 'Bench Press', Trophy],
            ['squat', 'Squat', Award],
            ['deadlift', 'Deadlift', Flame],
            ['total', 'Total SBD', Trophy],
          ] as const
        ).map(([key, label, Icon]) => {
          const active = category === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                active
                  ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF6B8B] text-[#080A0F] border-transparent shadow-[0_0_16px_rgba(255,45,85,0.35)]'
                  : 'bg-[#131822]/90 border-white/10 text-[#8B949E] hover:text-[#F0F6FC] hover:border-white/20'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{t(label)}</span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative animate-enter" style={{ animationDelay: '80ms' }}>
        <Search className="w-4 h-4 text-[#8B949E] absolute top-1/2 -translate-y-1/2 start-4 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('Search athlete...')}
          aria-label={t('Search athlete...')}
          className="w-full ps-11 pe-10 py-3 rounded-xl bg-[#131822] border border-white/10 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#FF2D55] transition-colors"
        />
        {searchQuery.length > 0 && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label={t('Clear search')}
            className="w-7 h-7 rounded-lg absolute top-1/2 -translate-y-1/2 end-2.5 flex items-center justify-center text-[#8B949E] hover:text-[#F0F6FC] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Leaderboard List */}
      {filteredProfiles.length === 0 ? (
        <div className="rounded-2xl bg-[#131822]/90 border border-white/10 py-16 px-6 text-center space-y-2 animate-enter">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1A202D] flex items-center justify-center text-[#6E7681]">
            <Trophy className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-[#8B949E] pt-2">
            {t('No community PRs found')}
          </h2>
          <p className="text-xs text-[#6E7681]">
            {t('Log your workouts to appear on the global leaderboard!')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProfiles.map((profile, idx) => {
            const isMe = profile.uid === currentUserUid;
            const rank = idx + 1;
            const benchVal = formatWt(profile.bestBench);
            const squatVal = formatWt(profile.bestSquat);
            const deadliftVal = formatWt(profile.bestDeadlift);
            const totalKg =
              (profile.bestBench ?? 0) + (profile.bestSquat ?? 0) + (profile.bestDeadlift ?? 0);
            const totalVal = formatWt(totalKg);

            const displayScore =
              category === 'bench'
                ? benchVal
                : category === 'squat'
                  ? squatVal
                  : category === 'deadlift'
                    ? deadliftVal
                    : totalVal;

            return (
              <div
                key={profile.uid}
                className={`rounded-2xl border p-4 sm:p-5 flex items-center justify-between gap-4 transition-all animate-enter ${
                  isMe
                    ? 'bg-[#1A202D] border-[#FF2D55]/60 shadow-[0_0_20px_rgba(255,45,85,0.15)]'
                    : 'bg-[#131822]/90 border-white/10 hover:border-white/20'
                }`}
                style={{ animationDelay: `${Math.min(idx * 30, 240)}ms` }}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-black font-mono-num text-sm flex items-center justify-center shrink-0 ${
                      rank === 1
                        ? 'bg-gradient-to-br from-[#FFC21A] to-[#FFA000] text-[#080A0F] shadow-[0_0_12px_rgba(255,194,26,0.4)]'
                        : rank === 2
                          ? 'bg-gradient-to-br from-[#D5DBE3] to-[#8D939C] text-[#080A0F]'
                          : rank === 3
                            ? 'bg-gradient-to-br from-[#CD7F32] to-[#8C4A15] text-[#080A0F]'
                            : 'bg-[#1A202D] text-[#8B949E] border border-white/10'
                    }`}
                  >
                    #{rank}
                  </div>

                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1A202D] border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                    {profile.photoURL ? (
                      <img
                        src={profile.photoURL}
                        alt={profile.displayName ?? 'Athlete'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-[#8B949E]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-[#F0F6FC] truncate">
                        {profile.displayName || 'Athlete'}
                      </h3>
                      {isMe && (
                        <span className="px-2 py-0.5 rounded-md bg-[#FF2D55]/20 text-[#FF6B8B] text-[10px] font-extrabold uppercase">
                          {t('You')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#8B949E] mt-0.5 font-mono-num">
                      <span>{t('Bench')}: {benchVal}</span>
                      <span>•</span>
                      <span>{t('Squat')}: {squatVal}</span>
                      <span>•</span>
                      <span>{t('Deadlift')}: {deadliftVal}</span>
                    </div>
                  </div>
                </div>

                <div className="text-end shrink-0 ps-2">
                  <div className="text-base sm:text-lg font-black font-mono-num text-[#00E5FF]">
                    {displayScore}
                  </div>
                  <div className="text-[10px] font-bold text-[#6E7681] uppercase tracking-wider">
                    {t(category === 'total' ? 'Total SBD' : category)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
