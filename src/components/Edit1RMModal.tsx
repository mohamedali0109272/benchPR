import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { WeightUnit } from '../types/models';

export type TargetLiftKind = 'bench' | 'squat' | 'deadlift';

interface Edit1RMModalProps {
  currentBench1RM: number;
  currentSquat1RM: number;
  currentDeadlift1RM: number;
  currentUnit: WeightUnit;
  initialFocusLift?: TargetLiftKind;
  onClose: () => void;
  onSave: (targets: { bench: number; squat: number; deadlift: number; unit: WeightUnit }) => void;
}

export const Edit1RMModal: React.FC<Edit1RMModalProps> = ({
  currentBench1RM,
  currentSquat1RM,
  currentDeadlift1RM,
  currentUnit,
  initialFocusLift = 'bench',
  onClose,
  onSave,
}) => {
  const { t } = useI18n();
  const [benchText, setBenchText] = useState(currentBench1RM.toString());
  const [squatText, setSquatText] = useState(currentSquat1RM.toString());
  const [deadliftText, setDeadliftText] = useState(currentDeadlift1RM.toString());
  const [selectedUnit, setSelectedUnit] = useState<WeightUnit>(currentUnit);

  const parsePositive = (raw: string, fallback: number) => {
    const parsed = parseFloat(raw.replace(',', '.'));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      bench: parsePositive(benchText, currentBench1RM),
      squat: parsePositive(squatText, currentSquat1RM),
      deadlift: parsePositive(deadliftText, currentDeadlift1RM),
      unit: selectedUnit,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-enter"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-[#141923] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-[#F0F6FC]">{t('Set Target PRs')}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('Close')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8B949E] hover:text-[#F0F6FC] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-[#8B949E] leading-relaxed">
            {t('Enter your goal single rep max (1RM) targets for Bench, Squat, and Deadlift.')}
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold tracking-wide text-[#FF9E40] mb-1.5">
                {t('Bench 1RM')}
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={benchText}
                onChange={(e) => setBenchText(e.target.value)}
                autoFocus={initialFocusLift === 'bench'}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0A0D13] border border-[#2A313D] text-base font-bold font-mono-num text-[#F0F6FC] focus:outline-none focus:border-[#FF6D00] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-wide text-[#00E5FF] mb-1.5">
                {t('Squat 1RM')}
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={squatText}
                onChange={(e) => setSquatText(e.target.value)}
                autoFocus={initialFocusLift === 'squat'}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0A0D13] border border-[#2A313D] text-base font-bold font-mono-num text-[#F0F6FC] focus:outline-none focus:border-[#00E5FF] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-wide text-[#B26BFF] mb-1.5">
                {t('Deadlift 1RM')}
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={deadliftText}
                onChange={(e) => setDeadliftText(e.target.value)}
                autoFocus={initialFocusLift === 'deadlift'}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0A0D13] border border-[#2A313D] text-base font-bold font-mono-num text-[#F0F6FC] focus:outline-none focus:border-[#B26BFF] transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <span className="text-sm font-medium text-[#F0F6FC]">{t('Unit:')}</span>
            <div className="inline-flex p-1 rounded-xl bg-[#0A0D13] border border-white/10 gap-1">
              {(['kg', 'lbs'] as WeightUnit[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setSelectedUnit(u)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedUnit === u
                      ? 'bg-gradient-to-r from-[#FF6D00] to-[#FF9100] text-[#080A0F] shadow-sm'
                      : 'text-[#8B949E] hover:text-[#F0F6FC]'
                  }`}
                >
                  {t(u)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#8B949E] hover:text-[#F0F6FC] hover:bg-white/5 transition-colors cursor-pointer"
          >
            {t('Cancel')}
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-sm font-extrabold bg-gradient-to-r from-[#FF6D00] to-[#FF9100] text-[#080A0F] hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,109,0,0.35)] cursor-pointer"
          >
            {t('Save Target')}
          </button>
        </div>
      </form>
    </div>
  );
};
