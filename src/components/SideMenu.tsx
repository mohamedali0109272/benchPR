import React, { useEffect } from 'react';
import { Globe, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
  onOpenLanguage: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ open, onClose, onOpenLanguage }) => {
  const { t, isRtl } = useI18n();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Drawer: slides in from the end edge (right in LTR, left in RTL) */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t('Settings')}
        className={`absolute top-0 bottom-0 end-0 w-72 max-w-[85vw] bg-[#0D1119] border-s border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : isRtl ? '-translate-x-full' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-white/10">
          <h2 className="text-sm font-extrabold tracking-tight text-[#F0F6FC]">{t('Settings')}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('Close')}
            className="p-1.5 rounded-lg text-[#8B949E] hover:text-[#F0F6FC] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <section className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#6E7681]">{t('Preferences')}</p>
            <button
              type="button"
              onClick={onOpenLanguage}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#161B24] border border-white/10 text-xs font-bold text-[#00E5FF] hover:bg-[#1E2532] hover:border-[#00E5FF]/40 transition-all whitespace-nowrap cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>{t('Language')}</span>
            </button>
          </section>
        </div>
      </aside>
    </div>
  );
};
