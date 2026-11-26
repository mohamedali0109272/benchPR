import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, Play } from 'lucide-react';
import { ExerciseLibrary } from '../data/ExerciseLibrary';
import { Splits } from '../data/Splits';
import { useI18n } from '../i18n/I18nContext';
import { MUSCLE_DISPLAY_NAMES, SplitDay } from '../types/models';

interface SplitDetailScreenProps {
  splitId: string;
  onBack: () => void;
  onStartDay: (splitId: string, dayIndex: number) => void;
}

export const SplitDetailScreen: React.FC<SplitDetailScreenProps> = ({
  splitId,
  onBack,
  onStartDay,
}) => {
  const { t, isRtl } = useI18n();
  const split = Splits.findSplit(splitId);
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  if (!split) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center space-y-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#8B949E] hover:text-[#F0F6FC] cursor-pointer"
        >
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          <span>{t('Back')}</span>
        </button>
        <p className="text-[#8B949E]">{t('This split could not be found.')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3 animate-enter">
        <button
          type="button"
          onClick={onBack}
          aria-label={t('Back')}
          className="mt-0.5 w-10 h-10 rounded-xl bg-[#161B24] border border-white/10 flex items-center justify-center text-[#F0F6FC] hover:bg-[#1F2633] active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
        </button>

        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-[#F0F6FC]">{t(split.name)}</h1>
          <p className="text-xs sm:text-sm text-[#FF9E40] font-medium mt-0.5">{t(split.tagline)}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="text-[#FF6D00]">{t(`${split.daysPerWeek} days/week`)}</span>
            <span className="text-[#484F58]" aria-hidden="true">·</span>
            <span className="text-[#00E5FF]">{t(split.level)}</span>
            <span className="text-[#484F58]" aria-hidden="true">·</span>
            <span className="text-[#00E676]">{t(split.goal)}</span>
          </div>
        </div>
      </div>

      {/* Days */}
      <div className="space-y-3">
        {split.days.map((day, index) => (
          <DayCard
            key={`${day.name}-${index}`}
            dayNumber={index + 1}
            day={day}
            expanded={expandedIndex === index}
            index={index}
            onToggle={() => setExpandedIndex((prev) => (prev === index ? -1 : index))}
            onStart={() => onStartDay(split.id, index)}
          />
        ))}
      </div>
    </div>
  );
};

interface DayCardProps {
  dayNumber: number;
  day: SplitDay;
  expanded: boolean;
  index: number;
  onToggle: () => void;
  onStart: () => void;
}

const DayCard: React.FC<DayCardProps> = ({
  dayNumber,
  day,
  expanded,
  index,
  onToggle,
  onStart,
}) => {
  const { t } = useI18n();

  return (
    <div
      className={`rounded-2xl bg-[#131822]/90 border transition-colors duration-200 animate-enter overflow-hidden ${
        expanded ? 'border-[#FF6D00]/70 shadow-[0_0_24px_rgba(255,109,0,0.12)]' : 'border-white/10'
      }`}
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 sm:p-5 flex items-center gap-3.5 text-start hover:bg-white/[0.02] transition-colors cursor-pointer"
      >
        <span
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0 transition-all ${
            expanded
              ? 'bg-gradient-to-br from-[#FF6D00] to-[#FF9E40] text-[#080A0F] shadow-[0_0_16px_rgba(255,109,0,0.4)]'
              : 'bg-[#1D2432] text-[#8B949E]'
          }`}
        >
          {dayNumber}
        </span>

        <div className="flex-1 min-w-0">
          <div className="text-base font-bold text-[#F0F6FC]">{t(day.name)}</div>
          <div className="text-xs text-[#8B949E] mt-0.5">
            {t(`${day.focus} - ${day.exercises.length} exercises`)}
          </div>
        </div>

        <ChevronDown
          className={`w-5 h-5 text-[#8B949E] shrink-0 transition-transform duration-200 ${
            expanded ? 'rotate-180 text-[#FF6D00]' : ''
          }`}
        />
      </button>

      <div className="accordion-content" data-open={expanded ? 'true' : 'false'}>
        <div className="accordion-inner">
          <div className="px-4 sm:px-5 pb-5 pt-1 space-y-2 border-t border-white/[0.06]">
            {day.exercises.map((entry, idx) => {
              const item = ExerciseLibrary.getById(entry.exerciseId);
              return (
                <div
                  key={`${entry.exerciseId}-${idx}`}
                  className="flex items-center justify-between gap-3 py-2 border-b border-white/[0.04] last:border-b-0"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#F0F6FC]">
                      {item ? t(item.name) : entry.exerciseId}
                    </div>
                    {item && (
                      <div className="text-[11px] font-semibold text-[#00E5FF]">
                        {t(MUSCLE_DISPLAY_NAMES[item.muscleGroup])}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold font-mono-num text-[#8B949E] whitespace-nowrap shrink-0">
                    {t(`${entry.sets} x ${entry.repRange}`)}
                  </span>
                </div>
              );
            })}

            <div className="pt-3">
              <button
                type="button"
                onClick={onStart}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#FF6D00] to-[#FF9E40] text-[#080A0F] font-black text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(255,109,0,0.35)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{t(`START ${day.name.toUpperCase()}`)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
