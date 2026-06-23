import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginScreen } from './components/LoginScreen';
import { Home } from './pages/Home';
import { AuthProvider, useAuth } from './lib/auth';
import { UserDataProvider, useUserData } from './lib/userData';
import type { AppContextType } from './types';

const Stats = lazy(() => import('./pages/Stats').then((m) => ({ default: m.Stats })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));

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
  const {
    records,
    settings,
    status,
    error,
    addRecord,
    deleteRecord,
    editRecord,
    updateSettings,
    importData,
  } = useUserData();

  if (status === 'loading') return <PageFallback />;

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md shadow-sm">
          <h2 className="font-bold text-red-700 mb-2">データの読み込みに失敗しました</h2>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <p className="text-xs text-slate-500">
            Firebase Console で Firestore Database が有効になっているか、セキュリティルールが正しく設定されているかをご確認ください。
          </p>
        </div>
      </div>
    );
  }

  const contextValue: AppContextType = {
    records,
    settings,
    onAddRecord: addRecord,
    onDeleteRecord: deleteRecord,
    onEditRecord: editRecord,
    onUpdateSettings: updateSettings,
    onImportData: importData,
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
        <UserDataProvider>
          <AppShell />
        </UserDataProvider>
      </AuthGate>
    </AuthProvider>
  );
}

export default App;
