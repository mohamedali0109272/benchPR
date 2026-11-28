import React, { useMemo, useState } from 'react';
import { Calculator, Minus, Plus, RotateCcw, X } from 'lucide-react';
import { RankingEngine } from '../data/RankingEngine';
import { useI18n } from '../i18n/I18nContext';
import { WeightUnit } from '../types/models';

interface PlateCalculatorModalProps {
  initialWeight?: number;
  unit: WeightUnit;
  onClose: () => void;
  onSelectWeight?: (weight: number) => void;
}

const STANDARD_PLATES: Record<WeightUnit, number[]> = {
  kg: [25, 20, 15, 10, 5, 2.5, 1.25],
  lbs: [45, 35, 25, 10, 5, 2.5],
};

const BARBELL_OPTIONS: Record<WeightUnit, number[]> = {
  kg: [20, 15, 10],
  lbs: [45, 35, 15],
};

const ENABLED_PLATES_STORAGE_PREFIX = 'benchpr_enabled_plates_v1_';

function loadEnabledPlates(unit: WeightUnit): number[] {
  const defaults = STANDARD_PLATES[unit];
  try {
    const raw = localStorage.getItem(`${ENABLED_PLATES_STORAGE_PREFIX}${unit}`);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaults;
    const valid = parsed.filter((n): n is number => typeof n === 'number' && defaults.includes(n));
    return valid.length > 0 ? valid.sort((a, b) => b - a) : defaults;
  } catch {
    return defaults;
  }
}

function saveEnabledPlates(unit: WeightUnit, plates: number[]): void {
  try {
    localStorage.setItem(`${ENABLED_PLATES_STORAGE_PREFIX}${unit}`, JSON.stringify(plates));
  } catch {
    // ignore quota issues
  }
}

function formatNum(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
}

function mapBarbellForUnit(weight: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return weight;
  if (to === 'lbs') {
    if (weight === 20) return 45;
    if (weight === 15) return 35;
    if (weight === 10) return 15;
    return BARBELL_OPTIONS.lbs[0];
  }
  if (weight === 45) return 20;
  if (weight === 35) return 15;
  if (weight === 15) return 10;
  return BARBELL_OPTIONS.kg[0];
}

interface PlateBreakdownItem {
  plate: number;
  perSide: number;
  totalPlates: number;
}

function computePlateBreakdown(
  target: number,
  barbell: number,
  enabledPlates: number[],
): {
  items: PlateBreakdownItem[];
  perSideTotalWeight: number;
  actualTotal: number;
  totalPlateCount: number;
  remainderTotal: number;
  nextHigherTotal: number | null;
} {
  const sorted = [...enabledPlates].sort((a, b) => b - a);
  if (sorted.length === 0 || target <= barbell) {
    const minInc = sorted.length > 0 ? sorted[sorted.length - 1] * 2 : 0;
    return {
      items: [],
      perSideTotalWeight: 0,
      actualTotal: barbell,
      totalPlateCount: 0,
      remainderTotal: Math.max(0, Math.round((target - barbell) * 100) / 100),
      nextHigherTotal: minInc > 0 ? Math.round((barbell + minInc) * 100) / 100 : null,
    };
  }

  const perSideTarget = (target - barbell) / 2;
  let rem = perSideTarget;
  const items: PlateBreakdownItem[] = [];

  for (const plate of sorted) {
    if (rem <= 0.0001) break;
    const count = Math.floor((rem + 0.0001) / plate);
    if (count > 0) {
      items.push({
        plate,
        perSide: count,
        totalPlates: count * 2,
      });
      rem = Math.round((rem - count * plate) * 1000) / 1000;
    }
  }

  const perSideTotalWeight = Math.round(items.reduce((sum, item) => sum + item.plate * item.perSide, 0) * 100) / 100;
  const actualTotal = Math.round((barbell + perSideTotalWeight * 2) * 100) / 100;
  const totalPlateCount = items.reduce((sum, item) => sum + item.totalPlates, 0);
  const remainderTotal = Math.round((target - actualTotal) * 100) / 100;
  const smallestInc = sorted[sorted.length - 1] * 2;
  const nextHigherTotal =
    remainderTotal > 0.01 ? Math.round((actualTotal + smallestInc) * 100) / 100 : null;

  return {
    items,
    perSideTotalWeight,
    actualTotal,
    totalPlateCount,
    remainderTotal,
    nextHigherTotal,
  };
}

function getPlateStyle(plate: number, unit: WeightUnit): { bg: string; widthPx: number; heightPx: number } {
  if (unit === 'kg') {
    switch (plate) {
      case 25:
        return { bg: 'bg-[#FF2D55] text-white border-[#FF6B8B]', widthPx: 26, heightPx: 84 };
      case 20:
        return { bg: 'bg-[#00A8FF] text-[#080A0F] border-[#5CD1FF]', widthPx: 24, heightPx: 80 };
      case 15:
        return { bg: 'bg-[#FFC21A] text-[#080A0F] border-[#FFE066]', widthPx: 22, heightPx: 72 };
      case 10:
        return { bg: 'bg-[#00E676] text-[#080A0F] border-[#69F0AE]', widthPx: 20, heightPx: 62 };
      case 5:
        return { bg: 'bg-[#F0F6FC] text-[#080A0F] border-white', widthPx: 18, heightPx: 50 };
      case 2.5:
        return { bg: 'bg-[#262E3D] text-[#F0F6FC] border-[#8B949E]', widthPx: 22, heightPx: 42 };
      case 1.25:
      default:
        return { bg: 'bg-[#8D939C] text-[#080A0F] border-[#C9D1D9]', widthPx: 24, heightPx: 36 };
    }
  }

  switch (plate) {
    case 45:
      return { bg: 'bg-[#FF2D55] text-white border-[#FF6B8B]', widthPx: 26, heightPx: 84 };
    case 35:
      return { bg: 'bg-[#FFC21A] text-[#080A0F] border-[#FFE066]', widthPx: 24, heightPx: 74 };
    case 25:
      return { bg: 'bg-[#00E676] text-[#080A0F] border-[#69F0AE]', widthPx: 22, heightPx: 64 };
    case 10:
      return { bg: 'bg-[#F0F6FC] text-[#080A0F] border-white', widthPx: 20, heightPx: 52 };
    case 5:
      return { bg: 'bg-[#00A8FF] text-[#080A0F] border-[#5CD1FF]', widthPx: 18, heightPx: 44 };
    case 2.5:
    default:
      return { bg: 'bg-[#8D939C] text-[#080A0F] border-[#C9D1D9]', widthPx: 22, heightPx: 38 };
  }
}

export const PlateCalculatorModal: React.FC<PlateCalculatorModalProps> = ({
  initialWeight = 0,
  unit,
  onClose,
  onSelectWeight,
}) => {
  const { t } = useI18n();
  const initialTarget = initialWeight > 0 ? initialWeight : unit === 'kg' ? 100 : 225;

  const [activeUnit, setActiveUnit] = useState<WeightUnit>(unit);
  const [prevPropUnit, setPrevPropUnit] = useState<WeightUnit>(unit);
  const [targetWeight, setTargetWeight] = useState<number>(initialTarget);
  const [targetWeightText, setTargetWeightText] = useState<string>(() => formatNum(initialTarget));
  const [barbellWeight, setBarbellWeight] = useState<number>(BARBELL_OPTIONS[unit][0]);
  const [enabledPlates, setEnabledPlates] = useState<number[]>(() => loadEnabledPlates(unit));

  const switchUnit = (nextUnit: WeightUnit, fromUnit: WeightUnit) => {
    const nextBarbell = mapBarbellForUnit(barbellWeight, fromUnit, nextUnit);
    const nextEnabled = loadEnabledPlates(nextUnit);
    const converted =
      targetWeight > 0
        ? RankingEngine.convertWeight(targetWeight, fromUnit, nextUnit, 0.5)
        : nextUnit === 'kg'
          ? 100
          : 225;
    setActiveUnit(nextUnit);
    setBarbellWeight(nextBarbell);
    setEnabledPlates(nextEnabled);
    setTargetWeight(converted);
    setTargetWeightText(formatNum(converted));
  };

  if (unit !== prevPropUnit) {
    setPrevPropUnit(unit);
    if (unit !== activeUnit) {
      switchUnit(unit, activeUnit);
    }
  }

  const standardPlates = STANDARD_PLATES[activeUnit];
  const barbellOptions = BARBELL_OPTIONS[activeUnit];

  const updateTargetWeight = (next: number) => {
    const rounded = Math.max(0, Math.round(next * 100) / 100);
    setTargetWeight(rounded);
    setTargetWeightText(formatNum(rounded));
  };

  const minIncrement = useMemo(() => {
    const smallest = enabledPlates.length > 0 ? Math.min(...enabledPlates) : standardPlates[standardPlates.length - 1];
    return Math.round(smallest * 2 * 100) / 100;
  }, [enabledPlates, standardPlates]);

  const breakdown = useMemo(
    () => computePlateBreakdown(targetWeight, barbellWeight, enabledPlates),
    [targetWeight, barbellWeight, enabledPlates],
  );

  const convertedForSet =
    activeUnit === unit
      ? breakdown.actualTotal
      : RankingEngine.convertWeight(breakdown.actualTotal, activeUnit, unit, 0.5);

  const togglePlateAvailability = (plate: number) => {
    setEnabledPlates((prev) => {
      const exists = prev.includes(plate);
      if (exists && prev.length <= 1) return prev;
      const next = exists
        ? prev.filter((p) => p !== plate)
        : [...prev, plate].sort((a, b) => b - a);
      saveEnabledPlates(activeUnit, next);
      return next;
    });
  };

  const stepByIncrement = (direction: 1 | -1) => {
    const base = Math.max(barbellWeight, targetWeight);
    const next =
      direction === 1
        ? breakdown.actualTotal + minIncrement
        : Math.max(barbellWeight, breakdown.remainderTotal > 0.01 ? breakdown.actualTotal : base - minIncrement);
    updateTargetWeight(next);
  };

  const adjustByPlatePair = (plate: number, sign: 1 | -1) => {
    const next = Math.max(barbellWeight, targetWeight + sign * plate * 2);
    updateTargetWeight(next);
  };

  const leftSleevePlates = useMemo(
    () =>
      breakdown.items.flatMap(({ plate, perSide }) =>
        Array.from({ length: perSide }).map((_, idx) => ({ plate, key: `l_${plate}_${idx}` })),
      ),
    [breakdown.items],
  );

  const rightSleevePlates = useMemo(
    () =>
      breakdown.items.flatMap(({ plate, perSide }) =>
        Array.from({ length: perSide }).map((_, idx) => ({ plate, key: `r_${plate}_${idx}` })),
      ),
    [breakdown.items],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-enter"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#131822] border border-white/15 p-5 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.6)] space-y-5 text-start relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('Close')}
          className="absolute top-4 end-4 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#8B949E] hover:text-[#F0F6FC] hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pe-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#00E676] flex items-center justify-center text-[#080A0F] shadow-[0_0_20px_rgba(0,229,255,0.4)] shrink-0">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00E5FF]">
                {t('Barbell Setup')}
              </span>
              <h2 className="text-lg font-black text-[#F0F6FC]">
                {t('Plate Calculator')}
              </h2>
            </div>
          </div>

          <div
            className="flex items-center p-1 rounded-xl bg-[#0D1119] border border-white/10 shrink-0"
            role="group"
            aria-label={t('Weight Unit')}
          >
            {(['kg', 'lbs'] as WeightUnit[]).map((u) => {
              const active = activeUnit === u;
              return (
                <button
                  key={u}
                  type="button"
                  onClick={() => {
                    if (u !== activeUnit) {
                      switchUnit(u, activeUnit);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase transition-all cursor-pointer ${
                    active
                      ? 'bg-[#00E5FF] text-[#080A0F] shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                      : 'text-[#8B949E] hover:text-[#F0F6FC]'
                  }`}
                >
                  {t(u)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs: Target Weight with Plate Increment Steppers + Barbell Weight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-[#19202D] p-3.5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-[11px] font-bold text-[#8B949E]">
                {t('Target Weight')} ({t(activeUnit)})
              </label>
              <span className="text-[10px] font-mono font-bold text-[#00E5FF]">
                ±{formatNum(minIncrement)} {t(activeUnit)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => stepByIncrement(-1)}
                aria-label={`${t('Decrease by')} ${formatNum(minIncrement)} ${activeUnit}`}
                className="w-10 h-10 rounded-xl bg-[#0D1119] border border-white/10 flex items-center justify-center text-[#F0F6FC] hover:border-[#FF2D55]/60 hover:text-[#FF2D55] active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min="0"
                max={activeUnit === 'lbs' ? 2200 : 1000}
                step={minIncrement}
                value={targetWeightText}
                onChange={(e) => {
                  const raw = e.target.value;
                  setTargetWeightText(raw);
                  const parsed = parseFloat(raw.replace(',', '.'));
                  if (Number.isFinite(parsed) && parsed >= 0) {
                    setTargetWeight(parsed);
                  } else if (raw.trim() === '') {
                    setTargetWeight(0);
                  }
                }}
                onBlur={() => setTargetWeightText(formatNum(targetWeight))}
                aria-label={t('Target Weight')}
                className="flex-1 min-w-0 px-2 py-2 rounded-xl bg-[#0D1119] border border-white/10 text-base font-black font-mono-num text-[#F0F6FC] text-center focus:outline-none focus:border-[#00E5FF]"
              />
              <button
                type="button"
                onClick={() => stepByIncrement(1)}
                aria-label={`${t('Increase by')} ${formatNum(minIncrement)} ${activeUnit}`}
                className="w-10 h-10 rounded-xl bg-[#0D1119] border border-white/10 flex items-center justify-center text-[#F0F6FC] hover:border-[#00E676]/60 hover:text-[#00E676] active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-[#19202D] p-3.5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-[11px] font-bold text-[#8B949E]">
                {t('Barbell Weight')} ({t(activeUnit)})
              </label>
              <button
                type="button"
                onClick={() => updateTargetWeight(barbellWeight)}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8B949E] hover:text-[#F0F6FC] cursor-pointer"
                title={t('Reset to bar only')}
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t('Bar Only')}</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              {barbellOptions.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBarbellWeight(b)}
                  className={`flex-1 h-10 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                    barbellWeight === b
                      ? 'bg-[#00E5FF] text-[#080A0F] shadow-[0_0_12px_rgba(0,229,255,0.25)]'
                      : 'bg-[#0D1119] border border-white/10 text-[#8B949E] hover:text-[#F0F6FC]'
                  }`}
                >
                  {b} {t(activeUnit)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Standard Plate Increments Selector (Enable/Disable gym plates + Quick +1 pair) */}
        <div className="bg-[#19202D]/70 rounded-2xl border border-white/10 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-[#8B949E]">
              {t('Plate Increments (Tap to toggle / + to add pair)')}
            </span>
            <span className="text-[10px] font-mono font-bold text-[#6E7681]">
              {t('Min step')}: {formatNum(minIncrement)} {t(activeUnit)}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {standardPlates.map((plate) => {
              const enabled = enabledPlates.includes(plate);
              const activeItem = breakdown.items.find((i) => i.plate === plate);
              return (
                <div
                  key={plate}
                  className={`inline-flex items-center rounded-xl border overflow-hidden transition-all ${
                    enabled
                      ? 'bg-[#0D1119] border-white/15'
                      : 'bg-[#0D1119]/40 border-white/5 opacity-45'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => togglePlateAvailability(plate)}
                    className={`px-2.5 py-1.5 text-xs font-mono font-bold cursor-pointer transition-colors ${
                      activeItem
                        ? 'text-[#00E5FF]'
                        : enabled
                          ? 'text-[#F0F6FC]'
                          : 'text-[#6E7681] line-through'
                    }`}
                    title={enabled ? t('Click to disable plate') : t('Click to enable plate')}
                  >
                    {formatNum(plate)}
                    {activeItem ? (
                      <span className="ms-1 text-[10px] text-[#00E676]">({activeItem.totalPlates})</span>
                    ) : null}
                  </button>
                  {enabled && (
                    <button
                      type="button"
                      onClick={() => adjustByPlatePair(plate, 1)}
                      aria-label={`${t('Add pair of')} ${plate} ${activeUnit}`}
                      className="px-2 py-1.5 bg-white/5 hover:bg-[#00E5FF]/20 text-[#00E5FF] text-xs font-bold border-s border-white/10 cursor-pointer transition-colors"
                      title={`+${formatNum(plate * 2)} ${activeUnit}`}
                    >
                      +
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Barbell Visual Representation & Actual Plate Numbers */}
        <div className="bg-[#0A0D14] rounded-2xl border border-white/10 p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-[#8B949E] block">
                {t('Actual Loaded Total')}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono-num text-[#00E676]">
                  {formatNum(breakdown.actualTotal)} {t(activeUnit)}
                </span>
                {activeUnit !== unit && (
                  <span className="text-xs font-bold font-mono-num text-[#8B949E]">
                    (≈ {formatNum(convertedForSet)} {t(unit)})
                  </span>
                )}
              </div>
            </div>

            <div className="text-end">
              <span className="text-[11px] font-bold text-[#8B949E] block">
                {t('Total Plates Needed')}
              </span>
              <div className="text-sm font-black font-mono-num text-[#F0F6FC]">
                {breakdown.totalPlateCount} {t(breakdown.totalPlateCount === 1 ? 'plate' : 'plates')}
                <span className="text-xs font-semibold text-[#00E5FF] ms-1.5">
                  ({formatNum(breakdown.perSideTotalWeight)} {t(activeUnit)} / {t('side')})
                </span>
              </div>
            </div>
          </div>

          {/* Remainder / Nearest Plate-Increment Snap Notice */}
          {Math.abs(breakdown.remainderTotal) > 0.01 && targetWeight > barbellWeight && (
            <div className="rounded-xl bg-[#FFC21A]/10 border border-[#FFC21A]/35 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-[#FFC21A] font-semibold">
                {t('Exact weight unavailable with selected plates')} ({breakdown.remainderTotal > 0 ? `+${formatNum(breakdown.remainderTotal)}` : formatNum(breakdown.remainderTotal)} {t(activeUnit)})
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updateTargetWeight(breakdown.actualTotal)}
                  className="px-2 py-1 rounded-lg bg-[#FFC21A]/20 text-[#FFC21A] font-mono font-bold hover:bg-[#FFC21A]/30 cursor-pointer"
                >
                  {formatNum(breakdown.actualTotal)} {t(activeUnit)}
                </button>
                {breakdown.nextHigherTotal !== null && (
                  <button
                    type="button"
                    onClick={() => updateTargetWeight(breakdown.nextHigherTotal!)}
                    className="px-2 py-1 rounded-lg bg-[#00E5FF]/20 text-[#00E5FF] font-mono font-bold hover:bg-[#00E5FF]/30 cursor-pointer"
                  >
                    {formatNum(breakdown.nextHigherTotal)} {t(activeUnit)}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Graphical Barbell (Symmetrical, Center-Aligned, Crisp Plate Numbers) */}
          <div className="relative flex items-center justify-center py-3 min-h-[112px] bg-[#131822] rounded-xl border border-white/10 overflow-x-auto px-4">
            <div className="relative flex items-center justify-center min-w-max">
              {/* Bar shaft behind everything */}
              <div className="absolute inset-x-0 h-2.5 bg-gradient-to-b from-[#A0A8B0] to-[#6E7681] rounded-full z-0" />

              {/* Left Sleeve End */}
              <div className="w-3 h-4 bg-[#6E7681] rounded-s-sm z-10 border-e border-black/30" />

              {/* Left Plates (heaviest closest to center, ordered outward to the left) */}
              <div className="flex items-center flex-row-reverse gap-1 px-1 z-10">
                {leftSleevePlates.map(({ plate, key }) => {
                  const style = getPlateStyle(plate, activeUnit);
                  return (
                    <div
                      key={key}
                      className={`rounded-sm border flex items-center justify-center font-black font-mono-num shadow-md select-none ${style.bg}`}
                      style={{
                        width: `${style.widthPx}px`,
                        height: `${style.heightPx}px`,
                      }}
                      title={`${formatNum(plate)} ${activeUnit}`}
                    >
                      <span className="text-[9px] leading-none tracking-tighter">
                        {formatNum(plate)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Left Collar */}
              <div className="w-2.5 h-6 bg-[#8D939C] rounded-xs z-10 border-x border-black/30" />

              {/* Center Barbell */}
              <div className="w-16 sm:w-24 h-5 bg-[#484F58] rounded-xs z-10 flex items-center justify-center font-extrabold text-[10px] tracking-wider text-[#F0F6FC] border-x border-white/20 mx-0.5">
                {barbellWeight} {t(activeUnit)}
              </div>

              {/* Right Collar */}
              <div className="w-2.5 h-6 bg-[#8D939C] rounded-xs z-10 border-x border-black/30" />

              {/* Right Plates (heaviest closest to center, ordered outward to the right) */}
              <div className="flex items-center gap-1 px-1 z-10">
                {rightSleevePlates.map(({ plate, key }) => {
                  const style = getPlateStyle(plate, activeUnit);
                  return (
                    <div
                      key={key}
                      className={`rounded-sm border flex items-center justify-center font-black font-mono-num shadow-md select-none ${style.bg}`}
                      style={{
                        width: `${style.widthPx}px`,
                        height: `${style.heightPx}px`,
                      }}
                      title={`${formatNum(plate)} ${activeUnit}`}
                    >
                      <span className="text-[9px] leading-none tracking-tighter">
                        {formatNum(plate)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Right Sleeve End */}
              <div className="w-3 h-4 bg-[#6E7681] rounded-e-sm z-10 border-s border-black/30" />
            </div>
          </div>

          {/* Exact Plate Numbers Breakdown (Per Side & Total) */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider block">
              {t('Actual Plate Numbers Breakdown')}
            </span>
            {breakdown.items.length === 0 ? (
              <p className="text-xs text-[#F0F6FC] font-medium">
                {t('Bar only (no plates needed)')}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {breakdown.items.map(({ plate, perSide, totalPlates }) => {
                  const style = getPlateStyle(plate, activeUnit);
                  return (
                    <div
                      key={plate}
                      className="px-3 py-2 rounded-xl bg-[#19202D] border border-white/10 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-8 h-6 rounded-md border flex items-center justify-center text-[11px] font-black font-mono-num ${style.bg}`}
                        >
                          {formatNum(plate)}
                        </span>
                        <div>
                          <div className="text-xs font-bold font-mono-num text-[#F0F6FC]">
                            {perSide}× {formatNum(plate)} {t(activeUnit)}{' '}
                            <span className="text-[#8B949E] font-normal">/ {t('side')}</span>
                          </div>
                          <div className="text-[10px] font-semibold font-mono-num text-[#00E5FF]">
                            {totalPlates} {t('total plates')} ({formatNum(plate * totalPlates)} {t(activeUnit)})
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => adjustByPlatePair(plate, -1)}
                          aria-label={`${t('Remove pair of')} ${plate} ${activeUnit}`}
                          className="w-6 h-6 rounded-lg bg-[#0D1119] border border-white/10 flex items-center justify-center text-[#8B949E] hover:text-[#FF2D55] cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustByPlatePair(plate, 1)}
                          aria-label={`${t('Add pair of')} ${plate} ${activeUnit}`}
                          className="w-6 h-6 rounded-lg bg-[#0D1119] border border-white/10 flex items-center justify-center text-[#8B949E] hover:text-[#00E676] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          {onSelectWeight && (
            <button
              type="button"
              onClick={() => {
                onSelectWeight(convertedForSet);
                onClose();
              }}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00E676] text-[#080A0F] font-black text-xs tracking-wider shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
            >
              {t('APPLY WEIGHT TO SET')} ({formatNum(breakdown.actualTotal)} {t(activeUnit)}
              {activeUnit !== unit ? ` ≈ ${formatNum(convertedForSet)} ${t(unit)}` : ''})
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[#19202D] border border-white/10 text-xs font-bold text-[#F0F6FC] hover:bg-[#252F40] transition-colors cursor-pointer"
          >
            {t('Close')}
          </button>
        </div>
      </div>
    </div>
  );
};

