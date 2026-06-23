import { useState, useRef, useMemo, type ReactNode } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import { ShieldAlert, AlertCircle, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { BrandIcon } from './ui/BrandIcon';

export function LoginScreen() {
  const { status, error, signIn, signOut, user } = useAuth();

  if (status === 'unconfigured') return <UnconfiguredView />;
  if (status === 'forbidden') return <ForbiddenView email={user?.email ?? ''} onRetry={signOut} />;

  return <SignInView signIn={signIn} error={error} />;
}

/* ============================================================
 *  SIGN-IN VIEW (the ド派手 one)
 * ============================================================ */

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

function SignInView({
  signIn,
  error,
}: {
  signIn: () => Promise<void>;
  error: string | null;
}) {
  const [buttonState, setButtonState] = useState<ButtonState>('idle');

  const handleSignIn = async () => {
    if (buttonState !== 'idle') return;
    setButtonState('loading');
    try {
      await signIn();
      setButtonState('success');
      // AuthGate will unmount us shortly; success state is briefly visible during exit.
    } catch {
      setButtonState('error');
      setTimeout(() => setButtonState('idle'), 1200);
    }
  };

  return (
    <BackgroundShell>
      <FloatingParticles count={18} />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6 sm:p-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-5xl w-full">
          {/* Hero */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
            }}
            className="text-center lg:text-left order-2 lg:order-1"
          >
            <BrandLogoBlock />

            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-5"
            >
              <span className="text-white drop-shadow-[0_2px_30px_rgba(255,255,255,0.25)]">
                学習を、
              </span>
              <br />
              <span className="bg-gradient-to-r from-pink-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent">
                数字で残す。
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg text-white/70 max-w-md mx-auto lg:mx-0 mb-2"
            >
              毎日の学習時間と目標を記録し、進捗を美しく可視化する
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg text-white/70 max-w-md mx-auto lg:mx-0 mb-8"
            >
              プライベートな学習トラッカー。
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="hidden lg:flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/40"
            >
              <span className="block w-8 h-px bg-white/30" />
              Sign in to continue
            </motion.div>
          </motion.div>

          {/* Sign-in card with 3D tilt */}
          <div className="order-1 lg:order-2 flex justify-center">
            <TiltCard>
              <motion.div
                initial={{ opacity: 0, y: 40, rotateX: -25 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] as const, delay: 0.2 }}
                className="relative w-full"
                style={{ transformPerspective: 1000 }}
              >
                {/* Card glow */}
                <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-fuchsia-400/40 via-purple-400/20 to-amber-300/30 blur-2xl opacity-70" />

                <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 sm:p-10 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.5)] overflow-hidden">
                  {/* Inner shimmer line */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

                  <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">
                    Welcome back
                  </h2>
                  <p className="text-sm text-white/60 mb-8">
                    Google アカウントで続行します
                  </p>

                  <SuperGoogleButton state={buttonState} onClick={handleSignIn} />

                  <AnimatePresence>
                    {error && buttonState !== 'success' && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 text-xs text-rose-200 bg-rose-500/20 border border-rose-300/30 rounded-lg p-3"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-[11px] text-white/40 leading-relaxed tracking-wide">
                      データはお使いのブラウザに保存されます<br />
                      許可されたアカウントでのみアクセス可能です
                    </p>
                  </div>
                </div>
              </motion.div>
            </TiltCard>
          </div>
        </div>
      </div>
    </BackgroundShell>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

/* ============================================================
 *  BRAND LOGO — pop / bounce-in
 * ============================================================ */

function BrandLogoBlock() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
      className="inline-flex items-center gap-3 mb-7"
    >
      <motion.div
        animate={{ rotate: [0, -4, 4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-400 to-amber-300 blur-2xl opacity-70" />
        <BrandIcon size={56} className="relative drop-shadow-lg" />
      </motion.div>
      <span className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
        LearnTrack
      </span>
    </motion.div>
  );
}

/* ============================================================
 *  SUPER GOOGLE BUTTON — shimmer / pop / loading → success
 * ============================================================ */

function SuperGoogleButton({
  state,
  onClick,
}: {
  state: ButtonState;
  onClick: () => void;
}) {
  const isBusy = state !== 'idle';
  const isSuccess = state === 'success';
  const isError = state === 'error';

  return (
    <motion.button
      onClick={onClick}
      disabled={isBusy}
      whileHover={!isBusy ? { scale: 1.02 } : undefined}
      whileTap={!isBusy ? { scale: 0.96 } : undefined}
      animate={
        isError
          ? { x: [-8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.5 } }
          : { x: 0 }
      }
      className={`relative w-full overflow-hidden rounded-2xl font-semibold py-3.5 px-4 transition-colors duration-500 ${
        isSuccess
          ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white'
          : isError
            ? 'bg-rose-500 text-white'
            : 'bg-white text-slate-800 hover:shadow-[0_10px_40px_-10px_rgba(255,255,255,0.5)]'
      } disabled:cursor-wait shadow-lg`}
      style={{ willChange: 'transform' }}
    >
      {/* Shimmer overlay (only in idle state) */}
      {state === 'idle' && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-[-20deg]"
          animate={{ x: ['0%', '420%'] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
        />
      )}

      <AnimatePresence mode="wait" initial={false}>
        {state === 'idle' && (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative flex items-center justify-center gap-3"
          >
            <GoogleLogo />
            <span>Google でサインイン</span>
          </motion.span>
        )}

        {state === 'loading' && (
          <motion.span
            key="loading"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            className="relative flex items-center justify-center gap-2"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">サインイン中…</span>
          </motion.span>
        )}

        {state === 'success' && (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 16 }}
            className="relative flex items-center justify-center gap-2"
          >
            <motion.span
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 0.05 }}
              className="inline-flex"
            >
              <Check className="w-6 h-6" strokeWidth={3} />
            </motion.span>
            <span>サインイン完了</span>
          </motion.span>
        )}

        {state === 'error' && (
          <motion.span
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex items-center justify-center"
          >
            もう一度お試しください
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ============================================================
 *  3D TILT CARD
 * ============================================================ */

function TiltCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-120, 120], [8, -8]);
  const rotateY = useTransform(x, [-120, 120], [-8, 8]);
  const springRX = useSpring(rotateX, { stiffness: 140, damping: 18 });
  const springRY = useSpring(rotateY, { stiffness: 140, damping: 18 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{
        rotateX: springRX,
        rotateY: springRY,
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      className="w-full max-w-md"
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
 *  ANIMATED GRADIENT BACKGROUND + BLOBS
 * ============================================================ */

function BackgroundShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden font-sans bg-[#0b0420] selection:bg-fuchsia-500/40 selection:text-white">
      {/* Base animated gradient */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-90"
        style={{
          background:
            'linear-gradient(120deg, #1a0533 0%, #3b0764 25%, #6b21a8 50%, #be185d 75%, #f59e0b 100%)',
          backgroundSize: '300% 300%',
          animation: 'bg-pan 22s ease-in-out infinite',
        }}
      />

      {/* Drifting color blobs */}
      <motion.div
        aria-hidden
        className="absolute -top-32 -left-32 w-[36rem] h-[36rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.55), transparent 60%)' }}
        animate={{ x: [0, 120, -60, 0], y: [0, 80, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute top-1/3 -right-40 w-[32rem] h-[32rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.5), transparent 60%)' }}
        animate={{ x: [0, -80, 60, 0], y: [0, -100, -40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-32 left-1/3 w-[28rem] h-[28rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.4), transparent 60%)' }}
        animate={{ x: [0, 80, -40, 0], y: [0, -60, 30, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Subtle grid overlay */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <style>{`
        @keyframes bg-pan {
          0%   { background-position: 0% 0%; }
          50%  { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
      `}</style>

      {children}
    </div>
  );
}

/* ============================================================
 *  FLOATING NEON PARTICLES
 * ============================================================ */

function FloatingParticles({ count = 16 }: { count?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const colors = [
          'rgba(236,72,153,0.6)', // pink
          'rgba(168,85,247,0.6)', // purple
          'rgba(56,189,248,0.5)', // sky
          'rgba(251,191,36,0.5)', // amber
          'rgba(255,255,255,0.5)', // white
        ];
        return {
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: 30 + Math.random() * 90,
          color: colors[i % colors.length],
          duration: 14 + Math.random() * 12,
          delay: Math.random() * 6,
          driftX: (Math.random() - 0.5) * 160,
          driftY: (Math.random() - 0.5) * 160,
        };
      }),
    [count]
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full blur-2xl"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, ${p.color}, transparent 70%)`,
          }}
          animate={{
            x: [0, p.driftX, -p.driftX * 0.6, 0],
            y: [0, p.driftY, -p.driftY * 0.5, 0],
            opacity: [0.35, 0.7, 0.4, 0.35],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

/* ============================================================
 *  GOOGLE G LOGO
 * ============================================================ */

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

/* ============================================================
 *  FORBIDDEN / UNCONFIGURED VIEWS (kept consistent w/ theme)
 * ============================================================ */

function ForbiddenView({ email, onRetry }: { email: string; onRetry: () => Promise<void> }) {
  return (
    <BackgroundShell>
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl"
        >
          <div className="flex items-center gap-2 text-rose-200 font-bold mb-3">
            <ShieldAlert className="w-5 h-5" />
            アクセスが許可されていません
          </div>
          <p className="text-sm text-white/80 mb-1">
            <span className="font-semibold text-white">{email}</span> は許可リストにありません。
          </p>
          <p className="text-sm text-white/60 mb-6">別のアカウントでお試しください。</p>
          <button
            onClick={onRetry}
            className="w-full bg-white text-slate-800 font-medium py-2.5 px-4 rounded-xl hover:bg-slate-100 transition-colors"
          >
            別のアカウントでサインインし直す
          </button>
        </motion.div>
      </div>
    </BackgroundShell>
  );
}

function UnconfiguredView() {
  return (
    <BackgroundShell>
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl text-white"
        >
          <div className="flex items-center gap-2 text-amber-200 font-bold mb-3">
            <AlertCircle className="w-5 h-5" />
            Firebase が未設定です
          </div>
          <p className="text-sm text-white/75 leading-relaxed">
            プロジェクトルートに <code className="bg-white/20 px-1.5 py-0.5 rounded text-xs">.env.local</code> を作成して
            Firebase の設定値を入れ、開発サーバを再起動してください。雛形は{' '}
            <code className="bg-white/20 px-1.5 py-0.5 rounded text-xs">.env.example</code> にあります。
          </p>
        </motion.div>
      </div>
    </BackgroundShell>
  );
}
