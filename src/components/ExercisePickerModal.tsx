import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { ExerciseArt } from './ExerciseArt';
import { ExerciseLibrary } from '../data/ExerciseLibrary';
import { useI18n } from '../i18n/I18nContext';
import { ALL_MUSCLE_GROUPS, ExerciseItem, MUSCLE_DISPLAY_NAMES, MuscleGroup } from '../types/models';

interface ExercisePickerModalProps {
  title?: string;
  onPick: (item: ExerciseItem) => void;
  onClose: () => void;
}

export const ExercisePickerModal: React.FC<ExercisePickerModalProps> = ({
  title = 'Pick an exercise',
  onPick,
  onClose,
}) => {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState<MuscleGroup | null>(null);

  const results = useMemo(() => ExerciseLibrary.search(query, muscle, t), [query, muscle, t]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-enter"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl h-[86vh] flex flex-col rounded-2xl bg-[#11151E] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#151A24]">
          <h2 className="text-base font-extrabold tracking-wide text-[#F0F6FC]">
            {t(title).toUpperCase()}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('Close')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#8B949E] hover:text-[#F0F6FC] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 space-y-3 border-b border-white/5 bg-[#11151E]">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8B949E] absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('Search exercises...')}
              autoFocus
              className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-[#0A0D13] border border-[#2A313D] text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#FF2D55] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setMuscle(null)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                muscle === null
                  ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF334B] text-[#080A0F] shadow-[0_0_12px_rgba(255,45,85,0.35)]'
                  : 'bg-[#1A202B] text-[#8B949E] hover:text-[#F0F6FC] border border-white/5'
              }`}
            >
              {t('All')}
            </button>
            {ALL_MUSCLE_GROUPS.map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => setMuscle(group)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  muscle === group
                    ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF334B] text-[#080A0F] shadow-[0_0_12px_rgba(255,45,85,0.35)]'
                    : 'bg-[#1A202B] text-[#8B949E] hover:text-[#F0F6FC] border border-white/5'
                }`}
              >
                {t(MUSCLE_DISPLAY_NAMES[group])}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {results.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-[#8B949E]">
              {t('No exercises match your search.')}
            </div>
          ) : (
            results.map((item) => {
              const subtitle = `${item.defaultSets} sets${item.isTimed ? ' - timed' : ` x ${item.defaultReps} reps`}`;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onPick(item);
                    onClose();
                  }}
                  className="w-full text-start flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#161B24] border border-white/10 hover:border-[#FF2D55]/60 hover:bg-[#1B222E] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <ExerciseArt exerciseId={item.id} className="w-11 h-11" />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#F0F6FC] truncate">{t(item.name)}</div>
                      <div className="text-xs text-[#8B949E] mt-0.5">{t(subtitle)}</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-[#00E5FF]/10 text-[#00E5FF] text-[11px] font-bold whitespace-nowrap shrink-0">
                    {t(MUSCLE_DISPLAY_NAMES[item.muscleGroup])}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
