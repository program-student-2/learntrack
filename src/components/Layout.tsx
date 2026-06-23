import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  LayoutDashboard,
  Settings,
  GraduationCap,
  LogOut,
  Sparkles,
} from 'lucide-react';
import type { AppContextType } from '../types';
import { useAuth } from '../lib/auth';
import { BrandIcon } from './ui/BrandIcon';

interface Props {
  context: AppContextType;
}

const NAV = [
  { to: '/', label: 'ホーム', icon: LayoutDashboard, end: true, title: 'ダッシュボード' },
  { to: '/stats', label: '統計', icon: BarChart3, end: false, title: '学習統計' },
  { to: '/settings', label: '設定', icon: Settings, end: false, title: '設定' },
] as const;

export function Layout({ context }: Props) {
  const { records, settings } = context;
  const { user, signOut } = useAuth();
  const location = useLocation();

  const active = NAV.find((n) => (n.end ? n.to === location.pathname : location.pathname.startsWith(n.to)));
  const pageTitle = active?.title ?? 'LearnTrack';

  const totalMinutes = records.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const displayName = user?.displayName || settings.userName;
  const initial = (displayName.trim().charAt(0) || 'U').toUpperCase();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  return (
    <div className="min-h-screen relative font-sans text-slate-800 overflow-hidden">
      {/* Animated mesh background */}
      <AppBackground />

      <div className="relative min-h-screen flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 lg:w-72 flex-shrink-0 md:h-screen md:sticky md:top-0">
          <div className="h-full bg-white/60 backdrop-blur-2xl border-b md:border-b-0 md:border-r border-slate-200/70 flex flex-col">
            {/* Brand */}
            <div className="px-6 pt-7 pb-5">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-cyan-400 blur-md opacity-50" />
                  <BrandIcon size={40} className="relative drop-shadow-sm" />
                </div>
                <div className="leading-tight">
                  <span className="block text-lg font-extrabold tracking-tight text-slate-900">LearnTrack</span>
                  <span className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">
                    Study Tracker
                  </span>
                </div>
              </div>
            </div>

            {/* Target school chip */}
            {settings.targetSchoolName && (
              <div className="px-6 pb-5">
                <div className="relative overflow-hidden rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-3.5">
                  <div className="absolute -right-6 -top-6 w-20 h-20 bg-indigo-200/40 blur-2xl rounded-full" />
                  <div className="relative flex items-center gap-3">
                    <div className="bg-white p-1.5 rounded-lg text-indigo-600 shadow-sm border border-indigo-100">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500/80 mb-0.5">
                        Target
                      </p>
                      <p
                        className="text-sm font-bold text-indigo-900 truncate"
                        title={settings.targetSchoolName}
                      >
                        {settings.targetSchoolName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Nav */}
            <nav className="px-3 space-y-0.5 flex-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                      isActive
                        ? 'text-indigo-700 bg-white shadow-sm shadow-indigo-500/5 border border-indigo-100/70'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="nav-active-pill"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-indigo-500 to-cyan-400"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <item.icon
                        className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}
                      />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto p-4 hidden md:block">
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-900 text-white p-4 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/30 blur-2xl rounded-full" />
                <Sparkles className="w-4 h-4 text-cyan-300 mb-2" />
                <p className="text-xs text-white/70 leading-relaxed">
                  記録は <span className="font-semibold text-white">ブラウザに保存</span> されます。
                  設定からバックアップ可能。
                </p>
                <p className="text-[10px] text-white/30 mt-3 tracking-wider">v0.1.0</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col min-w-0 md:h-screen overflow-hidden">
          {/* Header */}
          <header className="bg-white/50 backdrop-blur-xl border-b border-slate-200/70 px-6 sm:px-10 py-4 flex justify-between items-center flex-shrink-0">
            <div className="min-w-0">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={pageTitle}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate"
                >
                  {pageTitle}
                </motion.h1>
              </AnimatePresence>
              <p className="text-xs text-slate-500 mt-0.5">
                {greeting()} {displayName} さん
              </p>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              <div className="hidden sm:flex items-center gap-3 bg-white/70 px-4 py-2 rounded-2xl border border-slate-200/70">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total</span>
                <span className="font-bold text-lg text-slate-900 leading-none">
                  {totalHours}
                  <span className="text-xs font-medium text-slate-500 ml-0.5 mr-1">h</span>
                  {remainingMinutes}
                  <span className="text-xs font-medium text-slate-500 ml-0.5">m</span>
                </span>
              </div>

              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-emerald-50/80 text-emerald-700 rounded-full border border-emerald-200/60">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Saved</span>
              </div>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold border border-white shadow-md shadow-indigo-500/20 overflow-hidden hover:ring-2 hover:ring-indigo-200 transition-shadow"
                  title={displayName}
                >
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    initial
                  )}
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 z-20 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="font-semibold text-slate-900 truncate">{displayName}</p>
                        {user?.email && <p className="text-xs text-slate-500 truncate">{user.email}</p>}
                      </div>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-slate-400" />
                        サインアウト
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* Content with route transition */}
          <div className="flex-1 overflow-auto">
            <div className="max-w-6xl mx-auto p-4 sm:p-8 lg:p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
                >
                  <Outlet context={context} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'こんばんは、';
  if (h < 11) return 'おはようございます、';
  if (h < 18) return 'こんにちは、';
  return 'こんばんは、';
}

function AppBackground() {
  return (
    <>
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-cyan-50/30" />
      <motion.div
        aria-hidden
        className="fixed -top-40 -left-32 w-[36rem] h-[36rem] rounded-full blur-3xl -z-10"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18), transparent 65%)' }}
        animate={{ x: [0, 60, -30, 0], y: [0, 40, 20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="fixed top-1/3 -right-40 w-[32rem] h-[32rem] rounded-full blur-3xl -z-10"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.16), transparent 65%)' }}
        animate={{ x: [0, -40, 30, 0], y: [0, -60, -20, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="fixed -bottom-40 left-1/3 w-[30rem] h-[30rem] rounded-full blur-3xl -z-10"
        style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.10), transparent 65%)' }}
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 15, 0] }}
        transition={{ duration: 34, repeat: Infinity, ease: 'easeInOut' }}
      />
    </>
  );
}

// Hook to easily use context in child pages
export function useApp() {
  return useOutletContext<AppContextType>();
}
