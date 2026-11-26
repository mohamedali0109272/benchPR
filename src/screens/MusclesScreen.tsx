import React, { useState } from 'react';
import { Award, Edit3, X } from 'lucide-react';
import { BodyModel } from '../components/BodyModel';
import { useWorkout } from '../context/WorkoutContext';
import { ExerciseLibrary } from '../data/ExerciseLibrary';
import {
  formatScore,
  formatWeightKg,
  RANK_TIER_MAP,
  RANK_TIERS,
  RankingEngine,
} from '../data/RankingEngine';
import { useI18n } from '../i18n/I18nContext';
import {
  ALL_MUSCLE_GROUPS,
  MUSCLE_DISPLAY_NAMES,
  MuscleGroup,
  MuscleRankInfo,
  RankTier,
  WeightUnit,
} from '../types/models';

export const MusclesScreen: React.FC = () => {
  const { muscleRanks, overallRank, weightUnit, bodyweightKg, updateBodyweightKg } = useWorkout();
  const { t } = useI18n();

  const [selected, setSelected] = useState<MuscleGroup | null>(null);
  const [showBodyweightModal, setShowBodyweightModal] = useState(false);

  const overallTierInfo = RANK_TIER_MAP[overallRank.tier];
  const nextOverall = overallTierInfo.next ? RANK_TIER_MAP[overallTierInfo.next] : null;
  const selectedInfo = selected ? muscleRanks[selected] : null;

  const ringRadius = 32;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - (overallRank.tier === RankTier.UNRANKED ? 0 : overallRank.progress));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center gap-2.5 animate-enter">
        <Award className="w-6 h-6 text-[#FF6D00]" />
        <h1 className="text-xl font-black tracking-wide text-[#F0F6FC]">
          {t('MUSCLE RANKS')}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Overall Rank + Interactive Body Model */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-22">
          {/* Overall Rank Card */}
          <div className="relative overflow-hidden rounded-2xl bg-[#131822]/90 border border-white/10 p-5 shadow-[0_14px_36px_rgba(0,0,0,0.4)] animate-enter">
            <div
              className="pointer-events-none absolute -top-20 -end-16 w-52 h-52 rounded-full blur-3xl opacity-25 transition-colors duration-500"
              style={{ backgroundColor: overallTierInfo.color }}
            />

            <div className="relative flex items-center gap-4">
              {/* Animated SVG Ring Emblem */}
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <div
                  className="absolute inset-1 rounded-full animate-aura blur-md"
                  style={{ backgroundColor: `${overallTierInfo.color}33` }}
                />
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r={ringRadius}
                    fill="#161C27"
                    stroke="#262F3F"
                    strokeWidth="5"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r={ringRadius}
                    fill="none"
                    stroke={overallTierInfo.color}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <Award
                  className="w-8 h-8 absolute transition-colors duration-500"
                  style={{ color: overallTierInfo.color }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-extrabold tracking-widest text-[#8B949E]">
                  {t('OVERALL RANK')}
                </div>
                <div
                  className="text-2xl sm:text-3xl font-black tracking-tight transition-colors duration-500"
                  style={{ color: overallTierInfo.color }}
                >
                  {t(overallTierInfo.displayName).toUpperCase()}
                </div>
                <div className="text-xs text-[#8B949E] mt-0.5">
                  {overallRank.tier === RankTier.UNRANKED
                    ? t('Log a workout to get ranked')
                    : nextOverall === null
                      ? t('Top tier reached')
                      : t(`Next: ${nextOverall.displayName}`)}
                </div>
              </div>
            </div>

            {overallRank.tier !== RankTier.UNRANKED && (
              <div className="mt-4 h-2 rounded-full bg-[#1E2532] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.round(overallRank.progress * 100)}%`,
                    backgroundColor: overallTierInfo.color,
                    boxShadow: `0 0 12px ${overallTierInfo.color}88`,
                  }}
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowBodyweightModal(true)}
              className="mt-4 w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-[#1A202D] border border-white/10 hover:border-[#FF6D00]/50 active:scale-[0.99] transition-all text-start cursor-pointer"
            >
              <div>
                <div className="text-xs font-bold text-[#F0F6FC]">
                  {t(`Body weight: ${formatWeightKg(bodyweightKg, weightUnit)} ${weightUnit}`)}
                </div>
                <div className="text-[11px] text-[#6E7681]">
                  {t('Ranks compare your lifts to your body weight')}
                </div>
              </div>
              <Edit3 className="w-4 h-4 text-[#FF6D00] shrink-0" />
            </button>
          </div>

          {/* Interactive Body Model Card */}
          <div
            className="rounded-2xl bg-[#131822]/90 border border-white/10 p-5 flex flex-col items-center animate-enter shadow-[0_14px_36px_rgba(0,0,0,0.4)]"
            style={{ animationDelay: '70ms' }}
          >
            <BodyModel ranks={muscleRanks} selected={selected} onSelect={setSelected} />

            <div className="w-full mt-4">
              {selectedInfo ? (
                <MuscleRankCard
                  rankInfo={selectedInfo}
                  unit={weightUnit}
                  highlighted
                  onClick={() => setSelected(null)}
                />
              ) : (
                <p className="py-3 text-center text-xs text-[#6E7681]">
                  {t('Tap a muscle to see its rank')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Tier Legend + All Muscles Grid */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tier Legend */}
          <div
            className="flex items-center gap-4 overflow-x-auto pb-1 px-1 animate-enter"
            style={{ animationDelay: '110ms' }}
          >
            {RANK_TIERS.map((tier) => (
              <div key={tier.tier} className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: tier.color, boxShadow: `0 0 8px ${tier.color}88` }}
                />
                <span className="text-xs font-medium text-[#8B949E]">{t(tier.displayName)}</span>
              </div>
            ))}
          </div>

          <h2 className="text-xs font-extrabold tracking-widest text-[#8B949E] pt-1">
            {t('ALL MUSCLES')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {ALL_MUSCLE_GROUPS.map((muscle, idx) => {
              const info = muscleRanks[muscle];
              return (
                <div
                  key={muscle}
                  className="animate-enter"
                  style={{ animationDelay: `${Math.min(idx * 35, 280)}ms` }}
                >
                  <MuscleRankCard
                    rankInfo={info}
                    unit={weightUnit}
                    highlighted={selected === muscle}
                    onClick={() => setSelected(selected === muscle ? null : muscle)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showBodyweightModal && (
        <BodyweightModal
          currentKg={bodyweightKg}
          unit={weightUnit}
          onClose={() => setShowBodyweightModal(false)}
          onSave={(kg) => {
            updateBodyweightKg(kg);
            setShowBodyweightModal(false);
          }}
        />
      )}
    </div>
  );
};

interface MuscleRankCardProps {
  rankInfo: MuscleRankInfo;
  unit: WeightUnit;
  highlighted?: boolean;
  onClick?: () => void;
}

const MuscleRankCard: React.FC<MuscleRankCardProps> = ({
  rankInfo,
  unit,
  highlighted = false,
  onClick,
}) => {
  const { t } = useI18n();
  const tierInfo = RANK_TIER_MAP[rankInfo.tier];
  const nextInfo = rankInfo.nextTier ? RANK_TIER_MAP[rankInfo.nextTier] : null;

  const suggestions =
    rankInfo.tier === RankTier.UNRANKED
      ? ExerciseLibrary.PRESET_EXERCISES.filter(
          (ex) => ex.muscleGroup === rankInfo.muscleGroup && ex.strengthRef > 0.0,
        )
          .slice(0, 3)
          .map((ex) => ex.name)
          .join(', ')
      : '';

  const bestLoadLabel =
    rankInfo.bestLiftWeightKg <= 0.0
      ? 'Bodyweight'
      : `${formatWeightKg(rankInfo.bestLiftWeightKg, unit)} ${unit}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-start rounded-2xl p-4 border transition-all duration-200 cursor-pointer active:scale-[0.985] ${
        highlighted
          ? 'bg-[#1A2130] shadow-lg'
          : 'bg-[#131822]/90 border-white/10 hover:border-white/20'
      }`}
      style={
        highlighted
          ? {
              borderColor: tierInfo.color,
              boxShadow: `0 0 24px ${tierInfo.color}28`,
            }
          : undefined
      }
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: tierInfo.color, boxShadow: `0 0 10px ${tierInfo.color}88` }}
          />
          <span className="text-sm sm:text-base font-bold text-[#F0F6FC] truncate">
            {t(MUSCLE_DISPLAY_NAMES[rankInfo.muscleGroup])}
          </span>
        </div>

        <span
          className="px-2.5 py-0.5 rounded-md text-[11px] font-black tracking-wide whitespace-nowrap shrink-0"
          style={{
            backgroundColor: `${tierInfo.color}22`,
            color: tierInfo.color,
          }}
        >
          {t(tierInfo.displayName).toUpperCase()}
        </span>
      </div>

      {rankInfo.tier === RankTier.UNRANKED ? (
        <p className="mt-2.5 text-xs text-[#8B949E] leading-relaxed">
          {suggestions.length === 0
            ? t('Not ranked yet.')
            : t(`Not ranked yet. Log sets of ${suggestions} to get a rank.`)}
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="h-2 rounded-full bg-[#1E2532] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.round(rankInfo.progress * 100)}%`,
                backgroundColor: tierInfo.color,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8B949E] font-mono-num">
              {t(`Strength score ${formatScore(rankInfo.score)}`)}
            </span>
            <span className="font-bold font-mono-num" style={{ color: tierInfo.color }}>
              {nextInfo === null
                ? t('Top tier')
                : t(`${Math.round(rankInfo.progress * 100)}% to ${nextInfo.displayName}`)}
            </span>
          </div>

          {rankInfo.bestLiftName && (
            <div className="text-xs text-[#F0F6FC]">
              {t(
                `Best: ${rankInfo.bestLiftName} - ${bestLoadLabel} x ${rankInfo.bestLiftReps} (est. 1RM ${formatWeightKg(rankInfo.bestEstimated1RmKg, unit)} ${unit})`,
              )}
            </div>
          )}

          {rankInfo.setsLogged > 0 && (
            <div className="text-[11px] text-[#6E7681]">
              {t(`${rankInfo.setsLogged} sets - ${formatWeightKg(rankInfo.totalVolumeKg, unit)} ${unit} total volume`)}
            </div>
          )}
        </div>
      )}
    </button>
  );
};

interface BodyweightModalProps {
  currentKg: number;
  unit: WeightUnit;
  onClose: () => void;
  onSave: (kg: number) => void;
}

const BodyweightModal: React.FC<BodyweightModalProps> = ({
  currentKg,
  unit,
  onClose,
  onSave,
}) => {
  const { t } = useI18n();
  const [text, setText] = useState(formatWeightKg(currentKg, unit));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(text.replace(',', '.'));
    if (Number.isFinite(parsed) && parsed > 0) {
      onSave(RankingEngine.toKg(parsed, unit));
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-enter"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-[#141923] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-base font-bold text-[#F0F6FC]">{t('Body weight')}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('Close')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8B949E] hover:text-[#F0F6FC] hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-[#8B949E] leading-relaxed">
            {t('Your muscle ranks are based on how much you lift compared to your body weight.')}
          </p>
          <div>
            <label className="block text-xs font-semibold text-[#8B949E] mb-1.5">
              {t(`Body weight (${unit})`)}
            </label>
            <input
              type="number"
              step="0.5"
              min="20"
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl bg-[#0A0D13] border border-[#2A313D] text-base font-bold font-mono-num text-[#F0F6FC] focus:outline-none focus:border-[#FF6D00]"
            />
          </div>
        </div>

        <div className="px-5 pb-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8B949E] hover:text-[#F0F6FC] cursor-pointer"
          >
            {t('Cancel')}
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-[#FF6D00] to-[#FF9100] text-[#080A0F] cursor-pointer"
          >
            {t('Save')}
          </button>
        </div>
      </form>
    </div>
  );
};
