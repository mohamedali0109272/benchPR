import React, { useMemo, useState } from 'react';
import { Award, Flame, Search, Trophy, User, X, Activity, UserPlus, UserCheck } from 'lucide-react';
import { AppLogo } from '../components/AppLogo';
import { useWorkout } from '../context/WorkoutContext';
import { RankingEngine } from '../data/RankingEngine';
import { useI18n } from '../i18n/I18nContext';
import { PublicProfileEntity } from '../types/models';
import { auth } from '../services/firebase';

type LeaderboardCategory = 'bench' | 'squat' | 'deadlift' | 'total';
type CommunityTab = 'leaderboard' | 'activity';
type ActivityFilter = 'all' | 'following';

export const CommunityScreen: React.FC = () => {
  const { t } = useI18n();
  const { communityProfiles, activities, followingUids, toggleFollow, weightUnit } = useWorkout();
  const [activeTab, setActiveTab] = useState<CommunityTab>('leaderboard');
  const [category, setCategory] = useState<LeaderboardCategory>('bench');
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');

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

  const filteredActivities = useMemo(() => {
    if (activityFilter === 'following') {
      return activities.filter((a) => followingUids.includes(a.uid) || a.uid === currentUserUid);
    }
    return activities;
  }, [activities, activityFilter, followingUids, currentUserUid]);

  const formatWt = (kgVal?: number) => {
    if (typeof kgVal !== 'number' || kgVal <= 0) return '—';
    const converted = RankingEngine.fromKg(kgVal, weightUnit);
    const rounded = Math.round(converted * 10) / 10;
    return `${rounded} ${weightUnit}`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return t('Just now');
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${t('ago')}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ${t('ago')}`;
    const days = Math.floor(hours / 24);
    return `${days}d ${t('ago')}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Title & Main Nav Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-enter">
        <div className="flex items-center gap-2.5">
          <AppLogo className="w-6 h-6 text-[#FF2D55]" />
          <h1 className="text-xl font-black tracking-wide text-[#F0F6FC]">
            {t('COMMUNITY')}
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-[#131822] p-1 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF6B8B] text-[#080A0F] shadow-[0_0_12px_rgba(255,45,85,0.3)]'
                : 'text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>{t('Leaderboard')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'activity'
                ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF6B8B] text-[#080A0F] shadow-[0_0_12px_rgba(255,45,85,0.3)]'
                : 'text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{t('Activity Feed')}</span>
          </button>
        </div>
      </div>

      {activeTab === 'leaderboard' ? (
        <>
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
                const isFollowing = followingUids.includes(profile.uid);

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
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-[#F0F6FC] truncate">
                            {profile.displayName || 'Athlete'}
                          </h3>
                          {isMe && (
                            <span className="px-2 py-0.5 rounded-md bg-[#FF2D55]/20 text-[#FF6B8B] text-[10px] font-extrabold uppercase">
                              {t('You')}
                            </span>
                          )}
                          {!isMe && (
                            <button
                              type="button"
                              onClick={() => toggleFollow(profile.uid)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                                isFollowing
                                  ? 'bg-white/10 text-[#F0F6FC] hover:bg-white/20'
                                  : 'bg-[#FF2D55] text-[#080A0F] hover:bg-[#FF6B8B]'
                              }`}
                            >
                              {isFollowing ? (
                                <>
                                  <UserCheck className="w-3 h-3" />
                                  <span>{t('Following')}</span>
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-3 h-3" />
                                  <span>{t('Follow')}</span>
                                </>
                              )}
                            </button>
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
        </>
      ) : (
        /* Activity Feed Widget */
        <div className="space-y-4 animate-enter">
          <div className="flex items-center justify-between gap-3 bg-[#131822]/90 border border-white/10 p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#FF2D55]" />
              <h2 className="text-sm font-bold text-[#F0F6FC]">
                {t('Recent PR & Workout Activity')}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 bg-[#1A202D] p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setActivityFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activityFilter === 'all'
                    ? 'bg-[#FF2D55] text-[#080A0F]'
                    : 'text-[#8B949E] hover:text-[#F0F6FC]'
                }`}
              >
                {t('All')}
              </button>
              <button
                type="button"
                onClick={() => setActivityFilter('following')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activityFilter === 'following'
                    ? 'bg-[#FF2D55] text-[#080A0F]'
                    : 'text-[#8B949E] hover:text-[#F0F6FC]'
                }`}
              >
                {t('Following')} ({followingUids.length})
              </button>
            </div>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="rounded-2xl bg-[#131822]/90 border border-white/10 py-16 px-6 text-center space-y-2 animate-enter">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1A202D] flex items-center justify-center text-[#6E7681]">
                <Activity className="w-7 h-7" />
              </div>
              <h2 className="text-base font-bold text-[#8B949E] pt-2">
                {t('No recent activity')}
              </h2>
              <p className="text-xs text-[#6E7681]">
                {t('Follow athletes or complete workouts to see activity updates here.')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((act, idx) => {
                const isMe = act.uid === currentUserUid;
                const isFollowing = followingUids.includes(act.uid);

                return (
                  <div
                    key={act.id}
                    className="rounded-2xl bg-[#131822]/90 border border-white/10 p-4 sm:p-5 flex items-start gap-4 transition-all hover:border-white/20 animate-enter"
                    style={{ animationDelay: `${Math.min(idx * 30, 240)}ms` }}
                  >
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1A202D] border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                      {act.photoURL ? (
                        <img
                          src={act.photoURL}
                          alt={act.displayName ?? 'Athlete'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-[#8B949E]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#F0F6FC]">
                            {act.displayName || 'Athlete'}
                          </h3>
                          {isMe && (
                            <span className="px-2 py-0.5 rounded-md bg-[#FF2D55]/20 text-[#FF6B8B] text-[10px] font-extrabold uppercase">
                              {t('You')}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono-num text-[#6E7681]">
                          {formatTimeAgo(act.timestamp)}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-[#C9D1D9] mt-1">
                        <span className="text-[#00E5FF] font-semibold">{act.displayName || 'Athlete'}</span> {act.message}
                      </p>

                      {!isMe && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => toggleFollow(act.uid)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                              isFollowing
                                ? 'bg-white/10 text-[#F0F6FC] hover:bg-white/20'
                                : 'bg-[#FF2D55] text-[#080A0F] hover:bg-[#FF6B8B]'
                            }`}
                          >
                            {isFollowing ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>{t('Following')}</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>{t('Follow')}</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
