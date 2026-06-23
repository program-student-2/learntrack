import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef, type ReactNode } from 'react';

interface SurfaceProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  /** Add subtle gradient ring on hover (default: true) */
  hoverable?: boolean;
  /** Strip default padding so the surface can host its own header bar */
  bare?: boolean;
  className?: string;
}

/**
 * Shared glass-style card used across the app. Consistent radius, border,
 * shadow, and hover behavior; opt-in entrance motion via framer-motion props.
 */
export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(function Surface(
  { children, hoverable = false, bare = false, className = '', ...rest },
  ref
) {
  return (
    <motion.div
      ref={ref}
      className={[
        'relative bg-white/80 backdrop-blur-xl border border-slate-200/70',
        'rounded-3xl shadow-[0_8px_30px_-12px_rgba(15,23,42,0.10)]',
        bare ? '' : 'p-6 sm:p-8',
        hoverable
          ? 'transition-all duration-300 hover:shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18)] hover:-translate-y-0.5'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </motion.div>
  );
});

/** Reusable entrance variants for cards. */
export const cardEnter = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export const cardStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};
