import React from 'react';

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Securing your workspace...',
  submessage = 'Validating credentials and preparing your ledger',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-screen bg-[var(--kf-ivory,#F6F2E9)] text-[var(--kf-ink,#20251F)] flex flex-col items-center justify-center p-6 select-none"
    >
      <div className="flex flex-col items-center max-w-sm text-center">
        {/* Animated Brand Emblem */}
        <div className="relative mb-6">
          {/* Subtle outer glowing aura */}
          <div className="absolute -inset-2 rounded-2xl bg-[var(--kf-amber,#D99A37)]/10 blur-sm motion-reduce:hidden" />

          {/* Rotating indeterminate ring */}
          <div
            className="absolute -inset-2.5 rounded-2xl border-2 border-transparent border-t-[var(--kf-amber,#D99A37)] border-r-[var(--kf-amber,#D99A37)]/40 animate-spin motion-reduce:animate-none"
            style={{ animationDuration: '1.2s' }}
          />

          {/* Core squircle badge */}
          <div className="relative w-14 h-14 rounded-xl bg-[var(--kf-ink,#20251F)] text-[var(--kf-ivory,#F6F2E9)] flex items-center justify-center font-bold text-xl tracking-tight shadow-sm">
            K
          </div>
        </div>

        {/* Brand Name */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base font-bold tracking-tight text-[var(--kf-ink,#20251F)]">
            KnowFin
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--kf-stone,#DDD7CB)]/50 text-[var(--kf-text-muted,#6B7268)]">
            Ledger
          </span>
        </div>

        {/* Dynamic status message */}
        <p className="text-sm font-semibold text-[var(--kf-ink,#20251F)] mb-1">
          {message}
        </p>

        {/* Subtitle / context */}
        <p className="text-xs text-[var(--kf-text-muted,#6B7268)] max-w-xs leading-relaxed">
          {submessage}
        </p>

        {/* Screen reader only status */}
        <span className="sr-only">Loading application, please wait...</span>
      </div>
    </div>
  );
};
