import {
  ALL_MUSCLE_GROUPS,
  ExerciseItem,
  LoggedSet,
  MuscleGroup,
  MuscleRankInfo,
  OverallRank,
  RankTier,
  RankTierInfo,
  WeightUnit,
} from '../types/models';
import { ExerciseLibrary } from './ExerciseLibrary';

export const RANK_TIERS: RankTierInfo[] = [
  { tier: RankTier.UNRANKED, displayName: 'Unranked', minScore: Number.NEGATIVE_INFINITY, color: '#2B313A', next: RankTier.IRON },
  { tier: RankTier.IRON, displayName: 'Iron', minScore: 0.0, color: '#8D939C', next: RankTier.BRONZE },
  { tier: RankTier.BRONZE, displayName: 'Bronze', minScore: 0.25, color: '#CD7F32', next: RankTier.SILVER },
  { tier: RankTier.SILVER, displayName: 'Silver', minScore: 0.45, color: '#D5DBE3', next: RankTier.GOLD },
  { tier: RankTier.GOLD, displayName: 'Gold', minScore: 0.65, color: '#FFC21A', next: RankTier.PLATINUM },
  { tier: RankTier.PLATINUM, displayName: 'Platinum', minScore: 0.85, color: '#2EE6C5', next: RankTier.DIAMOND },
  { tier: RankTier.DIAMOND, displayName: 'Diamond', minScore: 1.1, color: '#3FA9FF', next: RankTier.MASTER },
  { tier: RankTier.MASTER, displayName: 'Master', minScore: 1.4, color: '#B26BFF', next: RankTier.LEGEND },
  { tier: RankTier.LEGEND, displayName: 'Legend', minScore: 1.8, color: '#FF2D6F', next: null },
];

export const RANK_TIER_MAP: Record<RankTier, RankTierInfo> = Object.fromEntries(
  RANK_TIERS.map((info) => [info.tier, info]),
) as Record<RankTier, RankTierInfo>;

export const DEFAULT_BODYWEIGHT_KG = 75.0;
export const LBS_PER_KG = 2.20462;
export const SECONDARY_FACTOR = 0.6;
const MAX_REPS_FOR_ESTIMATE = 12;

interface Accumulator {
  score: number;
  bestName: string | null;
  bestWeight: number;
  bestReps: number;
  best1Rm: number;
  volume: number;
  sets: number;
}

export const RankingEngine = {
  DEFAULT_BODYWEIGHT_KG,
  LBS_PER_KG,
  SECONDARY_FACTOR,

  toKg(weight: number, unit: WeightUnit | string): number {
    return unit.toLowerCase() === 'lbs' ? weight / LBS_PER_KG : weight;
  },

  fromKg(kg: number, unit: WeightUnit | string): number {
    return unit.toLowerCase() === 'lbs' ? kg * LBS_PER_KG : kg;
  },

  estimateOneRepMax(loadKg: number, reps: number): number {
    if (loadKg <= 0.0 || reps <= 0) return 0.0;
    if (reps === 1) return loadKg;
    return loadKg * (1.0 + Math.min(reps, MAX_REPS_FOR_ESTIMATE) / 30.0);
  },

  effectiveLoadKg(item: ExerciseItem, loggedWeightKg: number, bodyweightKg: number): number {
    return item.bodyweightFactor * bodyweightKg + Math.max(0.0, loggedWeightKg);
  },

  tierFor(score: number): RankTier {
    if (score < 0.0) return RankTier.UNRANKED;
    for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
      const entry = RANK_TIERS[i];
      if (entry.tier !== RankTier.UNRANKED && score >= entry.minScore) {
        return entry.tier;
      }
    }
    return RankTier.IRON;
  },

  progressWithinTier(score: number): number {
    const tier = RankingEngine.tierFor(score);
    const info = RANK_TIER_MAP[tier];
    if (!info.next) return 1;
    if (tier === RankTier.UNRANKED) return 0;
    const nextInfo = RANK_TIER_MAP[info.next];
    const span = nextInfo.minScore - info.minScore;
    const raw = (score - info.minScore) / span;
    return Math.min(1, Math.max(0, raw));
  },

  calculate(sets: LoggedSet[], bodyweightKg: number): Record<MuscleGroup, MuscleRankInfo> {
    const bw = bodyweightKg > 20.0 ? bodyweightKg : DEFAULT_BODYWEIGHT_KG;
    const acc: Record<MuscleGroup, Accumulator> = {} as Record<MuscleGroup, Accumulator>;
    for (const m of ALL_MUSCLE_GROUPS) {
      acc[m] = {
        score: -1.0,
        bestName: null,
        bestWeight: 0.0,
        bestReps: 0,
        best1Rm: 0.0,
        volume: 0.0,
        sets: 0,
      };
    }

    for (const set of sets) {
      const item = ExerciseLibrary.findByName(set.exerciseName);
      if (!item) continue;
      if (item.isTimed || set.reps <= 0 || set.weightKg < 0.0) continue;
      const isBodyweight = item.bodyweightFactor > 0.0;
      if (!isBodyweight && set.weightKg <= 0.0) continue;

      const load = RankingEngine.effectiveLoadKg(item, set.weightKg, bw);
      const primary = acc[item.muscleGroup];
      primary.volume += load * set.reps;
      primary.sets += 1;

      if (item.strengthRef <= 0.0) continue;
      const oneRm = RankingEngine.estimateOneRepMax(load, set.reps);
      const relative = oneRm / (bw * item.strengthRef);

      const credit = (muscle: MuscleGroup, value: number) => {
        const a = acc[muscle];
        if (value > a.score) {
          a.score = value;
          a.bestName = item.name;
          a.bestWeight = set.weightKg;
          a.bestReps = set.reps;
          a.best1Rm = oneRm;
        }
      };

      credit(item.muscleGroup, relative);
      for (const helper of item.secondaryMuscles) {
        credit(helper, relative * SECONDARY_FACTOR);
      }
    }

    const result = {} as Record<MuscleGroup, MuscleRankInfo>;
    for (const muscle of ALL_MUSCLE_GROUPS) {
      const a = acc[muscle];
      const tier = RankingEngine.tierFor(a.score);
      result[muscle] = {
        muscleGroup: muscle,
        tier,
        score: a.score,
        progress: RankingEngine.progressWithinTier(a.score),
        bestLiftName: a.bestName,
        bestLiftWeightKg: a.bestWeight,
        bestLiftReps: a.bestReps,
        bestEstimated1RmKg: a.best1Rm,
        totalVolumeKg: a.volume,
        setsLogged: a.sets,
        nextTier: RANK_TIER_MAP[tier].next,
      };
    }
    return result;
  },

  overall(ranks: Record<MuscleGroup, MuscleRankInfo>): OverallRank {
    const values = Object.values(ranks);
    if (values.length === 0) return { tier: RankTier.UNRANKED, score: -1.0, progress: 0 };
    const anyData = values.some((info) => info.tier !== RankTier.UNRANKED);
    if (!anyData) return { tier: RankTier.UNRANKED, score: -1.0, progress: 0 };
    const avg = values.reduce((sum, info) => sum + Math.max(0.0, info.score), 0) / values.length;
    return {
      tier: RankingEngine.tierFor(avg),
      score: avg,
      progress: RankingEngine.progressWithinTier(avg),
    };
  },

  emptyRanks(): Record<MuscleGroup, MuscleRankInfo> {
    return RankingEngine.calculate([], DEFAULT_BODYWEIGHT_KG);
  },
};

export function formatWeightKg(kg: number, unit: WeightUnit): string {
  const value = Math.round(RankingEngine.fromKg(kg, unit) * 2.0) / 2.0;
  return Number.isInteger(value) ? value.toString() : value.toFixed(1).replace(/\.0$/, '');
}

export function formatScore(score: number): string {
  return Math.max(0.0, score).toFixed(2);
}

export function formatPlainWeight(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toString();
}
