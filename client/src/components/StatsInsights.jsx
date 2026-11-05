import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Clock, Zap, CheckCircle2 } from 'lucide-react';

export const StatsInsights = ({ periods = [] }) => {
  // Only evaluate periods that have sufficient data
  const validPeriods = periods.filter((p) => !p.insufficient && p.typicalRange);

  if (validPeriods.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 rounded-2xl border border-slate-200/90 p-5 text-center">
        <div className="inline-flex p-2.5 rounded-2xl bg-white shadow-xs text-emerald-600 mb-2">
          <Clock className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-slate-800 text-sm">Community Insights Unlocking Soon</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
          As soon as each time period receives at least 3 user reports, automated rush predictions
          and optimal visit recommendations will appear here.
        </p>
      </div>
    );
  }

  // Find period with lowest median/typical high
  const fastestPeriod = [...validPeriods].sort((a, b) => (a.medianWait || 0) - (b.medianWait || 0))[0];
  // Find period with highest median
  const busiestPeriod = [...validPeriods].sort((a, b) => (b.medianWait || 0) - (a.medianWait || 0))[0];

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Smart Community Insights</h3>
            <p className="text-[11px] text-slate-500">Calculated from user reports in past 90 days</p>
          </div>
        </div>
      </div>

      {/* 2-Col Key Insights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Fastest Window */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-0.5">
              Best Time to Visit
            </span>
            <span className="font-bold text-slate-900 text-sm block">
              {fastestPeriod.timePeriod}
            </span>
            <p className="text-xs text-emerald-900 mt-1">
              Typically <strong className="font-bold">{fastestPeriod.typicalRange?.low}–{fastestPeriod.typicalRange?.high} min</strong> wait (~{fastestPeriod.medianWait}m median).
            </p>
          </div>
        </div>

        {/* Busiest Window */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-0.5">
              Peak Crowded Window
            </span>
            <span className="font-bold text-slate-900 text-sm block">
              {busiestPeriod.timePeriod}
            </span>
            <p className="text-xs text-amber-900 mt-1">
              Expect <strong className="font-bold">{busiestPeriod.typicalRange?.low}–{busiestPeriod.typicalRange?.high} min</strong> wait (~{busiestPeriod.medianWait}m median).
            </p>
          </div>
        </div>
      </div>

      {/* Visual Comparative Mini Bar Chart */}
      <div className="pt-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-3">
          Comparative Wait Timeline (25th–75th Percentiles)
        </span>
        <div className="grid grid-cols-5 gap-2 sm:gap-3 text-center">
          {periods.map((p) => {
            const hasData = !p.insufficient && p.typicalRange;
            const heightPercent = hasData
              ? Math.min(100, Math.max(20, (p.medianWait / 60) * 100))
              : 8;

            let barBg = 'bg-slate-200';
            if (hasData) {
              if (p.medianWait > 30) barBg = 'bg-rose-500';
              else if (p.medianWait > 15) barBg = 'bg-amber-500';
              else barBg = 'bg-emerald-500';
            }

            return (
              <div key={p.timePeriod} className="flex flex-col items-center">
                <span className="text-[11px] font-bold text-slate-700 h-5 mb-1 flex items-center">
                  {hasData ? `${p.medianWait}m` : '—'}
                </span>
                <div className="w-full bg-slate-100 rounded-lg h-20 flex items-end p-1">
                  <div
                    className={`w-full rounded-md transition-all duration-500 ${barBg}`}
                    style={{ height: `${heightPercent}%` }}
                    title={`${p.timePeriod}: ${hasData ? `${p.typicalRange.low}-${p.typicalRange.high}m` : 'Not enough reports'}`}
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-600 mt-1.5 truncate w-full" title={p.timePeriod}>
                  {p.timePeriod.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
