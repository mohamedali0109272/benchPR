import React from 'react';
import { Check, X } from 'lucide-react';
import { ALL_LANGUAGES } from '../i18n/AppLanguage';
import { useI18n } from '../i18n/I18nContext';
import { AppLanguage } from '../types/models';

interface LanguageModalProps {
  current: AppLanguage;
  onSelect: (lang: AppLanguage) => void;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({ current, onSelect, onClose }) => {
  const { t } = useI18n();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-enter"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-[#141923] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-base font-bold text-[#F0F6FC]">{t('Language')}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('Close')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8B949E] hover:text-[#F0F6FC] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2.5">
          {ALL_LANGUAGES.map((option) => {
            const selected = option.code === current.code;
            return (
              <button
                key={option.code}
                type="button"
                onClick={() => {
                  onSelect(option);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all active:scale-[0.98] cursor-pointer ${
                  selected
                    ? 'bg-[#FF2D55]/15 border-[#FF2D55] text-[#F0F6FC]'
                    : 'bg-[#1A202B] border-white/10 text-[#8B949E] hover:text-[#F0F6FC] hover:border-white/20'
                }`}
              >
                <span className="text-base font-bold">{option.nativeName}</span>
                {selected && (
                  <span className="w-6 h-6 rounded-full bg-[#FF2D55] text-[#080A0F] flex items-center justify-center">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="px-4 pb-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-[#8B949E] hover:text-[#F0F6FC] transition-colors cursor-pointer"
          >
            {t('Cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};
