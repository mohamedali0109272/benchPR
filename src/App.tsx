import React, { useState } from 'react';
import { LanguageModal } from './components/LanguageModal';
import { NavigationShell } from './components/NavigationShell';
import { useWorkout, WorkoutProvider } from './context/WorkoutContext';
import { I18nProvider } from './i18n/I18nContext';
import { ExercisesScreen } from './screens/ExercisesScreen';
import { AccountScreen } from './screens/AccountScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { HomeScreen } from './screens/HomeScreen';
import { MusclesScreen } from './screens/MusclesScreen';
import { SessionScreen } from './screens/SessionScreen';
import { SplitDetailScreen } from './screens/SplitDetailScreen';
import { SplitsScreen } from './screens/SplitsScreen';
import { AppRoute } from './types/models';

const BenchPRAppContent: React.FC = () => {
  const {
    language,
    setLanguage,
    startSplitDay,
    startQuickWorkout,
  } = useWorkout();

  const [route, setRoute] = useState<AppRoute>('home');
  const [previousRoute, setPreviousRoute] = useState<AppRoute>('home');
  const [selectedSplitId, setSelectedSplitId] = useState<string>('');
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const navigate = (nextRoute: AppRoute) => {
    setPreviousRoute(route);
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openSession = () => {
    setPreviousRoute(route);
    setRoute('session');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <I18nProvider language={language}>
      <NavigationShell
        currentRoute={route}
        onNavigate={navigate}
        onOpenLanguage={() => setShowLanguageModal(true)}
      >
        {route === 'home' && (
          <HomeScreen
            onQuickStart={(exerciseId) => {
              startQuickWorkout(exerciseId);
              openSession();
            }}
            onOpenSplits={() => navigate('splits')}
            onNavigateToHistory={() => navigate('history')}
          />
        )}

        {route === 'splits' && (
          <SplitsScreen
            onOpenSplit={(splitId) => {
              setSelectedSplitId(splitId);
              navigate('split-detail');
            }}
          />
        )}

        {route === 'split-detail' && (
          <SplitDetailScreen
            splitId={selectedSplitId}
            onBack={() => navigate('splits')}
            onStartDay={(splitId, dayIndex) => {
              startSplitDay(splitId, dayIndex);
              openSession();
            }}
          />
        )}

        {route === 'muscles' && <MusclesScreen />}

        {route === 'exercises' && (
          <ExercisesScreen
            onStartExercise={(exerciseId) => {
              startQuickWorkout(exerciseId);
              openSession();
            }}
          />
        )}

        {route === 'session' && (
          <SessionScreen
            onWorkoutFinished={() => navigate('home')}
            onBackClick={() => navigate(previousRoute === 'session' ? 'home' : previousRoute)}
          />
        )}

        {route === 'history' && <HistoryScreen onBackClick={() => navigate('home')} />}

        {route === 'account' && <AccountScreen />}
      </NavigationShell>

      {showLanguageModal && (
        <LanguageModal
          current={language}
          onSelect={(lang) => setLanguage(lang)}
          onClose={() => setShowLanguageModal(false)}
        />
      )}
    </I18nProvider>
  );
};

export function App() {
  return (
    <WorkoutProvider>
      <BenchPRAppContent />
    </WorkoutProvider>
  );
}

export default App;
