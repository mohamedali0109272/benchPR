// In-app updates for the Android build. The native side checks the latest GitHub release
// and downloads and installs its APK (see AppUpdater.kt). Browsers have no equivalent.

export interface UpdateCheckResult {
  available?: boolean;
  latestTag?: string;
  publishedAt?: number;
  installedAt?: number;
  version?: string;
  error?: string;
}

declare global {
  interface Window {
    AndroidUpdater?: { check: () => void; install: () => void };
    __onUpdateCheck?: (result: UpdateCheckResult) => void;
    __onUpdateStatus?: (stage: string, message: string | null) => void;
  }
}

export const canSelfUpdate = (): boolean =>
  typeof window !== 'undefined' && window.AndroidUpdater !== undefined;

export function checkForAppUpdate(): Promise<UpdateCheckResult> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error('Update check timed out')), 30000);
    window.__onUpdateCheck = (result) => {
      window.clearTimeout(timer);
      resolve(result);
    };
    window.AndroidUpdater!.check();
  });
}

export function installAppUpdate(onStatus: (stage: string, message: string | null) => void): void {
  window.__onUpdateStatus = onStatus;
  window.AndroidUpdater!.install();
}
