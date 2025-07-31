import * as React from 'react';

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path d="M4 12h5" stroke="url(#logoGradient)" />
    <path d="M15 12h5" stroke="url(#logoGradient)" />
    <path d="M9 12l3-3" stroke="url(#logoGradient)" />
    <path d="M9 12l3 3" stroke="url(#logoGradient)" />
    <path d="M12 9v6" stroke="url(#logoGradient)" />
    <circle cx="12" cy="12" r="10" stroke="url(#logoGradient)" />
  </svg>
);
