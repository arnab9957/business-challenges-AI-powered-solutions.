import * as React from 'react';

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(51 100% 69%)', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'hsl(33 100% 63%)', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="url(#logoGradient)" />
    <path d="M2 17l10 5 10-5" stroke="url(#logoGradient)" />
    <path d="M2 12l10 5 10-5" stroke="url(#logoGradient)" />
  </svg>
);
