import React, { useState } from 'react';
import { LogIn, LogOut } from 'lucide-react';
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
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#FF2D55] to-[#FF6B8B] text-[#080A0F] text-xs font-bold shadow-[0_0_16px_rgba(255,45,85,0.35)] hover:scale-[1.02] transition-transform cursor-pointer whitespace-nowrap shrink-0"
      >
        <LogIn className="w-4 h-4 stroke-[2.5]" />
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
