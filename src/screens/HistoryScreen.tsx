import React, { useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, History, Trash2 } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { formatPlainWeight } from '../data/RankingEngine';
import { useI18n } from '../i18n/I18nContext';
import { ExerciseSetLogEntity, WorkoutWithSets } from '../types/models';

interface HistoryScreenProps {
  onBackClick: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBackClick }) => {
  const { historyWorkouts, deleteWorkoutLog } = useWorkout();
  const { t, isRtl } = useI18n();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center gap-3 animate-enter">
        <button
          type="button"
          onClick={onBackClick}
          aria-label={t('Back')}
          className="w-10 h-10 rounded-xl bg-[#161B24] border border-white/10 flex items-center justify-center text-[#F0F6FC] hover:bg-[#1F2633] active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
        <div className="flex items-center gap-2.5">
          <History className="w-5 h-5 text-[#00E5FF]" />
          <h1 className="text-lg sm:text-xl font-black tracking-wide text-[#F0F6FC]">
            {t('WORKOUT LOG HISTORY')}
          </h1>
        </div>
      </div>

      {historyWorkouts.length === 0 ? (
        <div className="rounded-2xl bg-[#131822]/90 border border-white/10 py-16 px-6 text-center space-y-2 animate-enter">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1A202D] flex items-center justify-center text-[#6E7681]">
            <History className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-[#8B949E] pt-2">
            {t('No recorded workouts yet')}
          </h2>
          <p className="text-xs text-[#6E7681]">
            {t('Complete your first program session to track your PR!')}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {historyWorkouts.map((item, idx) => (
            <WorkoutHistoryCard
              key={item.workoutLog.id}
              workoutWithSets={item}
              index={idx}
              onDelete={() => deleteWorkoutLog(item.workoutLog.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface WorkoutHistoryCardProps {
  workoutWithSets: WorkoutWithSets;
  index: number;
  onDelete: () => void;
}

const WorkoutHistoryCard: React.FC<WorkoutHistoryCardProps> = ({
  workoutWithSets,
  index,
  onDelete,
}) => {
  const { t, locale } = useI18n();
  const [expanded, setExpanded] = useState(false);

  const { workoutLog, sets } = workoutWithSets;
  const durationMinutes = Math.floor(workoutLog.totalDurationSeconds / 60);

  const formattedDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(locale, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(workoutLog.timestamp));
    } catch {
      return new Date(workoutLog.timestamp).toLocaleString();
    }
  }, [locale, workoutLog.timestamp]);

  const groupedByExercise = useMemo(() => {
    const map = new Map<string, ExerciseSetLogEntity[]>();
    for (const s of sets) {
      const list = map.get(s.exerciseName) ?? [];
      list.push(s);
      map.set(s.exerciseName, list);
    }
    return Array.from(map.entries());
  }, [sets]);

  return (
    <div
      className="rounded-2xl bg-[#131822]/90 border border-white/10 p-4 sm:p-5 transition-colors hover:border-white/20 animate-enter"
      style={{ animationDelay: `${Math.min(index * 45, 250)}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-[#F0F6FC] truncate">
            {t(workoutLog.sessionTitle)}
          </h3>
          <p className="text-xs text-[#6E7681] mt-0.5">{formattedDate}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onDelete}
            aria-label={t('Delete Log')}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#6E7681] hover:text-[#FF2D6F] hover:bg-[#FF2D6F]/10 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-label={t(expanded ? 'Collapse' : 'Expand')}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors cursor-pointer"
          >
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${
                expanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-bold">
        <span className="text-[#FF9E40] font-mono-num">
          {t(`Target 1RM: ${formatPlainWeight(workoutLog.target1RM)} ${workoutLog.unit}`)}
        </span>
        <span className="text-[#00E676] font-mono-num">
          {t(`Duration: ${durationMinutes}m`)}
        </span>
      </div>

      <div className="accordion-content" data-open={expanded ? 'true' : 'false'}>
        <div className="accordion-inner">
          <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-3">
            {groupedByExercise.map(([exerciseName, setLogs]) => (
              <div key={exerciseName} className="space-y-1.5">
                <div className="text-xs font-bold text-[#00E5FF]">{t(exerciseName)}</div>
                <div className="space-y-1 ps-2">
                  {setLogs.map((set) => (
                    <div
                      key={set.id}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <span className={set.isCompleted ? 'text-[#F0F6FC]' : 'text-[#6E7681]'}>
                        {t(
                          `Set ${set.setIndex}: ${formatPlainWeight(set.actualWeight)} ${workoutLog.unit} x ${set.actualReps} reps`,
                        )}
                      </span>
                      {set.isCompleted && (
                        <span className="text-[11px] font-bold text-[#00E676]">
                          {t('Completed')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
