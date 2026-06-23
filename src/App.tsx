import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginScreen } from './components/LoginScreen';
import { Home } from './pages/Home';
import { AuthProvider, useAuth } from './lib/auth';
import type { LearningRecord, UserSettings, AppContextType } from './types';

const Stats = lazy(() => import('./pages/Stats').then((m) => ({ default: m.Stats })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));

const RECORDS_KEY = 'antigravity_study_records_v1';
const SETTINGS_KEY = 'antigravity_study_settings_v1';
const LEGACY_RECORDS_KEY = 'learning_records';
const LEGACY_SETTINGS_KEY = 'user_settings';

const DEFAULT_SETTINGS: UserSettings = {
  userName: 'User',
  weeklyGoalHours: 10,
  finalGoalHours: 100,
  targetSchoolName: '',
  subjectGoals: [],
};

function loadJson<T>(key: string, legacyKey: string, fallback: T): T {
  let saved = localStorage.getItem(key);
  if (!saved) {
    saved = localStorage.getItem(legacyKey);
    if (saved) localStorage.setItem(key, saved);
  }
  if (!saved) return fallback;
  try {
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}

function PageFallback() {
  return (
    <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
      読み込み中…
    </div>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  if (status === 'loading') return <PageFallback />;
  if (status !== 'signed-in') return <LoginScreen />;
  return <>{children}</>;
}

function AppShell() {
  const [records, setRecords] = useState<LearningRecord[]>(() =>
    loadJson<LearningRecord[]>(RECORDS_KEY, LEGACY_RECORDS_KEY, [])
  );

  const [settings, setSettings] = useState<UserSettings>(() =>
    loadJson<UserSettings>(SETTINGS_KEY, LEGACY_SETTINGS_KEY, DEFAULT_SETTINGS)
  );

  useEffect(() => {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleImportData = (newRecords: LearningRecord[], newSettings: UserSettings) => {
    setRecords(newRecords);
    setSettings(newSettings);
  };

  const handleAddRecord = (record: Omit<LearningRecord, 'id'>) => {
    const newRecord: LearningRecord = { ...record, id: crypto.randomUUID() };
    setRecords((prev) => [...prev, newRecord]);
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleEditRecord = (updatedRecord: LearningRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)));
  };

  const contextValue: AppContextType = {
    records,
    settings,
    onAddRecord: handleAddRecord,
    onDeleteRecord: handleDeleteRecord,
    onEditRecord: handleEditRecord,
    onUpdateSettings: setSettings,
    onImportData: handleImportData,
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout context={contextValue} />}>
          <Route index element={<Home />} />
          <Route
            path="stats"
            element={
              <Suspense fallback={<PageFallback />}>
                <Stats />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<PageFallback />}>
                <Settings />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <AppShell />
      </AuthGate>
    </AuthProvider>
  );
}

export default App;
