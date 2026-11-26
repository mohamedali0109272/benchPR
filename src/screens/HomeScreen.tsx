import React, { useState } from 'react';
import { Columns3, Dumbbell, Edit3, Flame, History, Play, Plus, TrendingUp } from 'lucide-react';
import { Edit1RMModal } from '../components/Edit1RMModal';
import { ExercisePickerModal } from '../components/ExercisePickerModal';
import { useWorkout } from '../context/WorkoutContext';
import { ProgramData } from '../data/ProgramData';
import { formatPlainWeight } from '../data/RankingEngine';
import { useI18n } from '../i18n/I18nContext';
import { WorkoutSessionTemplate } from '../types/models';

interface HomeScreenProps {
  onStartSession: (sessionId: number) => void;
  onQuickStart: (exerciseId: string | null) => void;
  onOpenSplits: () => void;
  onNavigateToHistory: () => void;
}

const SESSION_THEMES: Record<number, { accent: string; glow: string; badgeBg: string }> = {
  1: {
    accent: '#FF6D00',
    glow: 'from-[#FF6D00]/20 via-[#FF9E40]/5 to-transparent',
    badgeBg: 'bg-[#FF6D00]/15 text-[#FF9E40]',
  },
  2: {
    accent: '#00E5FF',
    glow: 'from-[#00E5FF]/20 via-[#3FA9FF]/5 to-transparent',
    badgeBg: 'bg-[#00E5FF]/15 text-[#00E5FF]',
  },
  3: {
    accent: '#B26BFF',
    glow: 'from-[#B26BFF]/20 via-[#FF2D6F]/5 to-transparent',
    badgeBg: 'bg-[#B26BFF]/15 text-[#B26BFF]',
  },
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartSession,
  onQuickStart,
  onOpenSplits,
  onNavigateToHistory,
}) => {
  const {
    target1RM,
    weightUnit,
    bestBenchLifted,
    totalWorkoutsCompleted,
    updateTarget1RM,
    updateWeightUnit,
  } = useWorkout();
  const { t } = useI18n();

  const [showEdit1RM, setShowEdit1RM] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Hero Grid: Target 1RM + Stats on Left, Quick Start on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 flex flex-col gap-4 animate-enter">
          {/* Target 1RM Card */}
          <div className="relative overflow-hidden rounded-2xl bg-[#131822]/90 border border-white/10 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
            <div className="pointer-events-none absolute -top-24 -end-16 w-64 h-64 rounded-full bg-[#FF6D00]/15 blur-3xl" />
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-extrabold tracking-widest text-[#FF9E40]">
                  {t('TARGET BENCH PR (1RM)')}
                </div>
                <div className="mt-2 flex items-baseline gap-2.5">
                  <span className="text-4xl sm:text-5xl font-black font-mono-num tracking-tight text-[#F0F6FC]">
                    {formatPlainWeight(target1RM)}
                  </span>
                  <span className="text-xl font-bold text-[#8B949E]">{t(weightUnit)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEdit1RM(true)}
                aria-label={t('Edit Target 1RM')}
                className="w-12 h-12 rounded-2xl bg-[#1D2432] border border-white/10 flex items-center justify-center text-[#00E5FF] hover:bg-[#252E40] hover:border-[#00E5FF]/50 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="rounded-2xl bg-[#131822]/90 border border-white/10 p-4 sm:p-5 flex flex-col justify-between hover:border-[#00E676]/40 transition-colors">
              <div className="flex items-center gap-2 text-[11px] font-extrabold tracking-wider text-[#8B949E]">
                <TrendingUp className="w-4 h-4 text-[#00E676]" />
                <span>{t('BEST RECORDED')}</span>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-extrabold font-mono-num text-[#F0F6FC]">
                {bestBenchLifted !== null
                  ? `${formatPlainWeight(bestBenchLifted)} ${t(weightUnit)}`
                  : t('No logs yet')}
              </div>
            </div>

            <button
              type="button"
              onClick={onNavigateToHistory}
              className="text-start rounded-2xl bg-[#131822]/90 border border-white/10 p-4 sm:p-5 flex flex-col justify-between hover:border-[#00E5FF]/40 active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2 text-[11px] font-extrabold tracking-wider text-[#8B949E]">
                <span className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-[#00E5FF]" />
                  <span>{t('COMPLETED')}</span>
                </span>
                <History className="w-3.5 h-3.5 text-[#6E7681]" />
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-extrabold font-mono-num text-[#F0F6FC]">
                {t(`${totalWorkoutsCompleted} Workouts`)}
              </div>
            </button>
          </div>
        </div>

        {/* Quick Start Launchpad */}
        <div
          className="lg:col-span-5 rounded-2xl bg-[#131822]/90 border border-white/10 p-6 flex flex-col justify-between relative overflow-hidden animate-enter"
          style={{ animationDelay: '70ms' }}
        >
          <div className="pointer-events-none absolute -bottom-24 -start-16 w-64 h-64 rounded-full bg-[#00E5FF]/12 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-extrabold tracking-widest text-[#FF6D00]">
              <Flame className="w-4 h-4" />
              <span>{t('QUICK START')}</span>
            </div>
            <p className="mt-1.5 text-sm text-[#8B949E]">
              {t('Train what you feel like, no plan needed.')}
            </p>
          </div>

          <div className="relative mt-6 space-y-3">
            <button
              type="button"
              onClick={() => setShowExercisePicker(true)}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#FF6D00] via-[#FF8500] to-[#FF9E40] animate-gradient-x text-[#080A0F] font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_8px_28px_rgba(255,109,0,0.38)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t('START AN EXERCISE')}</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onQuickStart(null)}
                className="h-11 px-3 rounded-xl bg-[#19202D] border border-[#00E5FF]/40 text-[#00E5FF] font-bold text-xs tracking-wide flex items-center justify-center gap-1.5 hover:bg-[#00E5FF]/10 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span className="truncate">{t('EMPTY WORKOUT')}</span>
              </button>

              <button
                type="button"
                onClick={onOpenSplits}
                className="h-11 px-3 rounded-xl bg-[#19202D] border border-[#B26BFF]/40 text-[#C99BFF] font-bold text-xs tracking-wide flex items-center justify-center gap-1.5 hover:bg-[#B26BFF]/10 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                <Columns3 className="w-4 h-4" />
                <span className="truncate">{t('BROWSE SPLITS')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bench PR Program Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold tracking-widest text-[#8B949E]">
            {t('BENCH PR PROGRAM')}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
          {ProgramData.ALL_SESSIONS.map((session, idx) => (
            <SessionCard
              key={session.id}
              session={session}
              target1RM={target1RM}
              unit={weightUnit}
              index={idx}
              onStart={() => onStartSession(session.id)}
            />
          ))}
        </div>
      </section>

      {showEdit1RM && (
        <Edit1RMModal
          currentTarget1RM={target1RM}
          currentUnit={weightUnit}
          onClose={() => setShowEdit1RM(false)}
          onSave={(newTarget, newUnit) => {
            updateTarget1RM(newTarget);
            updateWeightUnit(newUnit);
            setShowEdit1RM(false);
          }}
        />
      )}

      {showExercisePicker && (
        <ExercisePickerModal
          title="Start an exercise"
          onPick={(item) => onQuickStart(item.id)}
          onClose={() => setShowExercisePicker(false)}
        />
      )}
    </div>
  );
};

interface SessionCardProps {
  session: WorkoutSessionTemplate;
  target1RM: number;
  unit: 'kg' | 'lbs';
  index: number;
  onStart: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({
  session,
  target1RM,
  unit,
  index,
  onStart,
}) => {
  const { t } = useI18n();
  const theme = SESSION_THEMES[session.id] ?? SESSION_THEMES[1];

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-[#131822]/90 border border-white/10 p-5 flex flex-col justify-between hover:border-white/25 transition-all duration-200 animate-enter shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
      style={{ animationDelay: `${140 + index * 70}ms` }}
    >
      {/* Top gradient ambient highlight */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${theme.glow} opacity-80 group-hover:opacity-100 transition-opacity`}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-extrabold text-[#F0F6FC] leading-snug">
              {t(session.title)}
            </h3>
            <p className="mt-1 text-xs font-semibold" style={{ color: theme.accent }}>
              {t(`Main goal: ${session.goal}`)}
            </p>
          </div>
        </div>

        <ul className="mt-5 space-y-2.5">
          {session.exercises.map((exercise) => {
            const weight = ProgramData.calculateWeight(target1RM, exercise.targetPercent);
            const repOrSecStr = exercise.isStaticHold
              ? `${Math.round(exercise.targetPercent)}% x ${exercise.targetDurationSeconds} seconds`
              : `${Math.round(exercise.targetPercent)}% x ${exercise.targetReps}${
                  exercise.totalSets > 1 ? ` (${exercise.totalSets} sets)` : ''
                }`;

            return (
              <li
                key={exercise.id}
                className="flex items-center justify-between gap-3 py-1.5 border-b border-white/[0.05] last:border-b-0"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-full border-2 shrink-0"
                    style={{ borderColor: `${theme.accent}99` }}
                  />
                  <span className="text-[13px] text-[#F0F6FC] truncate">
                    {t(`${exercise.name} - ${repOrSecStr}`)}
                  </span>
                </div>
                <span className="text-xs font-bold font-mono-num text-[#00E5FF] whitespace-nowrap shrink-0">
                  {formatPlainWeight(weight)} {t(unit)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="relative mt-6 w-full h-11 rounded-xl font-black text-xs tracking-wider text-[#080A0F] flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${theme.accent}, #FF9E40)`,
          boxShadow: `0 6px 20px ${theme.accent}40`,
        }}
      >
        <Play className="w-4 h-4 fill-current" />
        <span>{t(`START SESSION ${session.id}`)}</span>
      </button>
    </div>
  );
};
