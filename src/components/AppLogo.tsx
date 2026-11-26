import React from 'react';

/** BenchPR mark: a loaded barbell with a PR arrow rising above it. */
export const AppLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="5.5" y1="12.5" x2="18.5" y2="12.5" />
    <rect x="2.5" y="7.5" width="3" height="9" rx="1" />
    <rect x="18.5" y="7.5" width="3" height="9" rx="1" />
    <line x1="5.5" y1="10" x2="5.5" y2="15" />
    <line x1="18.5" y1="10" x2="18.5" y2="15" />
    <path d="M12 9.5V3.5" />
    <path d="M9.5 6 12 3.5 14.5 6" />
  </svg>
);
