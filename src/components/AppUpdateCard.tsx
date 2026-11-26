import React, { useState } from 'react';
import { ArrowDownToLine, CheckCircle2, ExternalLink, RefreshCw, Sparkles } from 'lucide-react';
import { checkLatestRelease, getActiveVersion, GitHubReleaseInfo, triggerAppUpdate } from '../services/appUpdater';
import { useI18n } from '../i18n/I18nContext';

interface AppUpdateCardProps {
  compact?: boolean;
}

export const AppUpdateCard: React.FC<AppUpdateCardProps> = ({ compact = false }) => {
  const { t } = useI18n();
  const [currentVersion, setCurrentVersion] = useState(() => getActiveVersion());
  const [checking, setChecking] = useState(false);
  const [releaseInfo, setReleaseInfo] = useState<GitHubReleaseInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkedOnce, setCheckedOnce] = useState(false);
  const [installing, setInstalling] = useState(false);

  const handleCheckUpdate = async () => {
    setChecking(true);
    setError(null);
    try {
      const info = await checkLatestRelease();
      setReleaseInfo(info);
      setCheckedOnce(true);
      setCurrentVersion(getActiveVersion());
    } catch (err) {
      console.error('Update check failed:', err);
      setError(t('Could not check for updates. Check internet connection.'));
    } finally {
      setChecking(false);
    }
  };

  const handleInstall = () => {
    if (!releaseInfo?.apkAsset?.downloadUrl) return;
    setInstalling(true);
    triggerAppUpdate(releaseInfo.apkAsset.downloadUrl, releaseInfo.tagName);
    setTimeout(() => {
      setInstalling(false);
      setCurrentVersion(getActiveVersion());
    }, 4000);
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="rounded-xl bg-[#161B24] border border-white/10 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B949E]">
            {t('App Version')}
          </span>
          <div className="text-xs font-mono font-bold text-[#F0F6FC]">{currentVersion}</div>
        </div>

        <button
          type="button"
          onClick={handleCheckUpdate}
          disabled={checking}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E2532] border border-white/10 text-xs font-bold text-[#F0F6FC] hover:border-[#FF2D55]/40 hover:text-[#FF2D55] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin text-[#FF2D55]' : ''}`} />
          <span>{checking ? t('Checking...') : t('Check Updates')}</span>
        </button>
      </div>

      {error && <p className="text-[11px] font-medium text-[#FF2D55]">{error}</p>}

      {checkedOnce && releaseInfo && !releaseInfo.isNewer && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#00E676]/10 border border-[#00E676]/30 text-xs font-semibold text-[#00E676]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{t("You're using the latest version!")}</span>
        </div>
      )}

      {releaseInfo && releaseInfo.isNewer && (
        <div className="p-3 rounded-lg bg-[#FF2D55]/10 border border-[#FF2D55]/40 space-y-2.5 animate-enter">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#FF2D55]">
              <Sparkles className="w-3.5 h-3.5" />
              {t('New Release Available!')}
            </span>
            <span className="text-[10px] font-mono text-[#8B949E]">
              {formatDate(releaseInfo.publishedAt)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-[#F0F6FC]">{releaseInfo.tagName}</span>
            {releaseInfo.apkAsset?.sizeBytes ? (
              <span className="text-[11px] text-[#8B949E]">
                {formatSize(releaseInfo.apkAsset.sizeBytes)}
              </span>
            ) : null}
          </div>

          {!compact && releaseInfo.notes && (
            <p className="text-[11px] text-[#8B949E] line-clamp-2 italic">
              {releaseInfo.notes}
            </p>
          )}

          {releaseInfo.apkAsset ? (
            <button
              type="button"
              onClick={handleInstall}
              disabled={installing}
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-[#FF2D55] to-[#FF6B8B] text-[#080A0F] text-xs font-black shadow-[0_0_16px_rgba(255,45,85,0.4)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
            >
              <ArrowDownToLine className="w-4 h-4 stroke-[2.5]" />
              <span>{installing ? t('Starting Download...') : t('Download & Install Update')}</span>
            </button>
          ) : (
            <a
              href={releaseInfo.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#1E2532] text-xs font-bold text-[#00E5FF] hover:bg-[#252F40] transition-colors"
            >
              <span>{t('View Release on GitHub')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};
