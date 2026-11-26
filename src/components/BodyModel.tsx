import React, { useState } from 'react';
import { RANK_TIER_MAP } from '../data/RankingEngine';
import { useI18n } from '../i18n/I18nContext';
import { MuscleGroup, MuscleRankInfo, RankTier } from '../types/models';
import {
  BACK_DETAILS,
  BACK_PARTS,
  BODY_HEIGHT,
  BODY_WIDTH,
  FRONT_DETAILS,
  FRONT_PARTS,
  SILHOUETTE_PATH,
} from './BodyPaths';

interface BodyModelProps {
  ranks: Record<MuscleGroup, MuscleRankInfo>;
  selected: MuscleGroup | null;
  onSelect: (muscle: MuscleGroup | null) => void;
}

export const BodyModel: React.FC<BodyModelProps> = ({ ranks, selected, onSelect }) => {
  const { t } = useI18n();
  const [showBack, setShowBack] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  const flipTo = (back: boolean) => {
    if (back === showBack) return;
    setIsFlipping(true);
    window.setTimeout(() => {
      setShowBack(back);
      window.setTimeout(() => {
        setIsFlipping(false);
      }, 40);
    }, 150);
  };

  const parts = showBack ? BACK_PARTS : FRONT_PARTS;
  const details = showBack ? BACK_DETAILS : FRONT_DETAILS;

  const selectedColor = selected
    ? RANK_TIER_MAP[ranks[selected]?.tier ?? RankTier.UNRANKED].color
    : '#FF6D00';

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-[270px] py-2 flex items-center justify-center">
        {/* Atmospheric glow behind figure */}
        <div
          className="pointer-events-none absolute inset-x-6 inset-y-8 rounded-full blur-3xl transition-colors duration-500 opacity-30"
          style={{
            background: `radial-gradient(circle, ${selectedColor}66 0%, #00E5FF22 50%, transparent 75%)`,
          }}
        />

        <svg
          viewBox={`0 0 ${BODY_WIDTH} ${BODY_HEIGHT}`}
          className="relative z-10 w-full h-auto select-none transition-transform duration-200 ease-out drop-shadow-[0_12px_28px_rgba(0,0,0,0.65)]"
          style={{
            transform: isFlipping ? 'scaleX(0.05)' : 'scaleX(1)',
          }}
          role="img"
          aria-label={showBack ? t('BACK') : t('FRONT')}
        >
          <defs>
            <filter id="muscle-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Head */}
          <ellipse
            cx="100"
            cy="30"
            rx="16"
            ry="19"
            fill="#1B2027"
            stroke="#39414C"
            strokeWidth="1"
          />

          {[false, true].map((mirror) => (
            <g
              key={mirror ? 'right' : 'left'}
              transform={mirror ? 'translate(200, 0) scale(-1, 1)' : undefined}
            >
              {/* Body Silhouette */}
              <path
                d={SILHOUETTE_PATH}
                fill="#1B2027"
                stroke="#39414C"
                strokeWidth="1"
              />

              {/* Colored Muscle Groups */}
              {parts.map((part, idx) => {
                const info = ranks[part.muscle];
                const tier = info?.tier ?? RankTier.UNRANKED;
                const fillColor = RANK_TIER_MAP[tier].color;
                const isSelected = selected === part.muscle;
                const isRanked = tier !== RankTier.UNRANKED;

                return (
                  <g
                    key={`${part.muscle}-${idx}`}
                    onClick={() => onSelect(isSelected ? null : part.muscle)}
                    className="cursor-pointer group"
                  >
                    <path
                      d={part.d}
                      fill={fillColor}
                      fillOpacity={isSelected ? 1 : isRanked ? 0.92 : 0.85}
                      stroke={isSelected ? '#FFFFFF' : '#0C0E12'}
                      strokeWidth={isSelected ? 2 : 1.2}
                      filter={isSelected ? 'url(#muscle-glow)' : undefined}
                      className="transition-all duration-300 hover:brightness-125"
                    />
                    {isSelected && (
                      <path
                        d={part.d}
                        fill="#FFFFFF"
                        className="animate-bench-pulse pointer-events-none"
                        fillOpacity="0.22"
                      />
                    )}
                  </g>
                );
              })}

              {/* Anatomical Detail Lines */}
              {details.map((d, idx) => (
                <path
                  key={`detail-${idx}`}
                  d={d}
                  fill="none"
                  stroke="#0C0E12"
                  strokeOpacity="0.58"
                  strokeWidth="1"
                  strokeLinecap="round"
                  className="pointer-events-none"
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      {/* Front / Back Toggle */}
      <div className="mt-3 inline-flex items-center gap-1 p-1 rounded-full bg-[#1C222D] border border-white/10 shadow-inner">
        <button
          type="button"
          onClick={() => flipTo(false)}
          className={`px-5 py-1.5 rounded-full text-xs font-extrabold tracking-wider transition-all duration-200 whitespace-nowrap cursor-pointer ${
            !showBack
              ? 'bg-gradient-to-r from-[#FF6D00] to-[#FF9100] text-[#080A0F] shadow-[0_0_16px_rgba(255,109,0,0.4)]'
              : 'text-[#8B949E] hover:text-[#F0F6FC]'
          }`}
        >
          {t('FRONT')}
        </button>
        <button
          type="button"
          onClick={() => flipTo(true)}
          className={`px-5 py-1.5 rounded-full text-xs font-extrabold tracking-wider transition-all duration-200 whitespace-nowrap cursor-pointer ${
            showBack
              ? 'bg-gradient-to-r from-[#FF6D00] to-[#FF9100] text-[#080A0F] shadow-[0_0_16px_rgba(255,109,0,0.4)]'
              : 'text-[#8B949E] hover:text-[#F0F6FC]'
          }`}
        >
          {t('BACK')}
        </button>
      </div>
    </div>
  );
};
