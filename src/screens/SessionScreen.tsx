import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Minus,
  Play,
  Plus,
  Shield,
  Square,
  Timer,
  X,
} from 'lucide-react';
import { ExerciseArt } from '../components/ExerciseArt';
import { ExercisePickerModal } from '../components/ExercisePickerModal';
import { useWorkout } from '../context/WorkoutContext';
import { ExerciseLibrary } from '../data/ExerciseLibrary';
import { formatPlainWeight } from '../data/RankingEngine';
import { useI18n } from '../i18n/I18nContext';
import {
  ActiveExerciseState,
  ALL_LIFTING_ACCESSORIES,
  ExerciseSetState,
  LiftingAccessory,
  WeightUnit,
} from '../types/models';

interface SessionScreenProps {
  onWorkoutFinished: () => void;
  onBackClick: () => void;
}

export const SessionScreen: React.FC<SessionScreenProps> = ({
  onWorkoutFinished,
  onBackClick,
}) => {
  const {
    activeWorkout,
    timerSecondsRemaining,
    timerTotalSeconds,
    isTimerRunning,
    toggleSetCompletion,
    updateSetWeight,
    updateSetReps,
    toggleSetAccessory,
    startTimer,
    stopTimer,
    addSet,
    removeSet,
    addExercise,
    removeExercise,
    finishWorkout,
    cancelWorkout,
  } = useWorkout();
  const { t, isRtl } = useI18n();

  const [showPicker, setShowPicker] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  if (!activeWorkout) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-sm text-[#8B949E]">
        {t('No active workout session.')}
      </div>
    );
  }

  const totalSets = activeWorkout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const doneSets = activeWorkout.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.isCompleted).length,
    0,
  );
  const progress = totalSets === 0 ? 0 : doneSets / totalSets;

  const handleBack = () => {
    if (doneSets > 0) {
      setShowDiscardDialog(true);
    } else {
      cancelWorkout();
      onBackClick();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Studio Top Bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0B0E15]/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={handleBack}
              aria-label={t('Back')}
              className="w-10 h-10 rounded-xl bg-[#161B24] border border-white/10 flex items-center justify-center text-[#F0F6FC] hover:bg-[#1E2532] active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-extrabold text-[#F0F6FC] truncate">
                {t(activeWorkout.sessionTemplate.title)}
              </h1>
              <p className="text-xs font-semibold text-[#FF2D55] truncate">
                {t(`Goal: ${activeWorkout.sessionTemplate.goal}`)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => finishWorkout(onWorkoutFinished)}
            aria-label="Finish Workout"
            className="w-10 h-10 rounded-xl bg-[#00E676]/15 border border-[#00E676]/40 flex items-center justify-center text-[#00E676] hover:bg-[#00E676]/25 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Scrollable Workout Body */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-5 space-y-5 pb-28">
        {/* Progress Bar */}
        <div className="rounded-2xl bg-[#131822]/90 border border-white/10 p-4 space-y-2 animate-enter">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#8B949E]">{t(`${doneSets} / ${totalSets} sets done`)}</span>
            <span className="text-[#00E676] font-mono-num">{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-[#1E2532] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF2D55] via-[#00E5FF] to-[#00E676] transition-all duration-500 ease-out"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>

        {/* Hold Timer */}
        {(isTimerRunning || timerSecondsRemaining > 0) && (
          <TimerCard
            secondsRemaining={timerSecondsRemaining}
            totalSeconds={timerTotalSeconds}
            isRunning={isTimerRunning}
            onStopClick={stopTimer}
          />
        )}

        {/* Empty State */}
        {activeWorkout.exercises.length === 0 && (
          <div className="rounded-2xl bg-[#131822]/90 border border-white/10 p-8 text-center space-y-1.5 animate-enter">
            <h2 className="text-base font-bold text-[#F0F6FC]">{t('Your workout is empty')}</h2>
            <p className="text-sm text-[#8B949E]">
              {t('Add an exercise to start logging sets.')}
            </p>
          </div>
        )}

        {/* Exercises */}
        <div className="space-y-4">
          {activeWorkout.exercises.map((exerciseState, eIdx) => (
            <ExerciseLoggingCard
              key={exerciseState.template.id}
              exerciseState={exerciseState}
              unit={activeWorkout.unit}
              onToggleSet={(sIdx) => toggleSetCompletion(eIdx, sIdx)}
              onUpdateWeight={(sIdx, w) => updateSetWeight(eIdx, sIdx, w)}
              onUpdateReps={(sIdx, r) => updateSetReps(eIdx, sIdx, r)}
              onToggleAccessory={(sIdx, acc) => toggleSetAccessory(eIdx, sIdx, acc)}
              onStartHoldTimer={(duration) => startTimer(duration)}
              onAddSet={() => addSet(eIdx)}
              onRemoveSet={() => removeSet(eIdx, exerciseState.sets.length - 1)}
              onRemoveExercise={() => removeExercise(eIdx)}
            />
          ))}
        </div>

        {/* Add Exercise Button */}
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="w-full h-12 rounded-xl border border-[#FF2D55]/70 bg-[#FF2D55]/10 text-[#FF6B8B] font-black text-xs tracking-wider flex items-center justify-center gap-2 hover:bg-[#FF2D55]/20 active:scale-[0.985] transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>{t('ADD EXERCISE')}</span>
        </button>
      </div>

      {/* Sticky Bottom Finish CTA */}
      <div className="fixed bottom-0 inset-x-0 z-30 border-t border-white/10 bg-[#0D1119]/95 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <button
            type="button"
            onClick={() => finishWorkout(onWorkoutFinished)}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#00E676] to-[#2EE6C5] text-[#080A0F] font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_8px_28px_rgba(0,230,118,0.35)] hover:brightness-110 active:scale-[0.985] transition-all cursor-pointer"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>{t('FINISH & LOG WORKOUT')}</span>
          </button>
        </div>
      </div>

      {showPicker && (
        <ExercisePickerModal
          title="Add exercise"
          onPick={(item) => addExercise(item)}
          onClose={() => setShowPicker(false)}
        />
      )}

      {showDiscardDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-enter"
          onClick={() => setShowDiscardDialog(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[#141923] border border-white/10 p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-[#F0F6FC]">{t('Discard workout?')}</h2>
            <p className="text-sm text-[#8B949E]">
              {t(`You have ${doneSets} completed sets that have not been saved.`)}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardDialog(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#8B949E] hover:text-[#F0F6FC] cursor-pointer"
              >
                {t('Keep going')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDiscardDialog(false);
                  cancelWorkout();
                  onBackClick();
                }}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-[#FF2D55]/20 text-[#FF2D55] hover:bg-[#FF2D55]/30 cursor-pointer"
              >
                {t('Discard')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface TimerCardProps {
  secondsRemaining: number;
  totalSeconds: number;
  isRunning: boolean;
  onStopClick: () => void;
}

const TimerCard: React.FC<TimerCardProps> = ({
  secondsRemaining,
  totalSeconds,
  isRunning,
  onStopClick,
}) => {
  const { t } = useI18n();
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const ratio = totalSeconds > 0 ? secondsRemaining / totalSeconds : 0;

  return (
    <div className="rounded-2xl bg-[#1A202D] border border-[#FF2D55] p-4 flex items-center justify-between gap-4 shadow-[0_0_28px_rgba(255,45,85,0.2)] animate-enter">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#FF2D55]/15 flex items-center justify-center text-[#FF2D55]">
          <Timer className={`w-6 h-6 ${isRunning ? 'animate-bench-pulse' : ''}`} />
        </div>
        <div>
          <div className="text-[11px] font-extrabold tracking-widest text-[#FF6B8B]">
            {t(isRunning ? 'STATIC HOLD TIMER RUNNING' : 'TIMER PAUSED')}
          </div>
          <div className="text-2xl font-black font-mono-num text-[#F0F6FC]">{formatted}</div>
          {totalSeconds > 0 && (
            <div className="mt-1 w-32 h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#FF2D55] transition-all duration-300"
                style={{ width: `${Math.round(ratio * 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onStopClick}
        aria-label="Stop Timer"
        className="w-10 h-10 rounded-full bg-[#FF2D55] text-[#080A0F] flex items-center justify-center hover:brightness-110 active:scale-95 transition-all cursor-pointer"
      >
        <Square className="w-4 h-4 fill-current" />
      </button>
    </div>
  );
};

interface ExerciseLoggingCardProps {
  exerciseState: ActiveExerciseState;
  unit: WeightUnit;
  onToggleSet: (setIndex: number) => void;
  onUpdateWeight: (setIndex: number, weight: number) => void;
  onUpdateReps: (setIndex: number, reps: number) => void;
  onToggleAccessory: (setIndex: number, accessory: LiftingAccessory) => void;
  onStartHoldTimer: (duration: number) => void;
  onAddSet: () => void;
  onRemoveSet: () => void;
  onRemoveExercise: () => void;
}

const ExerciseLoggingCard: React.FC<ExerciseLoggingCardProps> = ({
  exerciseState,
  unit,
  onToggleSet,
  onUpdateWeight,
  onUpdateReps,
  onToggleAccessory,
  onStartHoldTimer,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
}) => {
  const { t } = useI18n();
  const { template, calculatedTargetWeight, sets } = exerciseState;
  const allDone = sets.length > 0 && sets.every((s) => s.isCompleted);

  const weightLabel = calculatedTargetWeight > 0.0 ? formatPlainWeight(calculatedTargetWeight) : null;
  let descStr = '';
  if (template.targetPercent > 0.0 && template.isStaticHold) {
    descStr = `${Math.round(template.targetPercent)}% Target (${calculatedTargetWeight} ${unit}) x ${template.targetDurationSeconds}s`;
  } else if (template.targetPercent > 0.0) {
    const setStr = template.totalSets > 1 ? ` | ${template.totalSets} sets` : '';
    descStr = `${Math.round(template.targetPercent)}% Target (${calculatedTargetWeight} ${unit}) x ${template.targetReps} reps${setStr}`;
  } else if (template.isStaticHold) {
    descStr = `${sets.length} sets x ${template.targetDurationSeconds}s hold`;
  } else {
    const reps = template.repRange ?? String(template.targetReps);
    const last = weightLabel ? ` | last: ${weightLabel} ${unit}` : '';
    descStr = `${sets.length} sets x ${reps} reps${last}`;
  }

  return (
    <div
      className={`rounded-2xl bg-[#131822]/90 border p-4 sm:p-5 transition-all duration-300 animate-enter ${
        allDone
          ? 'border-[#00E676] shadow-[0_0_24px_rgba(0,230,118,0.16)]'
          : 'border-white/10'
      }`}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex items-center gap-3">
          <ExerciseArt exerciseId={ExerciseLibrary.findByName(template.name)?.id} className="w-14 h-14" />
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-[#F0F6FC]">{t(template.name)}</h3>
            <p className="text-xs font-semibold text-[#00E5FF] mt-0.5">{t(descStr)}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {template.isStaticHold && (
            <button
              type="button"
              onClick={() => onStartHoldTimer(template.targetDurationSeconds)}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#FF2D55] to-[#FF6B8B] text-[#080A0F] font-bold text-xs flex items-center gap-1 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{t(`${template.targetDurationSeconds}s Hold`)}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onRemoveExercise}
            aria-label="Remove exercise"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6E7681] hover:text-[#FF2D55] hover:bg-[#FF2D55]/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sets */}
      <div className="mt-4 space-y-3">
        {sets.map((set, setIndex) => (
          <SetLoggingRow
            key={set.setIndex}
            set={set}
            setNumber={setIndex + 1}
            isStaticHold={template.isStaticHold}
            unit={unit}
            onToggle={() => onToggleSet(setIndex)}
            onWeightChange={(w) => onUpdateWeight(setIndex, w)}
            onRepsChange={(r) => onUpdateReps(setIndex, r)}
            onToggleAccessory={(acc) => onToggleAccessory(setIndex, acc)}
          />
        ))}
      </div>

      {/* Set Actions */}
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onAddSet}
          className="flex-1 py-2.5 rounded-xl bg-[#1A2130] border border-white/10 text-xs font-bold tracking-wide text-[#00E5FF] flex items-center justify-center gap-1.5 hover:bg-[#222B3E] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('ADD SET')}</span>
        </button>

        {sets.length > 1 && (
          <button
            type="button"
            onClick={onRemoveSet}
            className="flex-1 py-2.5 rounded-xl bg-[#1A2130] border border-white/10 text-xs font-bold tracking-wide text-[#8B949E] flex items-center justify-center gap-1.5 hover:text-[#FF2D55] hover:bg-[#222B3E] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Minus className="w-4 h-4" />
            <span>{t('REMOVE SET')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

interface SetLoggingRowProps {
  set: ExerciseSetState;
  setNumber: number;
  isStaticHold: boolean;
  unit: WeightUnit;
  onToggle: () => void;
  onWeightChange: (weight: number) => void;
  onRepsChange: (reps: number) => void;
  onToggleAccessory: (accessory: LiftingAccessory) => void;
}

const SetLoggingRow: React.FC<SetLoggingRowProps> = ({
  set,
  setNumber,
  isStaticHold,
  unit,
  onToggle,
  onWeightChange,
  onRepsChange,
  onToggleAccessory,
}) => {
  const { t } = useI18n();
  const [weightText, setWeightText] = useState(formatPlainWeight(set.actualWeight));
  const [repsText, setRepsText] = useState(String(set.actualReps));
  const [lastSyncedWeight, setLastSyncedWeight] = useState(set.actualWeight);
  const [showAccessoriesMenu, setShowAccessoriesMenu] = useState(false);

  if (set.actualWeight !== lastSyncedWeight) {
    setLastSyncedWeight(set.actualWeight);
    if (parseFloat(weightText) !== set.actualWeight) {
      setWeightText(formatPlainWeight(set.actualWeight));
    }
  }

  const activeAccessories = set.accessories ?? [];

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        set.isCompleted
          ? 'bg-[#00E676]/10 border-[#00E676]/60'
          : 'bg-[#0C0F16] border-white/10 hover:border-white/20'
      }`}
    >
      <div
        onClick={onToggle}
        className="flex items-center justify-between gap-2 sm:gap-4 px-3 py-2.5 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            aria-label={t(`SET ${setNumber}`)}
            className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all cursor-pointer ${
              set.isCompleted
                ? 'bg-[#00E676] border-[#00E676] text-[#080A0F]'
                : 'border-[#484F58] bg-transparent hover:border-[#00E676]/60'
            }`}
          >
            {set.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
          </button>

          <span
            className={`text-xs font-extrabold tracking-wide whitespace-nowrap ${
              set.isCompleted ? 'text-[#00E676]' : 'text-[#8B949E]'
            }`}
          >
            {t(`SET ${setNumber}`)}
          </span>

          {/* Accessory summary pill if any selected */}
          {activeAccessories.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowAccessoriesMenu(!showAccessoriesMenu);
              }}
              className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF2D55]/15 border border-[#FF2D55]/40 text-[10px] font-bold text-[#FF2D55] cursor-pointer"
            >
              <Shield className="w-3 h-3" />
              <span>{activeAccessories.join(', ')}</span>
            </button>
          )}
        </div>

        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setShowAccessoriesMenu(!showAccessoriesMenu)}
            title={t('Toggle Lifting Accessories')}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              activeAccessories.length > 0
                ? 'bg-[#FF2D55]/20 border-[#FF2D55] text-[#FF2D55]'
                : 'bg-[#161B24] border-white/10 text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            <Shield className="w-4 h-4" />
          </button>

          <div className="relative flex items-center">
            <input
              type="number"
              step="0.5"
              min="0"
              value={weightText}
              onChange={(e) => {
                const str = e.target.value;
                setWeightText(str);
                const parsed = parseFloat(str.replace(',', '.'));
                if (Number.isFinite(parsed)) {
                  setLastSyncedWeight(parsed);
                  onWeightChange(parsed);
                }
              }}
              className="w-20 sm:w-24 ps-2.5 pe-7 py-1.5 rounded-lg bg-[#161B24] border border-white/10 text-sm font-bold font-mono-num text-[#F0F6FC] focus:outline-none focus:border-[#FF2D55]"
            />
            <span className="absolute end-2 text-[10px] font-bold text-[#6E7681] pointer-events-none">
              {t(unit)}
            </span>
          </div>

          <span className="text-xs font-bold text-[#6E7681]">×</span>

          {isStaticHold ? (
            <div className="w-16 sm:w-20 px-2.5 py-1.5 rounded-lg bg-[#161B24]/60 border border-white/10 text-sm font-bold font-mono-num text-[#F0F6FC] text-center">
              {t(`${set.durationSeconds}s`)}
            </div>
          ) : (
            <input
              type="number"
              min="0"
              value={repsText}
              onChange={(e) => {
                const str = e.target.value;
                setRepsText(str);
                const parsed = parseInt(str, 10);
                if (Number.isFinite(parsed)) {
                  onRepsChange(parsed);
                }
              }}
              className="w-16 sm:w-20 px-2.5 py-1.5 rounded-lg bg-[#161B24] border border-white/10 text-sm font-bold font-mono-num text-[#F0F6FC] text-center focus:outline-none focus:border-[#FF2D55]"
            />
          )}
        </div>
      </div>

      {/* Accessories Selection Drawer */}
      {showAccessoriesMenu && (
        <div
          className="px-3 py-2 bg-[#080B12] border-t border-white/10 space-y-1.5 animate-enter"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-[#8B949E] uppercase">
              {t('Lifting Accessories & Gear')}
            </span>
            <button
              type="button"
              onClick={() => setShowAccessoriesMenu(false)}
              className="text-[10px] text-[#00E5FF] font-bold hover:underline cursor-pointer"
            >
              {t('Done')}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_LIFTING_ACCESSORIES.map((acc) => {
              const active = activeAccessories.includes(acc);
              return (
                <button
                  key={acc}
                  type="button"
                  onClick={() => onToggleAccessory(acc)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#FF2D55] text-white shadow-[0_0_12px_rgba(255,45,85,0.4)] border border-[#FF2D55]'
                      : 'bg-[#161B24] text-[#8B949E] border border-white/10 hover:border-white/20 hover:text-[#F0F6FC]'
                  }`}
                >
                  {t(acc)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
