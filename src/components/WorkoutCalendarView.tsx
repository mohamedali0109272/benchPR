import React, { useMemo, useState } from 'react';
import { CalendarCheck2, Check, ChevronLeft, ChevronRight, Flame, Sparkles } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { WorkoutWithSets } from '../types/models';

interface WorkoutCalendarViewProps {
  workouts: WorkoutWithSets[];
  renderWorkoutCard: (item: WorkoutWithSets, index: number) => React.ReactNode;
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function computeCurrentStreak(activeDayKeys: Set<string>): number {
  if (activeDayKeys.size === 0) return 0;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const cursor = activeDayKeys.has(toDateKey(today))
    ? today
    : activeDayKeys.has(toDateKey(yesterday))
      ? yesterday
      : null;

  if (!cursor) return 0;

  let streak = 0;
  while (activeDayKeys.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export const WorkoutCalendarView: React.FC<WorkoutCalendarViewProps> = ({
  workouts,
  renderWorkoutCard,
}) => {
  const { t, locale, isRtl } = useI18n();

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const todayKey = useMemo(() => toDateKey(today), [today]);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedKey, setSelectedKey] = useState<string>(todayKey);

  const { workoutsByDay, activeDayKeys, streakDays } = useMemo(() => {
    const map = new Map<string, WorkoutWithSets[]>();
    const keys = new Set<string>();
    for (const w of workouts) {
      if (!w.workoutLog.isCompleted) continue;
      const key = toDateKey(new Date(w.workoutLog.timestamp));
      keys.add(key);
      const list = map.get(key) ?? [];
      list.push(w);
      map.set(key, list);
    }
    return {
      workoutsByDay: map,
      activeDayKeys: keys,
      streakDays: computeCurrentStreak(keys),
    };
  }, [workouts]);

  const weekdayLabels = useMemo(() => {
    // 2024-01-07 was a Sunday
    const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 7 + i)));
  }, [locale]);

  const monthTitle = useMemo(() => {
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
      new Date(viewYear, viewMonth, 1),
    );
  }, [locale, viewMonth, viewYear]);

  const calendarCells = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = firstOfMonth.getDay(); // 0 = Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

    const cells: Array<{
      date: Date;
      dateKey: string;
      dayNumber: number;
      inCurrentMonth: boolean;
    }> = [];

    for (let i = 0; i < totalCells; i++) {
      const date = new Date(viewYear, viewMonth, 1 - startWeekday + i);
      cells.push({
        date,
        dateKey: toDateKey(date),
        dayNumber: date.getDate(),
        inCurrentMonth: date.getMonth() === viewMonth && date.getFullYear() === viewYear,
      });
    }
    return cells;
  }, [viewMonth, viewYear]);

  const monthActiveDaysCount = useMemo(() => {
    let count = 0;
    for (const cell of calendarCells) {
      if (cell.inCurrentMonth && activeDayKeys.has(cell.dateKey)) {
        count += 1;
      }
    }
    return count;
  }, [activeDayKeys, calendarCells]);

  const isViewingCurrentMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const jumpToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedKey(todayKey);
  };

  const selectedDayWorkouts = workoutsByDay.get(selectedKey) ?? [];
  const selectedDayLabel = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(parseDateKey(selectedKey));
  }, [locale, selectedKey]);

  return (
    <div className="space-y-5 animate-enter">
      {/* Consistency Summary Strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-[#131822]/90 border border-white/10 p-3.5 sm:p-4">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-extrabold tracking-wider text-[#8B949E]">
            <Flame className="w-3.5 h-3.5 text-[#FF6D00] shrink-0" />
            <span className="truncate">{t('Current Streak')}</span>
          </div>
          <div className="mt-1.5 text-lg sm:text-xl font-black font-mono-num text-[#F0F6FC]">
            {streakDays} {t(streakDays === 1 ? 'day' : 'days')}
          </div>
        </div>

        <div className="rounded-2xl bg-[#131822]/90 border border-white/10 p-3.5 sm:p-4">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-extrabold tracking-wider text-[#8B949E]">
            <CalendarCheck2 className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
            <span className="truncate">{t('This Month')}</span>
          </div>
          <div className="mt-1.5 text-lg sm:text-xl font-black font-mono-num text-[#F0F6FC]">
            {monthActiveDaysCount} {t(monthActiveDaysCount === 1 ? 'day' : 'days')}
          </div>
        </div>

        <div className="rounded-2xl bg-[#131822]/90 border border-white/10 p-3.5 sm:p-4">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-extrabold tracking-wider text-[#8B949E]">
            <Sparkles className="w-3.5 h-3.5 text-[#00E676] shrink-0" />
            <span className="truncate">{t('Active Days')}</span>
          </div>
          <div className="mt-1.5 text-lg sm:text-xl font-black font-mono-num text-[#F0F6FC]">
            {activeDayKeys.size} {t(activeDayKeys.size === 1 ? 'day' : 'days')}
          </div>
        </div>
      </div>

      {/* Monthly Calendar Card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#131822]/90 border border-white/10 p-4 sm:p-5 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
        <div className="pointer-events-none absolute -top-24 -end-20 w-64 h-64 rounded-full bg-[#00E676]/10 blur-3xl" />

        {/* Month Header */}
        <div className="relative flex items-center justify-between gap-3 mb-4">
          <h2 className="text-base sm:text-lg font-black text-[#F0F6FC]">{monthTitle}</h2>

          <div className="flex items-center gap-1.5">
            {!isViewingCurrentMonth && (
              <button
                type="button"
                onClick={jumpToToday}
                className="px-2.5 py-1.5 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/35 text-[11px] font-bold text-[#00E5FF] hover:bg-[#00E5FF]/25 transition-colors cursor-pointer"
              >
                {t('Today')}
              </button>
            )}
            <button
              type="button"
              onClick={goPrevMonth}
              aria-label={t('Previous Month')}
              className="w-8 h-8 rounded-lg bg-[#1A202D] border border-white/10 flex items-center justify-center text-[#F0F6FC] hover:bg-[#232B3B] active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
            <button
              type="button"
              onClick={goNextMonth}
              aria-label={t('Next Month')}
              className="w-8 h-8 rounded-lg bg-[#1A202D] border border-white/10 flex items-center justify-center text-[#F0F6FC] hover:bg-[#232B3B] active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="relative grid grid-cols-7 gap-1.5 mb-2">
          {weekdayLabels.map((label, idx) => (
            <div
              key={`${label}-${idx}`}
              className="text-center text-[11px] font-extrabold tracking-wide text-[#8B949E] py-1"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Day Grid */}
        <div className="relative grid grid-cols-7 gap-1.5">
          {calendarCells.map((cell) => {
            const dayLogs = workoutsByDay.get(cell.dateKey) ?? [];
            const hasWorkout = dayLogs.length > 0;
            const isMulti = dayLogs.length > 1;
            const isToday = cell.dateKey === todayKey;
            const isSelected = cell.dateKey === selectedKey;

            return (
              <button
                key={cell.dateKey}
                type="button"
                onClick={() => {
                  setSelectedKey(cell.dateKey);
                  if (!cell.inCurrentMonth) {
                    setViewYear(cell.date.getFullYear());
                    setViewMonth(cell.date.getMonth());
                  }
                }}
                className={`relative h-12 sm:h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border ${
                  !cell.inCurrentMonth
                    ? 'opacity-30 border-transparent bg-transparent hover:opacity-60'
                    : isSelected
                      ? hasWorkout
                        ? 'bg-[#00E676]/20 border-[#00E676] shadow-[0_0_16px_rgba(0,230,118,0.25)]'
                        : 'bg-[#1D2432] border-[#00E5FF] shadow-[0_0_14px_rgba(0,229,255,0.2)]'
                      : hasWorkout
                        ? isMulti
                          ? 'bg-[#FF6D00]/15 border-[#FF6D00]/45 hover:border-[#FF6D00]'
                          : 'bg-[#00E676]/12 border-[#00E676]/35 hover:border-[#00E676]/70'
                        : isToday
                          ? 'bg-[#18202E] border-[#00E5FF]/50 hover:border-[#00E5FF]'
                          : 'bg-[#0D1119]/75 border-white/[0.06] hover:border-white/20'
                }`}
              >
                <span
                  className={`text-xs sm:text-sm font-extrabold font-mono-num leading-none ${
                    isToday
                      ? 'text-[#00E5FF]'
                      : hasWorkout
                        ? 'text-[#F0F6FC]'
                        : 'text-[#C9D1D9]'
                  }`}
                >
                  {cell.dayNumber}
                </span>

                {hasWorkout ? (
                  <div className="flex items-center gap-0.5">
                    {isMulti ? (
                      <>
                        {dayLogs.slice(0, 3).map((log) => (
                          <span
                            key={log.workoutLog.id}
                            className="w-1.5 h-1.5 rounded-full bg-[#FF9E40]"
                          />
                        ))}
                      </>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full bg-[#00E676]/25 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-[#00E676] stroke-[3]" />
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="h-3.5" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="relative mt-4 pt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-4 text-[11px] text-[#8B949E]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-[#00E676]/15 border border-[#00E676]/45 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-[#00E676] stroke-[3]" />
            </span>
            <span>{t('Completed Day')}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-[#FF6D00]/15 border border-[#FF6D00]/45 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9E40]" />
            </span>
            <span>{t('Multi-session')}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-[#18202E] border border-[#00E5FF]/50" />
            <span>{t('Today')}</span>
          </span>
        </div>
      </div>

      {/* Selected Day Workout Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <h3 className="text-xs font-extrabold tracking-widest text-[#8B949E] uppercase">
            {selectedDayLabel}
          </h3>
          {selectedDayWorkouts.length > 0 && (
            <span className="text-xs font-bold font-mono-num text-[#00E676]">
              {selectedDayWorkouts.length} {t('Completed')}
            </span>
          )}
        </div>

        {selectedDayWorkouts.length > 0 ? (
          <div className="space-y-3.5">
            {selectedDayWorkouts.map((item, idx) => renderWorkoutCard(item, idx))}
          </div>
        ) : (
          <div className="rounded-2xl bg-[#131822]/70 border border-dashed border-white/10 py-6 px-4 text-center text-xs text-[#6E7681]">
            {t('Rest day — no workouts logged on this date.')}
          </div>
        )}
      </div>
    </div>
  );
};
