import React, { useState, useEffect } from 'react';
import { KnowFinLogo } from './KnowFinLogo';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Getting your finances ready…',
}) => {
  const [showNotice, setShowNotice] = useState(false);

  // Only display the text status if loading lasts long enough (>380ms)
  // to avoid distracting flicker on quick cache hits or fast transitions.
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotice(true);
    }, 380);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-screen w-full bg-[#F6F2E9] text-[#20251F] flex flex-col items-center justify-center p-6 select-none transition-colors duration-200"
    >
      <div className="flex flex-col items-center text-center max-w-xs transition-all duration-300 motion-reduce:transition-none">
        {/* Cohesive Brand Mark & Wordmark */}
        <div className="mb-5">
          <KnowFinLogo size="md" />
        </div>

        {/* Small, elegant animated loading indicator */}
        <div className="flex items-center justify-center h-5 mb-2">
          <div
            className="w-4 h-4 rounded-full border-[1.5px] border-[#164A3A]/20 border-t-[#164A3A] border-r-[#D99A37] animate-spin motion-reduce:animate-none"
            style={{ animationDuration: '0.85s' }}
            aria-hidden="true"
          />
        </div>

        {/* Subtle, delayed context line */}
        <div className="h-5 flex items-center justify-center">
          <p
            className={`text-xs text-[#6B7268] font-medium tracking-normal transition-opacity duration-300 motion-reduce:transition-none ${
              showNotice ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {message}
          </p>
        </div>

        {/* Screen reader announcement */}
        <span className="sr-only">Loading application, please wait…</span>
      </div>
    </div>
  );
};
