import * as React from 'react';

interface LoaderProps {
  text?: string;
}

export function Loader({ text = 'Loading...' }: LoaderProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        <p className="text-lg text-foreground">{text}</p>
      </div>
    </div>
  );
}
