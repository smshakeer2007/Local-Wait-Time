import React from 'react';
import { Clock, PlusCircle } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Clock,
  title = 'No items found',
  description = 'There are no reports or places matching your current criteria.',
  actionLabel = null,
  onAction = null,
  className = ''
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-white border border-dashed border-slate-300 rounded-xl ${className}`}
    >
      <div className="w-12 h-12 mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
        >
          <PlusCircle className="w-4 h-4" aria-hidden="true" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
