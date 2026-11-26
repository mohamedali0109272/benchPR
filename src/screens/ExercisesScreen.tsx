import React, { useMemo, useState } from 'react';
import { Dumbbell, Play, Search, X } from 'lucide-react';
import { ExerciseLibrary } from '../data/ExerciseLibrary';
import { useI18n } from '../i18n/I18nContext';
import { ALL_MUSCLE_GROUPS, ExerciseItem, MUSCLE_DISPLAY_NAMES, MuscleGroup } from '../types/models';

interface ExercisesScreenProps {
  onStartExercise: (exerciseId: string) => void;
}

const MUSCLE_COLORS: Record<MuscleGroup, string> = {
  [MuscleGroup.CHEST]: '#FF6D00',
  [MuscleGroup.SHOULDERS]: '#00E5FF',
  [MuscleGroup.BICEPS]: '#B26BFF',
  [MuscleGroup.TRICEPS]: '#FF2D6F',
  [MuscleGroup.FOREARMS]: '#FFC21A',
  [MuscleGroup.CORE]: '#2EE6C5',
  [MuscleGroup.TRAPS]: '#3FA9FF',
  [MuscleGroup.LATS]: '#00E676',
  [MuscleGroup.LOWER_BACK]: '#FF9E40',
  [MuscleGroup.GLUTES]: '#FF5C8D',
  [MuscleGroup.QUADS]: '#38BDF8',
  [MuscleGroup.HAMSTRINGS]: '#A78BFA',
  [MuscleGroup.CALVES]: '#34D399',
};

export const ExercisesScreen: React.FC<ExercisesScreenProps> = ({ onStartExercise }) => {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);

  const filteredExercises = useMemo(
    () => ExerciseLibrary.search(searchQuery, selectedMuscle, t),
    [searchQuery, selectedMuscle, t],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between gap-3 animate-enter">
        <div className="flex items-center gap-2.5">
          <Dumbbell className="w-6 h-6 text-[#FF6D00]" />
          <h1 className="text-xl font-black tracking-wide text-[#F0F6FC]">
            {t('EXERCISE LIBRARY')}
          </h1>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-[#131822] border border-white/10 text-xs font-bold font-mono-num text-[#8B949E]">
          {filteredExercises.length} {t('exercises')}
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative animate-enter" style={{ animationDelay: '40ms' }}>
        <Search className="w-4 h-4 text-[#8B949E] absolute top-1/2 -translate-y-1/2 start-4 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('Search by name or target muscle...')}
          aria-label={t('Search by name or target muscle...')}
          className="w-full ps-11 pe-10 py-3 rounded-xl bg-[#131822] border border-white/10 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#FF6D00] transition-colors"
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

      {/* Filter Chips */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1 animate-enter"
        style={{ animationDelay: '80ms' }}
      >
        <button
          type="button"
          onClick={() => setSelectedMuscle(null)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
            selectedMuscle === null
              ? 'bg-gradient-to-r from-[#FF6D00] to-[#FF9100] text-[#080A0F] shadow-[0_0_14px_rgba(255,109,0,0.35)]'
              : 'bg-[#131822] text-[#8B949E] hover:text-[#F0F6FC] border border-white/10'
          }`}
        >
          {t('All')}
        </button>

        {ALL_MUSCLE_GROUPS.map((muscle) => {
          const active = selectedMuscle === muscle;
          const color = MUSCLE_COLORS[muscle];
          return (
            <button
              key={muscle}
              type="button"
              onClick={() => setSelectedMuscle(muscle)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                active
                  ? 'text-[#080A0F] shadow-md'
                  : 'bg-[#131822] text-[#8B949E] hover:text-[#F0F6FC] border border-white/10'
              }`}
              style={
                active
                  ? { backgroundColor: color, boxShadow: `0 0 14px ${color}55` }
                  : undefined
              }
            >
              {t(MUSCLE_DISPLAY_NAMES[muscle])}
            </button>
          );
        })}
      </div>

      {/* Exercise Cards */}
      {filteredExercises.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <div className="text-sm text-[#8B949E]">{t('No exercises match your search.')}</div>
          {(searchQuery.length > 0 || selectedMuscle !== null) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedMuscle(null);
              }}
              className="px-4 py-2 rounded-xl bg-[#131822] border border-white/10 text-xs font-bold text-[#00E5FF] hover:border-[#00E5FF]/50 transition-colors cursor-pointer"
            >
              {t('Reset filters')}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise, idx) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              accent={MUSCLE_COLORS[exercise.muscleGroup]}
              index={idx}
              onStart={() => onStartExercise(exercise.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ExerciseCardProps {
  exercise: ExerciseItem;
  accent: string;
  index: number;
  onStart: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, accent, index, onStart }) => {
  const { t } = useI18n();

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-[#131822]/90 border border-white/10 p-5 flex flex-col justify-between hover:border-white/25 transition-all duration-200 animate-enter"
      style={{ animationDelay: `${Math.min(index * 25, 220)}ms` }}
    >
      <div
        className="pointer-events-none absolute -top-16 -end-16 w-40 h-40 rounded-full blur-3xl opacity-15 group-hover:opacity-30 transition-opacity"
        style={{ backgroundColor: accent }}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-[#F0F6FC]">{t(exercise.name)}</h3>
          <span
            className="px-2.5 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap shrink-0"
            style={{ backgroundColor: `${accent}20`, color: accent }}
          >
            {t(MUSCLE_DISPLAY_NAMES[exercise.muscleGroup])}
          </span>
        </div>

        <p className="mt-2 text-xs sm:text-[13px] text-[#8B949E] leading-relaxed">
          {t(exercise.description)}
        </p>

        {exercise.secondaryMuscles.length > 0 && (
          <p className="mt-2 text-[11px] text-[#6E7681]">
            {t(
              `Also works: ${exercise.secondaryMuscles
                .map((m) => MUSCLE_DISPLAY_NAMES[m])
                .join(', ')}`,
            )}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onStart}
        className="relative mt-4 w-full h-10 rounded-xl bg-gradient-to-r from-[#FF6D00] to-[#FF9E40] text-[#080A0F] font-black text-xs tracking-wider flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-[0_4px_16px_rgba(255,109,0,0.28)]"
      >
        <Play className="w-4 h-4 fill-current" />
        <span>{t('START THIS EXERCISE')}</span>
      </button>
    </div>
  );
};
