import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { auth, signInWithGoogle, logoutUser, onAuthStateChanged, User } from '../services/firebase';
import { useI18n } from '../i18n/I18nContext';

export const UserAuthBadge: React.FC = () => {
  const { t } = useI18n();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign in error:', err);
    } finally {
      setLoading(false);
      setShowDropdown(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
      setShowDropdown(false);
    }
  };

  if (!user) {
    return (
      <button
        type="button"
        onClick={handleLogin}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2 rounded-full bg-[#161B24] border border-white/15 text-[#F0F6FC] text-xs font-semibold hover:bg-[#1E2532] hover:border-white/30 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        <span>{t('Sign in with Google')}</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#161B24] border border-white/10 hover:border-[#FF2D55]/50 transition-all cursor-pointer"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full object-cover" />
        ) : (
          <span className="w-6 h-6 rounded-full bg-[#FF2D55]/20 text-[#FF2D55] flex items-center justify-center text-xs font-bold">
            {user.displayName?.[0] || user.email?.[0] || 'U'}
          </span>
        )}
        <span className="hidden sm:inline text-xs font-semibold text-[#F0F6FC] max-w-[120px] truncate">
          {user.displayName || user.email}
        </span>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#161B24] border border-white/10 shadow-2xl py-2 z-50">
          <div className="px-4 py-2 border-b border-white/10">
            <p className="text-xs font-bold text-[#F0F6FC] truncate">{user.displayName || 'Athlete'}</p>
            <p className="text-[10px] text-[#8B949E] truncate">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#FF2D55] hover:bg-white/5 transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('Sign Out')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
