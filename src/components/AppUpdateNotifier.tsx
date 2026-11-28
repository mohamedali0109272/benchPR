import React, { useEffect, useState } from 'react';
import { ArrowDownToLine, Sparkles, X } from 'lucide-react';
import { checkLatestRelease, GitHubReleaseInfo, triggerAppUpdate, getActiveVersion } from '../services/appUpdater';
import { useI18n } from '../i18n/I18nContext';

export const AppUpdateNotifier: React.FC = () => {
  const { t } = useI18n();
  const [releaseInfo, setReleaseInfo] = useState<GitHubReleaseInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [installError, setInstallError] = useState<string | null>(null);

  useEffect(() => {
    window.__onUpdateProgress = (percent: number) => {
      setProgress(percent);
      setInstallError(null);
      if (percent >= 100) {
        setInstalling(false);
      }
    };
    window.__onUpdateError = (message: string) => {
      setInstalling(false);
      setProgress(null);
      setInstallError(message);
    };
    return () => {
      window.__onUpdateProgress = undefined;
      window.__onUpdateError = undefined;
    };
  }, []);

  useEffect(() => {
    const checkOnOpen = async () => {
      try {
        const info = await checkLatestRelease();
        if (info.isNewer) {
          setReleaseInfo(info);
        }
      } catch (err) {
        console.error('Startup update check failed:', err);
      }
    };
    checkOnOpen();
  }, []);

  if (!releaseInfo || dismissed) return null;

  const handleInstall = () => {
    if (!releaseInfo?.apkAsset?.downloadUrl) return;
    setInstallError(null);
    setInstalling(true);
    setProgress(0);
    triggerAppUpdate(releaseInfo.apkAsset.downloadUrl, releaseInfo.tagName);
    if (!window.AndroidAuth?.installUpdate) {
      setTimeout(() => {
        setInstalling(false);
        setProgress(null);
      }, 4000);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-enter">
      <div className="w-full max-w-md rounded-3xl bg-[#131822] border border-[#FF2D55]/50 p-6 shadow-[0_0_40px_rgba(255,45,85,0.25)] space-y-4 text-start relative">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={t('Close')}
          className="absolute top-4 end-4 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#8B949E] hover:text-[#F0F6FC] hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF2D55] to-[#FF6B8B] flex items-center justify-center text-[#080A0F] shadow-[0_0_20px_rgba(255,45,85,0.4)]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF6B8B]">
              {t('New Release Available!')}
            </span>
            <h2 className="text-lg font-black text-[#F0F6FC]">
              {releaseInfo.tagName}
            </h2>
          </div>
        </div>

        <div className="space-y-2 bg-[#1A202D] p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8B949E]">{t('Current Version')}</span>
            <span className="font-mono font-bold text-[#F0F6FC]">{getActiveVersion()}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8B949E]">{t('New Version')}</span>
            <span className="font-mono font-bold text-[#00E5FF]">{releaseInfo.tagName}</span>
          </div>
          {releaseInfo.apkAsset?.sizeBytes ? (
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8B949E]">{t('Size')}</span>
              <span className="font-mono font-bold text-[#F0F6FC]">{formatSize(releaseInfo.apkAsset.sizeBytes)}</span>
            </div>
          ) : null}
        </div>

        {releaseInfo.notes && (
          <p className="text-xs text-[#8B949E] italic line-clamp-3">
            {releaseInfo.notes}
          </p>
        )}

        {releaseInfo.apkAsset ? (
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleInstall}
              disabled={installing}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#FF6B8B] text-[#080A0F] text-sm font-black shadow-[0_0_20px_rgba(255,45,85,0.4)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
            >
              <ArrowDownToLine className="w-5 h-5 stroke-[2.5]" />
              <span>
                {installing
                  ? progress !== null && progress > 0
                    ? `${t('Downloading...')} ${progress}%`
                    : t('Starting Download...')
                  : t('Download & Install Update')}
              </span>
            </button>
            {installError && (
              <p className="text-xs font-medium text-[#FF2D55] text-center">{installError}</p>
            )}
          </div>
        ) : (
          <a
            href={releaseInfo.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1E2532] text-sm font-bold text-[#00E5FF] hover:bg-[#252F40] transition-colors"
          >
            <span>{t('View Release on GitHub')}</span>
          </a>
        )}

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-xs text-[#8B949E] hover:text-[#F0F6FC] transition-colors cursor-pointer"
          >
            {t('Remind me later')}
          </button>
        </div>
      </div>
    </div>
  );
};
