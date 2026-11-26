import React, { useState } from 'react';
import { canSelfUpdate, checkForAppUpdate, installAppUpdate, UpdateCheckResult } from '../services/appUpdate';
import { useI18n } from '../i18n/I18nContext';

type Stage = 'idle' | 'checking' | 'upToDate' | 'available' | 'downloading' | 'installing' | 'permission' | 'error';

export const AppUpdateSection: React.FC = () => {
  const { t } = useI18n();
  const [stage, setStage] = useState<Stage>('idle');
  const [info, setInfo] = useState<UpdateCheckResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!canSelfUpdate()) {
    return <p className="text-xs text-[#6E7681]">{t('Updates are available in the Android app only.')}</p>;
  }

  const check = async () => {
    setStage('checking');
    setMessage(null);
    try {
      const result = await checkForAppUpdate();
      setInfo(result);
      if (result.error) {
        setStage('error');
        setMessage(result.error);
      } else {
        setStage(result.available ? 'available' : 'upToDate');
      }
    } catch (err) {
      setStage('error');
      setMessage(err instanceof Error ? err.message : String(err));
    }
  };

  const install = () => {
    setStage('downloading');
    setMessage(null);
    installAppUpdate((next, detail) => {
      if (next === 'error') {
        setStage('error');
        setMessage(detail);
      } else if (next === 'downloading' || next === 'installing' || next === 'permission') {
        setStage(next);
      }
    });
  };

  const statusText: Partial<Record<Stage, string>> = {
    checking: t('Checking for updates…'),
    upToDate: t('You are up to date.'),
    available: t('Update available'),
    downloading: t('Downloading update…'),
    installing: t('Confirm the install on the next screen.'),
    permission: t('Allow BenchPR to install apps, then tap Install update again.'),
  };

  const busy = stage === 'checking' || stage === 'downloading' || stage === 'installing';

  return (
    <div className="flex flex-col gap-2">
      {info?.version && (
        <p className="text-xs text-[#8B949E]">
          {t('Version')} <span className="font-mono-num text-[#F0F6FC]">{info.version}</span>
        </p>
      )}

      <button
        type="button"
        onClick={check}
        disabled={busy}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#161B24] border border-white/10 text-xs font-bold text-[#00E5FF] hover:bg-[#1E2532] hover:border-[#00E5FF]/40 transition-all whitespace-nowrap cursor-pointer disabled:opacity-60"
      >
        <span>{t('Check for updates')}</span>
      </button>

      {stage === 'available' && (
        <button
          type="button"
          onClick={install}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-[#FF2D55] to-[#FF6B8B] text-[#080A0F] text-xs font-bold whitespace-nowrap cursor-pointer"
        >
          <span>{t('Install update')}</span>
        </button>
      )}

      {statusText[stage] && <p className="text-xs text-[#C9D1D9]">{statusText[stage]}</p>}
      {stage === 'error' && message && <p className="text-xs font-semibold text-[#FF2D55]">{message}</p>}
    </div>
  );
};
