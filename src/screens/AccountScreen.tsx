import React, { useEffect, useState } from 'react';
import { Check, Copy, Globe, LogOut, UserRound } from 'lucide-react';
import { GoogleGlyph } from '../components/GoogleGlyph';
import { AppUpdateCard } from '../components/AppUpdateCard';
import { auth, isAndroidApp, logoutUser, onAuthStateChanged, openAndroidBrowserAuth, signInWithGoogle, User } from '../services/firebase';
import { useI18n } from '../i18n/I18nContext';

export const AccountScreen: React.FC = () => {
  const { t } = useI18n();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedSha, setCopiedSha] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u)), []);

  const handleSignIn = async () => {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign in error:', err);
      const code = (err as { code?: string })?.code;
      const message = err instanceof Error ? err.message : String(err);
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request' || message === 'CANCELLED') {
        setError(null);
      } else {
        setError(`${t("Couldn't sign in.")} ${code ?? message}`);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setBusy(true);
    setError(null);
    try {
      await logoutUser();
    } catch (err) {
      console.error('Sign out error:', err);
      setError(`${t("Couldn't sign out.")} ${(err as { code?: string })?.code ?? String(err)}`);
    } finally {
      setBusy(false);
    }
  };

  const name = user?.displayName || user?.email || t('Athlete');

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <h1 className="text-xl font-black tracking-wide text-[#F0F6FC]">{t('Account')}</h1>

      <div className="rounded-2xl bg-[#131822]/90 border border-white/10 p-5 sm:p-6 flex flex-col items-center text-center gap-4">
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={name}
            referrerPolicy="no-referrer"
            className="w-24 h-24 rounded-full object-cover border-2 border-[#FF2D55]/60"
          />
        ) : (
          <span className="w-24 h-24 rounded-full bg-[#161B24] border border-white/10 flex items-center justify-center text-[#8B949E]">
            {user ? (
              <span className="text-3xl font-black text-[#FF2D55]">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </span>
            ) : (
              <UserRound className="w-10 h-10" />
            )}
          </span>
        )}

        {user ? (
          <div className="min-w-0 w-full">
            <div className="text-lg font-black text-[#F0F6FC] truncate">{name}</div>
            {user.displayName && user.email && (
              <div className="text-xs text-[#8B949E] truncate mt-0.5">{user.email}</div>
            )}
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00E676]/10 border border-[#00E676]/30 text-[11px] font-bold text-[#00E676]">
              {t('Signed in with Google')}
            </div>
          </div>
        ) : (
          <div>
            <div className="text-lg font-black text-[#F0F6FC]">{t('Not signed in')}</div>
            <p className="mt-1 text-sm text-[#8B949E]">
              {t('Sign in to sync your workouts across devices.')}
            </p>
          </div>
        )}

        {user ? (
          <button
            type="button"
            onClick={handleSignOut}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#161B24] border border-white/15 text-[#FF2D55] text-xs font-bold hover:bg-[#1E2532] hover:border-[#FF2D55]/40 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('Sign Out')}</span>
          </button>
        ) : (
          <div className="flex flex-col items-center gap-3 w-full max-w-sm">
            <button
              type="button"
              onClick={handleSignIn}
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-full bg-[#161B24] border border-white/15 text-[#F0F6FC] text-sm font-semibold hover:bg-[#1E2532] hover:border-white/30 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
            >
              <GoogleGlyph className="w-5 h-5" />
              <span>{t('Sign in with Google')}</span>
            </button>

            {isAndroidApp() && (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  openAndroidBrowserAuth();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-bold hover:bg-[#00E5FF]/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Globe className="w-4 h-4" />
                <span>{t('Sign in via Browser')}</span>
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="w-full max-w-md rounded-xl bg-[#FF2D55]/10 border border-[#FF2D55]/30 p-3.5 text-start space-y-2">
            <p className="text-xs font-semibold text-[#FF2D55]">{error}</p>
            {error.includes('10') && (
              <div className="pt-2 border-t border-[#FF2D55]/20 space-y-2 text-[11px] text-[#8B949E]">
                <p className="text-[#F0F6FC] font-bold">
                  {t('Android Google Error 10:')}
                </p>
                <p>
                  {t('Tap "Sign in via Browser" above to authenticate directly, or add this permanent SHA-1 fingerprint to your Firebase project:')}
                </p>
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#080A0F] border border-white/10 font-mono text-[10px] text-[#F0F6FC] break-all">
                  <span>DA:42:E9:9F:0A:B7:C7:C9:F8:30:BF:9D:2C:3F:93:AC:BA:AA:BF:26</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('DA:42:E9:9F:0A:B7:C7:C9:F8:30:BF:9D:2C:3F:93:AC:BA:AA:BF:26');
                      setCopiedSha(true);
                      setTimeout(() => setCopiedSha(false), 2000);
                    }}
                    className="p-1 rounded text-[#00E5FF] hover:bg-white/10 shrink-0 cursor-pointer"
                    title={t('Copy SHA-1')}
                  >
                    {copiedSha ? <Check className="w-3.5 h-3.5 text-[#00E676]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-extrabold tracking-wide text-[#F0F6FC]">{t('App Updates')}</h2>
        <AppUpdateCard />
      </div>
    </div>
  );
};
