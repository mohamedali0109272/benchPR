import React from 'react';
import { ChevronRight, Columns3 } from 'lucide-react';
import { Splits } from '../data/Splits';
import { useI18n } from '../i18n/I18nContext';
import { WorkoutSplit } from '../types/models';

interface SplitsScreenProps {
  onOpenSplit: (splitId: string) => void;
}

const SPLIT_ACCENTS = [
  '#FF6D00',
  '#00E5FF',
  '#00E676',
  '#B26BFF',
  '#FFC21A',
  '#FF2D6F',
  '#3FA9FF',
  '#2EE6C5',
  '#FF9E40',
];

export const SplitsScreen: React.FC<SplitsScreenProps> = ({ onOpenSplit }) => {
  const { t, isRtl } = useI18n();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="space-y-1.5 animate-enter">
        <div className="flex items-center gap-2.5">
          <Columns3 className="w-6 h-6 text-[#FF6D00]" />
          <h1 className="text-xl font-black tracking-wide text-[#F0F6FC]">
            {t('TRAINING SPLITS')}
          </h1>
        </div>
        <p className="text-sm text-[#8B949E]">
          {t('Pick a split, open a day and start logging. Weights are filled in from your last session.')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Splits.ALL_SPLITS.map((split, idx) => (
          <SplitCard
            key={split.id}
            split={split}
            accent={SPLIT_ACCENTS[idx % SPLIT_ACCENTS.length]}
            index={idx}
            isRtl={isRtl}
            onClick={() => onOpenSplit(split.id)}
          />
        ))}
      </div>
    </div>
  );
};

interface SplitCardProps {
  split: WorkoutSplit;
  accent: string;
  index: number;
  isRtl: boolean;
  onClick: () => void;
}

const SplitCard: React.FC<SplitCardProps> = ({ split, accent, index, isRtl, onClick }) => {
  const { t } = useI18n();

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden text-start rounded-2xl bg-[#131822]/90 border border-white/10 p-5 flex flex-col justify-between hover:border-white/25 hover:-translate-y-0.5 active:scale-[0.985] transition-all duration-200 animate-enter cursor-pointer shadow-[0_10px_28px_rgba(0,0,0,0.35)]"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <div
        className="pointer-events-none absolute -top-16 -end-16 w-44 h-44 rounded-full blur-3xl opacity-20 group-hover:opacity-35 transition-opacity"
        style={{ backgroundColor: accent }}
      />

      <div className="relative w-full">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-base font-black text-[#F0F6FC] group-hover:text-white transition-colors">
            {t(split.name)}
          </h2>
          <ChevronRight
            className={`w-5 h-5 text-[#6E7681] group-hover:text-[#F0F6FC] shrink-0 transition-transform ${
              isRtl ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'
            }`}
          />
        </div>
        <p className="mt-1 text-xs text-[#8B949E] leading-relaxed">{t(split.tagline)}</p>

        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs font-bold">
          <span style={{ color: accent }}>{t(`${split.daysPerWeek} days/week`)}</span>
          <span className="text-[#484F58]" aria-hidden="true">·</span>
          <span className="text-[#00E5FF]">{t(split.level)}</span>
          <span className="text-[#484F58]" aria-hidden="true">·</span>
          <span className="text-[#00E676]">{t(split.goal)}</span>
        </div>
      </div>

      <div className="relative mt-4 pt-3 border-t border-white/[0.06] text-xs text-[#6E7681] leading-relaxed">
        {split.days.map((d) => t(d.name)).join(' · ')}
      </div>
    </button>
  );
};
