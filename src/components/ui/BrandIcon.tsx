import { useId } from 'react';

interface Props {
  /** Side length in px (icon is square). Default 32. */
  size?: number;
  className?: string;
  /** Hide decorative bars + sparkle for small renders (favicon-style). */
  minimal?: boolean;
}

/**
 * LearnTrack brand mark. Renders the squircle + gradient + check
 * (and optional bars/sparkles) as an inline SVG. Matches public/icon.svg.
 */
export function BrandIcon({ size = 32, className = '', minimal = false }: Props) {
  // Unique IDs so multiple instances on the same page don't collide.
  const rid = useId().replace(/:/g, '');
  const bg = `bg-${rid}`;
  const hi = `hi-${rid}`;
  const lo = `lo-${rid}`;
  const bar = `bar-${rid}`;
  const shadow = `shadow-${rid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={bg} x1="48" y1="32" x2="464" y2="480" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4338ca" />
          <stop offset="55%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <radialGradient id={hi} cx="140" cy="90" r="320" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={lo} cx="420" cy="450" r="260" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0b1238" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0b1238" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={bar} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.45" />
        </linearGradient>
        <filter id={shadow} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="14" floodColor="#0b1238" floodOpacity="0.35" />
        </filter>
      </defs>

      <rect width="512" height="512" rx="112" fill={`url(#${bg})`} />
      <rect width="512" height="512" rx="112" fill={`url(#${hi})`} />
      <rect width="512" height="512" rx="112" fill={`url(#${lo})`} />
      <rect
        x="6"
        y="6"
        width="500"
        height="500"
        rx="106"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.2"
        strokeWidth="2"
      />

      {!minimal && (
        <g opacity="0.38" filter={`url(#${shadow})`}>
          <rect x="98" y="318" width="50" height="92" rx="18" fill={`url(#${bar})`} />
          <rect x="166" y="276" width="50" height="134" rx="18" fill={`url(#${bar})`} />
          <rect x="234" y="234" width="50" height="176" rx="18" fill={`url(#${bar})`} />
        </g>
      )}

      <g filter={`url(#${shadow})`}>
        <path
          d="M132 274 L228 372 L398 142"
          stroke="#ffffff"
          strokeWidth={minimal ? 62 : 58}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {!minimal && (
        <>
          <g transform="translate(408 116)" opacity="0.95">
            <path
              d="M0 -18 L4 -4 L18 0 L4 4 L0 18 L-4 4 L-18 0 L-4 -4 Z"
              fill="#ffffff"
            />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
          </g>
          <g transform="translate(372 64)" opacity="0.6">
            <path d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z" fill="#ffffff" />
          </g>
        </>
      )}
    </svg>
  );
}
