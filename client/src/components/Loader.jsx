import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ message = 'Loading...', size = 'md' }) => {
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center p-8 text-slate-500 gap-3"
      aria-live="polite"
    >
      <Loader2 className={`${iconSize} animate-spin text-emerald-600`} aria-hidden="true" />
      <span className="text-sm font-medium">{message}</span>
      <span className="sr-only">{message}</span>
    </div>
  );
};
