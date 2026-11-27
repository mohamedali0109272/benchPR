export interface GitHubReleaseAsset {
  name: string;
  downloadUrl: string;
  sizeBytes: number;
}

export interface GitHubReleaseInfo {
  tagName: string;
  releaseName: string;
  publishedAt: string;
  notes: string;
  htmlUrl: string;
  apkAsset: GitHubReleaseAsset | null;
  isNewer: boolean;
}

export const CURRENT_APP_VERSION = import.meta.env.VITE_APP_VERSION || 'v1.0.20261126';
const INSTALLED_VERSION_KEY = 'benchpr_installed_version';
const GITHUB_REPO = 'mohamedali0109272/benchPR';

function parseVersionParts(tag: string): number[] {
  return tag
    .replace(/^v/i, '')
    .split('.')
    .map((part) => parseInt(part, 10) || 0);
}

export function isReleaseNewer(remoteTag: string, currentTag: string): boolean {
  if (!remoteTag || remoteTag === currentTag) return false;
  const remote = parseVersionParts(remoteTag);
  const current = parseVersionParts(currentTag);
  const len = Math.max(remote.length, current.length);
  for (let i = 0; i < len; i++) {
    const r = remote[i] ?? 0;
    const c = current[i] ?? 0;
    if (r > c) return true;
    if (r < c) return false;
  }
  return false;
}

export function getActiveVersion(): string {
  if (import.meta.env.VITE_APP_VERSION) {
    return import.meta.env.VITE_APP_VERSION;
  }
  try {
    const stored = localStorage.getItem(INSTALLED_VERSION_KEY);
    if (stored && isReleaseNewer(stored, CURRENT_APP_VERSION)) {
      return stored;
    }
    return CURRENT_APP_VERSION;
  } catch {
    return CURRENT_APP_VERSION;
  }
}

export function setActiveVersion(version: string): void {
  try {
    localStorage.setItem(INSTALLED_VERSION_KEY, version);
  } catch {
    // ignore quota
  }
}

export async function checkLatestRelease(): Promise<GitHubReleaseInfo> {
  const current = getActiveVersion();
  const url = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub release check failed (${response.status})`);
  }

  const data = await response.json();
  const tagName = data.tag_name as string;
  const releaseName = (data.name as string) || tagName;
  const publishedAt = data.published_at as string;
  const notes = (data.body as string) || '';
  const htmlUrl = data.html_url as string;

  let apkAsset: GitHubReleaseAsset | null = null;
  if (Array.isArray(data.assets)) {
    const asset = data.assets.find(
      (a: { name?: string; browser_download_url?: string }) =>
        a.name?.endsWith('.apk') || a.browser_download_url?.endsWith('.apk'),
    );
    if (asset) {
      apkAsset = {
        name: asset.name || 'app-debug.apk',
        downloadUrl: asset.browser_download_url || '',
        sizeBytes: asset.size || 0,
      };
    }
  }

  const isNewer = isReleaseNewer(tagName, current);

  return {
    tagName,
    releaseName,
    publishedAt,
    notes,
    htmlUrl,
    apkAsset,
    isNewer,
  };
}

export function triggerAppUpdate(apkUrl: string, targetVersion?: string): void {
  if (window.AndroidAuth?.installUpdate) {
    // On Android, the newly installed APK carries its own compiled VITE_APP_VERSION
    window.AndroidAuth.installUpdate(apkUrl);
  } else {
    if (targetVersion) {
      setActiveVersion(targetVersion);
    }
    window.location.href = apkUrl;
  }
}
