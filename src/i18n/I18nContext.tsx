/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { AppLanguage } from '../types/models';
import { translateToArabic } from './ArabicTranslation';

interface I18nContextValue {
  language: AppLanguage;
  isRtl: boolean;
  locale: string;
  t: (english: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{
  language: AppLanguage;
  children: React.ReactNode;
}> = ({ language, children }) => {
  useEffect(() => {
    document.documentElement.dir = language.isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language.code;
  }, [language]);

  const t = useCallback(
    (english: string): string => {
      if (language.code === 'en' || !english) return english;
      return translateToArabic(english);
    },
    [language.code],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      isRtl: language.isRtl,
      locale: language.isRtl ? 'ar-u-nu-latn' : 'en-US',
      t,
    }),
    [language, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
