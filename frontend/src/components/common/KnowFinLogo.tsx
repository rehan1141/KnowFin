import React from 'react';

interface KnowFinLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'app-icon';
  showTagline?: boolean;
}

/**
 * Custom chunky rounded KnowFin "K" mark with warm amber folded banknote facet
 * and playful energy sparks, matching the Gen-Z brand identity reference.
 */
export const KnowFinMark: React.FC<{
  size?: number;
  className?: string;
  stemColor?: string;
  foldColor?: string;
  sparkColor?: string;
}> = ({
  size = 40,
  className = '',
  stemColor = '#164A3A',
  foldColor = '#D99A37',
  sparkColor = '#D99A37',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {/* ── 3 Playful Energy Sparks (Top Right) ── */}
      <g stroke={sparkColor} strokeWidth="4.5" strokeLinecap="round">
        {/* Ray 1: Top-most */}
        <line x1="77" y1="16" x2="80" y2="7" />
        {/* Ray 2: Diagonal */}
        <line x1="84" y1="21" x2="93" y2="14" />
        {/* Ray 3: Right-most */}
        <line x1="86" y1="30" x2="95" y2="30" />
      </g>

      {/* ── Chunky Rounded 'K' Stem ── */}
      <rect
        x="15"
        y="18"
        width="18"
        height="64"
        rx="9"
        fill={stemColor}
      />

      {/* ── Lower Diagonal Arm ── */}
      <path
        d="M27 48 L65 79"
        stroke={stemColor}
        strokeWidth="18"
        strokeLinecap="round"
      />

      {/* ── Upper Diagonal Arm ── */}
      <path
        d="M27 52 L65 23"
        stroke={stemColor}
        strokeWidth="18"
        strokeLinecap="round"
      />

      {/* ── Geometric Folded Banknote Facet (Amber) ── */}
      <path
        d="M31 38 L52 46 L38 62 L26 51 Z"
        fill={foldColor}
      />
      {/* Subtle depth fold line */}
      <path
        d="M31 38 L38 62"
        stroke="#C5882B"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
};

export const KnowFinLogo: React.FC<KnowFinLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  showTagline = false,
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-lg', badge: 32 },
    md: { icon: 38, text: 'text-2xl', badge: 44 },
    lg: { icon: 48, text: 'text-3xl', badge: 56 },
    xl: { icon: 64, text: 'text-4xl', badge: 72 },
  };

  const currentSize = sizeMap[size];

  if (variant === 'app-icon') {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-2xl bg-[#164A3A] shadow-md p-1.5 ${className}`}
        style={{ width: currentSize.badge, height: currentSize.badge }}
      >
        <KnowFinMark
          size={currentSize.badge * 0.85}
          stemColor="#F6F2E9"
          foldColor="#D99A37"
          sparkColor="#D99A37"
        />
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <KnowFinMark
        size={currentSize.icon}
        className={className}
      />
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <KnowFinMark size={currentSize.icon} />
      <div className="flex flex-col">
        <span
          className={`font-black tracking-tight text-[#164A3A] leading-none ${currentSize.text}`}
          style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
        >
          KnowFin
        </span>
        {showTagline && (
          <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.18em] text-[#6B7268] uppercase mt-1">
            YOUR MONEY, MADE CLEAR
          </span>
        )}
      </div>
    </div>
  );
};
