import { AppLanguage, AppLanguageCode } from '../types/models';

export const APP_LANGUAGES: Record<AppLanguageCode, AppLanguage> = {
  en: { code: 'en', nativeName: 'English', isRtl: false },
  ar: { code: 'ar', nativeName: 'العربية', isRtl: true },
};

export const ALL_LANGUAGES: AppLanguage[] = [APP_LANGUAGES.en, APP_LANGUAGES.ar];

export function languageFromCode(code?: string | null): AppLanguage {
  if (code === 'ar') return APP_LANGUAGES.ar;
  return APP_LANGUAGES.en;
}

export function forBrowserLanguage(): AppLanguage {
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('ar')) {
    return APP_LANGUAGES.ar;
  }
  return APP_LANGUAGES.en;
}
