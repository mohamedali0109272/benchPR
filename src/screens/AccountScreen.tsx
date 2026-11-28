import React, { useEffect, useState } from 'react';
import { Check, Copy, Globe, LogOut, UserRound, Settings, Languages, Sliders, Scale } from 'lucide-react';
import { GoogleGlyph } from '../components/GoogleGlyph';
import { AppUpdateCard } from '../components/AppUpdateCard';
import { auth, isAndroidApp, logoutUser, onAuthStateChanged, openAndroidBrowserAuth, signInWithGoogle, User } from '../services/firebase';
import { useI18n } from '../i18n/I18nContext';
import { useWorkout } from '../context/WorkoutContext';
import { ALL_LANGUAGES } from '../i18n/AppLanguage';

export const AccountScreen: React.FC = () => {
  const { t } = useI18n();
  const {
    language,
    setLanguage,
    weightUnit,
    updateWeightUnit,
    bodyweightKg,
    updateBodyweightKg,
    target1RM,
    updateTarget1RM,
    targetSquat1RM,
    updateTargetSquat1RM,
    targetDeadlift1RM,
    updateTargetDeadlift1RM,
  } = useWorkout();

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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <h1 className="text-xl font-black tracking-wide text-[#F0F6FC]">{t('Account & Settings')}</h1>

      {/* Profile Card */}
      <div className="rounded-2xl bg-[#131822]/90 border border-white/10 p-5 sm:p-6 flex flex-col items-center text-center gap-4 animate-enter">
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={name}
            referrerPolicy="no-referrer"
            className="w-24 h-24 rounded-full object-cover border-2 border-[#FF2D55]/60 shadow-[0_0_20px_rgba(255,45,85,0.3)]"
          />
        ) : (
          <span className="w-24 h-24 rounded-full bg-[#161B24] border border-white/10 flex items-center justify-center text-[#8B949E] shadow-[0_0_20px_rgba(255,45,85,0.15)]">
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
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E676]/10 border border-[#00E676]/30 text-[11px] font-bold text-[#00E676]">
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

      {/* Language Settings Card */}
      <div className="rounded-2xl bg-[#131822]/90 border border-white/10 p-5 space-y-4 animate-enter" style={{ animationDelay: '40ms' }}>
        <div className="flex items-center gap-2.5">
          <Languages className="w-5 h-5 text-[#FF2D55]" />
          <h2 className="text-sm font-extrabold tracking-wide text-[#F0F6FC]">
            {t('Language / اللغة')}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {ALL_LANGUAGES.map((lang) => {
            const active = language.code === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF6B8B] text-[#080A0F] border-transparent shadow-[0_0_16px_rgba(255,45,85,0.35)]'
                    : 'bg-[#19202D] border-white/10 text-[#8B949E] hover:text-[#F0F6FC] hover:border-white/20'
                }`}
              >
                <span>{lang.nativeName}</span>
                {active && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* App Settings & Preferences Card */}
      <div className="rounded-2xl bg-[#131822]/90 border border-white/10 p-5 space-y-4 animate-enter" style={{ animationDelay: '80ms' }}>
        <div className="flex items-center gap-2.5">
          <Sliders className="w-5 h-5 text-[#00E5FF]" />
          <h2 className="text-sm font-extrabold tracking-wide text-[#F0F6FC]">
            {t('Preferences & Settings')}
          </h2>
        </div>

        <div className="space-y-4 pt-1">
          {/* Weight Unit Toggle */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#F0F6FC]">{t('Weight Unit')}</span>
              <p className="text-[11px] text-[#8B949E]">{t('Choose kg or lbs for lifts')}</p>
            </div>
            <div className="flex items-center gap-1 bg-[#19202D] p-1 rounded-xl border border-white/10">
              {(['kg', 'lbs'] as const).map((unit) => {
                const active = weightUnit === unit;
                return (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => updateWeightUnit(unit)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      active
                        ? 'bg-[#00E5FF] text-[#080A0F] shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                        : 'text-[#8B949E] hover:text-[#F0F6FC]'
                    }`}
                  >
                    {unit}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-white/10" />

          {/* Bodyweight */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#F0F6FC]">{t('Bodyweight')}</span>
              <p className="text-[11px] text-[#8B949E]">{t('Used for relative strength & rankings')}</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="30"
                max="300"
                step="0.5"
                value={bodyweightKg}
                onChange={(e) => updateBodyweightKg(parseFloat(e.target.value) || 75)}
                aria-label={t('Bodyweight')}
                className="w-20 px-3 py-1.5 rounded-xl bg-[#19202D] border border-white/10 text-xs font-mono-num text-[#F0F6FC] text-center focus:outline-none focus:border-[#00E5FF]"
              />
              <span className="text-xs font-bold text-[#8B949E]">kg</span>
            </div>
          </div>

          <hr className="border-white/10" />

          {/* Target PRs Settings */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#F0F6FC]">{t('Target 1RM Goals')}</span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-[#FF2D55] font-bold block mb-1">{t('Bench')}</label>
                <input
                  type="number"
                  min="20"
                  max="500"
                  value={target1RM}
                  onChange={(e) => updateTarget1RM(parseFloat(e.target.value) || 100)}
                  aria-label={t('Bench target 1RM')}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-[#19202D] border border-white/10 text-xs font-mono-num text-[#F0F6FC] text-center focus:outline-none focus:border-[#FF2D55]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#00E5FF] font-bold block mb-1">{t('Squat')}</label>
                <input
                  type="number"
                  min="20"
                  max="600"
                  value={targetSquat1RM}
                  onChange={(e) => updateTargetSquat1RM(parseFloat(e.target.value) || 140)}
                  aria-label={t('Squat target 1RM')}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-[#19202D] border border-white/10 text-xs font-mono-num text-[#F0F6FC] text-center focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#B26BFF] font-bold block mb-1">{t('Deadlift')}</label>
                <input
                  type="number"
                  min="20"
                  max="700"
                  value={targetDeadlift1RM}
                  onChange={(e) => updateTargetDeadlift1RM(parseFloat(e.target.value) || 180)}
                  aria-label={t('Deadlift target 1RM')}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-[#19202D] border border-white/10 text-xs font-mono-num text-[#F0F6FC] text-center focus:outline-none focus:border-[#B26BFF]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* App Updates Card */}
      <div className="space-y-2 animate-enter" style={{ animationDelay: '120ms' }}>
        <h2 className="text-sm font-extrabold tracking-wide text-[#F0F6FC]">{t('App Updates')}</h2>
        <AppUpdateCard />
      </div>
    </div>
  );
};
