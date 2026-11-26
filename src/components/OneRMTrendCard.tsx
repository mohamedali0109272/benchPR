import React, { useMemo, useState } from 'react';
import { Activity, Clock } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useWorkout } from '../context/WorkoutContext';
import { formatPlainWeight, RankingEngine } from '../data/RankingEngine';
import {
  BENCH_NAMES,
  DEADLIFT_NAMES,
  estimateTimeToTarget1RM,
  formatEtaParts,
  SQUAT_NAMES,
} from '../data/storage';
import { useI18n } from '../i18n/I18nContext';

type LiftKey = 'bench' | 'squat' | 'deadlift';

interface TrendPoint {
  dateKey: string;
  shortDate: string;
  fullDate: string;
  bench: number | null;
  squat: number | null;
  deadlift: number | null;
}

interface LiftSeriesConfig {
  key: LiftKey;
  label: string;
  color: string;
  gradientId: string;
}

const LIFT_SERIES: LiftSeriesConfig[] = [
  { key: 'bench', label: 'Bench', color: '#FF6D00', gradientId: 'e1rmBenchGrad' },
  { key: 'squat', label: 'Squat', color: '#00E5FF', gradientId: 'e1rmSquatGrad' },
  { key: 'deadlift', label: 'Deadlift', color: '#B26BFF', gradientId: 'e1rmDeadliftGrad' },
];

function toLocalDateKey(timestamp: number): string {
  const d = new Date(timestamp);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function classifyMainLift(name: string): LiftKey | null {
  if (BENCH_NAMES.has(name)) return 'bench';
  if (SQUAT_NAMES.has(name)) return 'squat';
  if (DEADLIFT_NAMES.has(name)) return 'deadlift';
  return null;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey?: string;
    value?: number;
    color?: string;
    payload?: TrendPoint;
  }>;
  unitLabel: string;
  estLabel: string;
  labelMap: Record<LiftKey, string>;
}

const TrendTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  unitLabel,
  estLabel,
  labelMap,
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  const visibleEntries = payload.filter((entry) => typeof entry.value === 'number');
  if (!point || visibleEntries.length === 0) return null;

  return (
    <div className="rounded-xl bg-[#0D1119]/95 border border-white/15 px-3.5 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.65)] backdrop-blur-md">
      <div className="text-[11px] font-bold text-[#8B949E] mb-1.5">{point.fullDate}</div>
      <div className="space-y-1">
        {visibleEntries.map((entry) => {
          const key = entry.dataKey as LiftKey;
          return (
            <div key={key} className="flex items-center justify-between gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-bold" style={{ color: entry.color }}>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {labelMap[key]}
              </span>
              <span className="font-mono-num font-extrabold text-[#F0F6FC]">
                {formatPlainWeight(entry.value ?? 0)} {unitLabel}{' '}
                <span className="text-[10px] font-medium text-[#6E7681]">{estLabel}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const OneRMTrendCard: React.FC = () => {
  const {
    historyWorkouts,
    target1RM,
    targetSquat1RM,
    targetDeadlift1RM,
    weightUnit,
    language,
  } = useWorkout();
  const { t, isRtl } = useI18n();
  const [visibleLifts, setVisibleLifts] = useState<Record<LiftKey, boolean>>({
    bench: true,
    squat: true,
    deadlift: true,
  });

  const locale = language.code === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US';

  const { chartData, liftStats, hasAnyData } = useMemo(() => {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    const points: TrendPoint[] = [];
    const byKey = new Map<string, TrendPoint>();

    for (let i = 29; i >= 0; i--) {
      const ts = todayMidnight - i * dayMs;
      const d = new Date(ts);
      const dateKey = toLocalDateKey(ts);
      const point: TrendPoint = {
        dateKey,
        shortDate: d.toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
        fullDate: d.toLocaleDateString(locale, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        bench: null,
        squat: null,
        deadlift: null,
      };
      points.push(point);
      byKey.set(dateKey, point);
    }

    for (const workout of historyWorkouts) {
      const dateKey = toLocalDateKey(workout.workoutLog.timestamp);
      const bucket = byKey.get(dateKey);
      if (!bucket) continue;

      for (const set of workout.sets) {
        if (!set.isCompleted || set.actualWeight <= 0 || set.actualReps <= 0) continue;
        const lift = classifyMainLift(set.exerciseName);
        if (!lift) continue;

        const loadKg = RankingEngine.toKg(set.actualWeight, workout.workoutLog.unit);
        const estKg = RankingEngine.estimateOneRepMax(loadKg, set.actualReps);
        const estDisplay = Math.round(RankingEngine.fromKg(estKg, weightUnit) * 10) / 10;
        const prev = bucket[lift];
        if (prev === null || estDisplay > prev) {
          bucket[lift] = estDisplay;
        }
      }
    }

    const stats: Record<LiftKey, { latest: number | null; delta: number | null }> = {
      bench: { latest: null, delta: null },
      squat: { latest: null, delta: null },
      deadlift: { latest: null, delta: null },
    };

    let any = false;
    for (const cfg of LIFT_SERIES) {
      const values = points
        .map((p) => p[cfg.key])
        .filter((v): v is number => v !== null);
      if (values.length > 0) {
        any = true;
        const first = values[0];
        const last = values[values.length - 1];
        stats[cfg.key] = {
          latest: last,
          delta: values.length >= 2 ? Math.round((last - first) * 10) / 10 : null,
        };
      }
    }

    return { chartData: points, liftStats: stats, hasAnyData: any };
  }, [historyWorkouts, locale, weightUnit]);

  const targetEstimates = useMemo(() => {
    const targets: Record<LiftKey, number> = {
      bench: target1RM,
      squat: targetSquat1RM,
      deadlift: targetDeadlift1RM,
    };
    return LIFT_SERIES.map((lift) => ({
      ...lift,
      target: targets[lift.key],
      eta: estimateTimeToTarget1RM(historyWorkouts, lift.key, targets[lift.key], weightUnit),
    }));
  }, [historyWorkouts, target1RM, targetDeadlift1RM, targetSquat1RM, weightUnit]);

  const toggleLift = (key: LiftKey) => {
    setVisibleLifts((prev) => {
      const activeCount = Object.values(prev).filter(Boolean).length;
      if (prev[key] && activeCount <= 1) return prev;
      return { ...prev, [key]: !prev[key] };
    });
  };

  const labelMap: Record<LiftKey, string> = {
    bench: t('Bench'),
    squat: t('Squat'),
    deadlift: t('Deadlift'),
  };

  const unitLabel = t(weightUnit);

  return (
    <section
      className="relative overflow-hidden rounded-2xl bg-[#131822]/90 border border-white/10 p-4 sm:p-5 shadow-[0_16px_40px_rgba(0,0,0,0.45)] animate-enter"
      style={{ animationDelay: '105ms' }}
    >
      <div className="pointer-events-none absolute -top-24 -end-20 w-72 h-72 rounded-full bg-[#00E5FF]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -start-20 w-64 h-64 rounded-full bg-[#B26BFF]/10 blur-3xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold tracking-widest text-[#00E5FF]">
            <Activity className="w-4 h-4" />
            <span>{t('ESTIMATED 1RM TREND (30D)')}</span>
          </div>
          <p className="mt-1 text-xs text-[#8B949E]">
            {t('Peak daily Epley 1RM across main lifts')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {LIFT_SERIES.map((lift) => {
            const active = visibleLifts[lift.key];
            const stat = liftStats[lift.key];
            return (
              <button
                key={lift.key}
                type="button"
                onClick={() => toggleLift(lift.key)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-[#0D1119]/90 border-white/15 text-[#F0F6FC]'
                    : 'bg-[#0D1119]/40 border-white/5 text-[#6E7681] opacity-60 hover:opacity-90'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: lift.color }}
                />
                <span>{t(lift.label)}</span>
                {stat.latest !== null && (
                  <span className="font-mono-num text-[11px] font-extrabold text-[#F0F6FC]">
                    {formatPlainWeight(stat.latest)}
                    <span className="text-[10px] font-semibold text-[#8B949E] ms-0.5">
                      {unitLabel}
                    </span>
                  </span>
                )}
                {stat.delta !== null && stat.delta !== 0 && (
                  <span
                    className={`font-mono-num text-[10px] font-bold ${
                      stat.delta > 0 ? 'text-[#00E676]' : 'text-[#FF5252]'
                    }`}
                  >
                    {stat.delta > 0 ? `+${formatPlainWeight(stat.delta)}` : formatPlainWeight(stat.delta)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative mt-4 h-[230px] w-full" dir="ltr">
        {hasAnyData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
              <defs>
                {LIFT_SERIES.map((lift) => (
                  <linearGradient key={lift.gradientId} id={lift.gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={lift.color} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={lift.color} stopOpacity={0.0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="shortDate"
                tick={{ fill: '#8B949E', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={28}
              />
              <YAxis
                tick={{ fill: '#8B949E', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={44}
                domain={[
                  (dataMin: number) => Math.max(0, Math.floor(dataMin * 0.9)),
                  (dataMax: number) => Math.ceil(dataMax * 1.05),
                ]}
              />
              <Tooltip
                cursor={{ stroke: 'rgba(255,255,255,0.16)', strokeWidth: 1, strokeDasharray: '4 4' }}
                content={
                  <TrendTooltip
                    unitLabel={unitLabel}
                    estLabel={t('Est. 1RM')}
                    labelMap={labelMap}
                  />
                }
              />
              {LIFT_SERIES.map((lift) =>
                visibleLifts[lift.key] ? (
                  <Area
                    key={lift.key}
                    type="monotone"
                    dataKey={lift.key}
                    stroke={lift.color}
                    strokeWidth={2.5}
                    fill={`url(#${lift.gradientId})`}
                    fillOpacity={1}
                    connectNulls
                    dot={{ r: 3.5, strokeWidth: 2, stroke: lift.color, fill: '#0D1119' }}
                    activeDot={{ r: 5.5, strokeWidth: 2, stroke: '#F0F6FC', fill: lift.color }}
                    isAnimationActive
                  />
                ) : null,
              )}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className="h-full rounded-xl bg-[#0D1119]/75 border border-dashed border-white/10 flex flex-col items-center justify-center text-center px-6"
          >
            <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/25 flex items-center justify-center text-[#00E5FF] mb-3">
              <Activity className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-[#F0F6FC]">
              {t('No main lift logs in the last 30 days')}
            </div>
            <p className="mt-1 text-xs text-[#8B949E] max-w-md">
              {t('Log Bench, Squat, or Deadlift sets to see your 30-day estimated 1RM progression.')}
            </p>
          </div>
        )}
      </div>

      {/* Time Estimate to Target 1RM */}
      <div className="relative mt-4 pt-3.5 border-t border-white/10">
        <div className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-widest text-[#8B949E] mb-2.5">
          <Clock className="w-3.5 h-3.5 text-[#FF9E40]" />
          <span>{t('TIME TO TARGET 1RM')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {targetEstimates.map(({ key, label, color, target, eta }) => {
            const parts = eta.daysRemaining !== null ? formatEtaParts(eta.daysRemaining) : null;
            return (
              <div
                key={key}
                className="rounded-xl bg-[#0D1119]/80 border border-white/10 px-3 py-2.5 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-xs font-extrabold text-[#F0F6FC] truncate">
                      {t(label)}
                    </span>
                    <span className="text-[10px] font-mono-num text-[#8B949E]">
                      ({formatPlainWeight(target)} {unitLabel})
                    </span>
                  </div>
                  <div className="mt-0.5 text-[10px] text-[#8B949E] font-mono-num truncate">
                    {eta.status === 'trend_pace' && eta.weeklyRateDisplay !== null
                      ? `+${formatPlainWeight(eta.weeklyRateDisplay)} ${unitLabel}/${t('wk')} ${t('pace')}`
                      : eta.status === 'typical_pace'
                        ? t('typical pace')
                        : eta.status === 'reached' && eta.currentBestEst1RM !== null
                          ? `${t('Est. 1RM')}: ${formatPlainWeight(eta.currentBestEst1RM)} ${unitLabel}`
                          : t('No logs yet')}
                  </div>
                </div>

                <div className="shrink-0 text-end">
                  {eta.status === 'reached' ? (
                    <span className="inline-block px-2 py-0.5 rounded-lg bg-[#00E676]/15 text-[#00E676] text-[11px] font-extrabold">
                      {t('Goal reached!')}
                    </span>
                  ) : parts ? (
                    <span
                      className="inline-block px-2 py-0.5 rounded-lg text-[11px] font-extrabold font-mono-num"
                      style={{
                        backgroundColor: `${color}1A`,
                        color,
                      }}
                    >
                      {parts.value} {t(parts.unitKey)}
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-[#6E7681]">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
