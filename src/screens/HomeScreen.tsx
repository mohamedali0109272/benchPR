import React, { useMemo, useState } from 'react';
import { Clock, Columns3, Dumbbell, Edit3, Flame, History, Play, Plus, TrendingUp } from 'lucide-react';
import { Edit1RMModal, TargetLiftKind } from '../components/Edit1RMModal';
import { ExercisePickerModal } from '../components/ExercisePickerModal';
import { OneRMTrendCard } from '../components/OneRMTrendCard';
import { useWorkout } from '../context/WorkoutContext';
import { formatPlainWeight } from '../data/RankingEngine';
import { estimateTimeToTarget1RM, formatEtaParts } from '../data/storage';
import { useI18n } from '../i18n/I18nContext';

interface HomeScreenProps {
  onQuickStart: (exerciseId: string | null) => void;
  onOpenSplits: () => void;
  onNavigateToHistory: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onQuickStart,
  onOpenSplits,
  onNavigateToHistory,
}) => {
  const {
    target1RM,
    targetSquat1RM,
    targetDeadlift1RM,
    weightUnit,
    bestBenchLifted,
    bestSquatLifted,
    bestDeadliftLifted,
    historyWorkouts,
    totalWorkoutsCompleted,
    updateTarget1RM,
    updateTargetSquat1RM,
    updateTargetDeadlift1RM,
    updateWeightUnit,
  } = useWorkout();
  const { t } = useI18n();

  const [editModalLift, setEditModalLift] = useState<TargetLiftKind | null>(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  const targetTotal = target1RM + targetSquat1RM + targetDeadlift1RM;
  const bigThreeTargets = useMemo(() => {
    const defs: Array<{
      kind: TargetLiftKind;
      label: string;
      target: number;
      best: number | null;
      color: string;
    }> = [
      { kind: 'bench', label: 'Bench', target: target1RM, best: bestBenchLifted, color: '#FF6D00' },
      { kind: 'squat', label: 'Squat', target: targetSquat1RM, best: bestSquatLifted, color: '#00E5FF' },
      { kind: 'deadlift', label: 'Deadlift', target: targetDeadlift1RM, best: bestDeadliftLifted, color: '#B26BFF' },
    ];
    return defs.map((item) => ({
      ...item,
      eta: estimateTimeToTarget1RM(historyWorkouts, item.kind, item.target, weightUnit),
    }));
  }, [
    bestBenchLifted,
    bestDeadliftLifted,
    bestSquatLifted,
    historyWorkouts,
    target1RM,
    targetDeadlift1RM,
    targetSquat1RM,
    weightUnit,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Hero Grid: Target 1RM + Stats on Left, Quick Start on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 flex flex-col gap-3 animate-enter">
          {/* Target PRs Card (Bench, Squat, Deadlift) */}
          <div className="relative overflow-hidden rounded-2xl bg-[#131822]/90 border border-white/10 p-3.5 sm:p-4 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
            <div className="pointer-events-none absolute -top-20 -end-16 w-52 h-52 rounded-full bg-[#FF6D00]/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -start-16 w-48 h-48 rounded-full bg-[#B26BFF]/10 blur-3xl" />

            <div className="relative flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <span className="text-[11px] font-extrabold tracking-widest text-[#FF9E40]">
                  {t('TARGET PRS (1RM)')}
                </span>
                <span className="text-[11px] text-[#8B949E] font-medium">
                  {t('Target Total')}:{' '}
                  <span className="font-bold font-mono-num text-[#F0F6FC]">
                    {formatPlainWeight(targetTotal)} {t(weightUnit)}
                  </span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setEditModalLift('bench')}
                aria-label={t('Edit Target PRs')}
                className="w-8 h-8 rounded-lg bg-[#1D2432] border border-white/10 flex items-center justify-center text-[#00E5FF] hover:bg-[#252E40] hover:border-[#00E5FF]/50 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative mt-2.5 grid grid-cols-3 gap-2 sm:gap-2.5">
              {bigThreeTargets.map((lift) => {
                const rawRatio =
                  lift.best !== null && lift.target > 0
                    ? Math.max(0, lift.best / lift.target)
                    : 0;
                const clampedRatio = Math.min(1, rawRatio);
                const percent = Math.round(rawRatio * 100);
                const radius = 17;
                const circumference = 2 * Math.PI * radius;
                const dashOffset = circumference * (1 - clampedRatio);

                return (
                  <button
                    key={lift.kind}
                    type="button"
                    onClick={() => setEditModalLift(lift.kind)}
                    className="group flex flex-col sm:flex-row items-center gap-2 sm:gap-2.5 rounded-xl bg-[#0D1119]/90 border border-white/10 px-2 py-2.5 sm:px-3 sm:py-2.5 hover:border-white/25 active:scale-[0.985] transition-all cursor-pointer text-center sm:text-start min-w-0"
                  >
                    <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
                      <svg className="w-11 h-11 -rotate-90" viewBox="0 0 42 42" aria-hidden="true">
                        <circle
                          cx="21"
                          cy="21"
                          r={radius}
                          fill="none"
                          stroke="#1B2230"
                          strokeWidth="3.5"
                        />
                        <circle
                          cx="21"
                          cy="21"
                          r={radius}
                          fill="none"
                          stroke={lift.color}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={dashOffset}
                          className="transition-all duration-500"
                        />
                      </svg>
                      <span className="absolute text-[9.5px] font-extrabold font-mono-num text-[#F0F6FC]">
                        {percent}%
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 w-full">
                      <div
                        className="text-[11px] font-extrabold tracking-wide leading-none truncate"
                        style={{ color: lift.color }}
                      >
                        {t(lift.label)}
                      </div>

                      <div className="mt-1 flex items-baseline justify-center sm:justify-start gap-1">
                        <span className="text-base sm:text-lg font-black font-mono-num tracking-tight text-[#F0F6FC] leading-none">
                          {formatPlainWeight(lift.target)}
                        </span>
                        <span className="text-[10px] font-bold text-[#8B949E]">
                          {t(weightUnit)}
                        </span>
                      </div>

                      <div className="mt-1 text-[10px] text-[#8B949E] font-mono-num truncate leading-none">
                        {lift.best !== null
                          ? `${t('Best')}: ${formatPlainWeight(lift.best)} ${t(weightUnit)}`
                          : t('No logs yet')}
                      </div>

                      <div className="mt-1 flex items-center justify-center sm:justify-start gap-1 text-[10px] font-semibold leading-none truncate">
                        <Clock
                          className="w-2.5 h-2.5 shrink-0"
                          style={{
                            color:
                              lift.eta.status === 'reached'
                                ? '#00E676'
                                : lift.eta.status === 'no_data'
                                  ? '#6E7681'
                                  : lift.color,
                          }}
                        />
                        {lift.eta.status === 'reached' ? (
                          <span className="text-[#00E676] truncate">{t('Goal reached!')}</span>
                        ) : lift.eta.daysRemaining !== null ? (
                          <span className="text-[#C9D1D9] font-mono-num truncate">
                            {(() => {
                              const parts = formatEtaParts(lift.eta.daysRemaining);
                              return `${lift.eta.status === 'trend_pace' ? t('ETA') : t('Est.')} ${parts.value} ${t(parts.unitKey)}`;
                            })()}
                          </span>
                        ) : (
                          <span className="text-[#6E7681] truncate">{t('Log to estimate')}</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="rounded-2xl bg-[#131822]/90 border border-white/10 p-3.5 sm:p-4 flex flex-col justify-between hover:border-[#00E676]/40 transition-colors">
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
              className="text-start rounded-2xl bg-[#131822]/90 border border-white/10 p-3.5 sm:p-4 flex flex-col justify-between hover:border-[#00E5FF]/40 active:scale-[0.98] transition-all cursor-pointer"
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

      {/* 30-Day Estimated 1RM Trend */}
      <OneRMTrendCard />

      {editModalLift !== null && (
        <Edit1RMModal
          currentBench1RM={target1RM}
          currentSquat1RM={targetSquat1RM}
          currentDeadlift1RM={targetDeadlift1RM}
          currentUnit={weightUnit}
          initialFocusLift={editModalLift}
          onClose={() => setEditModalLift(null)}
          onSave={({ bench, squat, deadlift, unit }) => {
            updateTarget1RM(bench);
            updateTargetSquat1RM(squat);
            updateTargetDeadlift1RM(deadlift);
            updateWeightUnit(unit);
            setEditModalLift(null);
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
