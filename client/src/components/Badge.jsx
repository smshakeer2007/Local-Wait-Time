import React from 'react';
import { ShieldCheck, Flame, Zap, Clock } from 'lucide-react';

const categoryConfig = {
  'Copy Shop': {
    badge: 'bg-blue-50/80 text-blue-700 border-blue-200/90 hover:bg-blue-100/60',
    dot: 'bg-blue-500'
  },
  'Bank': {
    badge: 'bg-emerald-50/80 text-emerald-800 border-emerald-200/90 hover:bg-emerald-100/60',
    dot: 'bg-emerald-500'
  },
  'Post Office': {
    badge: 'bg-amber-50/80 text-amber-800 border-amber-200/90 hover:bg-amber-100/60',
    dot: 'bg-amber-500'
  },
  'Government Office': {
    badge: 'bg-purple-50/80 text-purple-800 border-purple-200/90 hover:bg-purple-100/60',
    dot: 'bg-purple-500'
  },
  'Clinic/Pharmacy': {
    badge: 'bg-rose-50/80 text-rose-800 border-rose-200/90 hover:bg-rose-100/60',
    dot: 'bg-rose-500'
  },
  'Other': {
    badge: 'bg-slate-100/80 text-slate-700 border-slate-300/80 hover:bg-slate-200/60',
    dot: 'bg-slate-400'
  }
};

export const Badge = ({
  children,
  variant = 'category',
  category,
  className = '',
  size = 'md',
  status = null
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs font-medium';

  // Explicit User-Reported Badge (Required for compliance)
  if (variant === 'user-reported') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-500/10 text-amber-800 border border-amber-300/80 shadow-xs ${sizeClasses} ${className}`}
        title="Community submitted data. Not an official wait time."
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
        User-reported
      </span>
    );
  }

  // Active / Current Time Period badge
  if (variant === 'active-now') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-400/80 animate-pulse ${sizeClasses} ${className}`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Current Window
      </span>
    );
  }

  // Wait intensity badge (e.g. Quick, Moderate, Busy)
  if (variant === 'wait-status') {
    if (status === 'fast') {
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses} ${className}`}>
          <Zap className="w-3 h-3 text-emerald-600" />
          Quick Wait
        </span>
      );
    }
    if (status === 'moderate') {
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses} ${className}`}>
          <Clock className="w-3 h-3 text-amber-600" />
          Moderate Wait
        </span>
      );
    }
    if (status === 'busy') {
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses} ${className}`}>
          <Flame className="w-3 h-3 text-rose-600" />
          High Rush
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses} ${className}`}>
        Awaiting Data
      </span>
    );
  }

  // Category Badge
  if (variant === 'category') {
    const config = (category && categoryConfig[category]) || categoryConfig['Other'];
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full border backdrop-blur-xs transition ${config.badge} ${sizeClasses} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
        {children || category}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  );
};
