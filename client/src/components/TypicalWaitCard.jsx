import React from 'react';
import { Clock, Sun, Sunrise, Sunset, Moon, AlertCircle, Zap, ShieldCheck } from 'lucide-react';
import { Badge } from './Badge.jsx';

const periodMetadata = {
  'Early Morning (6–9)': {
    icon: Sunrise,
    hours: '6:00 AM – 9:00 AM',
    gradient: 'from-amber-500/10 to-orange-500/5',
    accentBorder: 'border-amber-200'
  },
  'Morning (9–12)': {
    icon: Sun,
    hours: '9:00 AM – 12:00 PM',
    gradient: 'from-yellow-500/10 to-emerald-500/5',
    accentBorder: 'border-yellow-200'
  },
  'Afternoon (12–16)': {
    icon: Sun,
    hours: '12:00 PM – 4:00 PM',
    gradient: 'from-blue-500/10 to-indigo-500/5',
    accentBorder: 'border-blue-200'
  },
  'Evening (16–20)': {
    icon: Sunset,
    hours: '4:00 PM – 8:00 PM',
    gradient: 'from-indigo-500/10 to-purple-500/5',
    accentBorder: 'border-purple-200'
  },
  'Late (20–6)': {
    icon: Moon,
    hours: '8:00 PM – 6:00 AM',
    gradient: 'from-slate-500/10 to-zinc-500/5',
    accentBorder: 'border-slate-300'
  }
};

// Check if current hour falls in this bucket
function isPeriodActiveNow(periodName) {
  const hour = new Date().getHours();
  if (periodName.includes('6–9')) return hour >= 6 && hour < 9;
  if (periodName.includes('9–12')) return hour >= 9 && hour < 12;
  if (periodName.includes('12–16')) return hour >= 12 && hour < 16;
  if (periodName.includes('16–20')) return hour >= 16 && hour < 20;
  if (periodName.includes('20–6')) return hour >= 20 || hour < 6;
  return false;
}

export const TypicalWaitCard = ({ periodData, onQuickLog = null }) => {
  const {
    timePeriod,
    reportCount = 0,
    minWait,
    maxWait,
    medianWait,
    typicalRange,
    insufficient
  } = periodData;

  const meta = periodMetadata[timePeriod] || {
    icon: Clock,
    hours: '',
    gradient: 'from-slate-50 to-white',
    accentBorder: 'border-slate-200'
  };

  const IconComponent = meta.icon;
  const isCurrent = isPeriodActiveNow(timePeriod);

  // Determine status color based on typical high or median
  let waitTheme = {
    badgeStatus: 'fast',
    bannerBg: 'bg-emerald-50/90 border-emerald-200 text-emerald-900',
    numberColor: 'text-emerald-700',
    barColor: 'bg-emerald-500'
  };

  if (!insufficient && typicalRange) {
    if (typicalRange.high > 30) {
      waitTheme = {
        badgeStatus: 'busy',
        bannerBg: 'bg-rose-50/90 border-rose-200 text-rose-900',
        numberColor: 'text-rose-700',
        barColor: 'bg-rose-500'
      };
    } else if (typicalRange.high > 15) {
      waitTheme = {
        badgeStatus: 'moderate',
        bannerBg: 'bg-amber-50/90 border-amber-200 text-amber-900',
        numberColor: 'text-amber-800',
        barColor: 'bg-amber-500'
      };
    }
  }

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        isCurrent
          ? 'ring-2 ring-emerald-500 shadow-md bg-white'
          : 'bg-white/90 border-slate-200/90 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Top Banner accent */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${isCurrent ? 'from-emerald-500 to-teal-400' : 'from-slate-200 to-slate-100'}`} />

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Card Header with Badges */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 bg-gradient-to-br ${meta.gradient} border border-slate-200/60`}>
                <IconComponent className="w-5 h-5 text-slate-700" aria-hidden="true" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm leading-tight flex items-center gap-1.5">
                  {timePeriod}
                </h4>
                <span className="text-[11px] font-medium text-slate-500 block">
                  {meta.hours}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <Badge variant="user-reported" size="sm" />
              {isCurrent && <Badge variant="active-now" size="sm" />}
            </div>
          </div>

          {/* Range or Insufficient State */}
          {insufficient ? (
            <div className="my-3 p-4 rounded-xl bg-slate-50/80 border border-dashed border-slate-300 text-center">
              <div className="inline-flex p-2 rounded-full bg-amber-50 text-amber-700 mb-1.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <p className="text-sm font-bold text-slate-700">Not enough reports yet</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                {reportCount === 0
                  ? 'Zero reports logged for this window.'
                  : `${reportCount} report${reportCount > 1 ? 's' : ''} submitted so far (minimum 3 required).`}
              </p>
              {onQuickLog && (
                <button
                  type="button"
                  onClick={onQuickLog}
                  className="mt-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  + Log a wait for this time
                </button>
              )}
            </div>
          ) : (
            <div className="my-2">
              <div className="flex items-center justify-between mb-1 text-xs">
                <span className="text-slate-500 font-semibold tracking-wide uppercase text-[10px]">
                  Typical Wait Range
                </span>
                <Badge variant="wait-status" status={waitTheme.badgeStatus} size="sm" />
              </div>

              {/* Range Display Box */}
              <div className={`p-3.5 rounded-xl border ${waitTheme.bannerBg} text-center mb-3 transition shadow-xs`}>
                <div className={`text-2xl sm:text-3xl font-black tracking-tight ${waitTheme.numberColor}`}>
                  {typicalRange.low}–{typicalRange.high} <span className="text-sm font-semibold">min</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-1 text-[11px] opacity-90 font-medium">
                  <span>Median: ~{medianWait}m</span>
                  <span>•</span>
                  <span>Observed: {minWait}m to {maxWait}m</span>
                </div>
              </div>

              {/* Proportional visual bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${waitTheme.barColor}`}
                    style={{
                      width: `${Math.min(100, Math.max(12, ((typicalRange.high || medianWait) / 60) * 100))}%`
                    }}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
                  <span>0m</span>
                  <span>30m</span>
                  <span>60m+</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            {reportCount} submission{reportCount === 1 ? '' : 's'}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">90-day window</span>
        </div>
      </div>
    </div>
  );
};
