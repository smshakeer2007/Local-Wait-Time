import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  Send,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Info,
  Share2,
  ExternalLink,
  Sparkles,
  Zap,
  TrendingUp,
  Tag
} from 'lucide-react';
import { api } from '../api.js';
import { Badge } from '../components/Badge.jsx';
import { Loader } from '../components/Loader.jsx';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { TypicalWaitCard } from '../components/TypicalWaitCard.jsx';
import { StatsInsights } from '../components/StatsInsights.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { useToast } from '../components/Toast.jsx';

// Format helper for relative time
function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  const days = Math.floor(diffSec / 86400);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return date.toLocaleDateString();
}

// Convert Date to local ISO string for input[type="datetime-local"]
function toLocalDatetimeString(date) {
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

const PRESET_MINUTES = [5, 10, 15, 20, 30, 45, 60];
const QUICK_TAGS = ['Fast Counter', 'Lunch Rush', 'Token System', 'Single Clerk', 'Self-Service Working', 'Long Queue'];

export const PlaceDetailPage = () => {
  const { id } = useParams();
  const { showToast } = useToast();

  // Place & Stats state
  const [place, setPlace] = useState(null);
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [dayTypeFilter, setDayTypeFilter] = useState('All');

  // Loading & error states
  const [loadingPlace, setLoadingPlace] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [error, setError] = useState(null);

  // "Log my wait" form state
  const [waitMinutes, setWaitMinutes] = useState('');
  const [visitedAt, setVisitedAt] = useState(() => toLocalDatetimeString(new Date()));
  const [note, setNote] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch Place Details
  const fetchPlace = async () => {
    try {
      setLoadingPlace(true);
      const data = await api.getPlaceById(id);
      setPlace(data);
    } catch (err) {
      setError(err.message || 'Place not found');
    } finally {
      setLoadingPlace(false);
    }
  };

  // Fetch Stats
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const data = await api.getPlaceStats(id, dayTypeFilter);
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch Recent Reports
  const fetchReports = async () => {
    try {
      setLoadingReports(true);
      const data = await api.getPlaceReports(id, { limit: 20, page: 1 });
      setReports(data.reports || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchPlace();
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchStats();
    }
  }, [id, dayTypeFilter]);

  useEffect(() => {
    if (id) {
      fetchReports();
    }
  }, [id]);

  // Form Validation & Submission
  const validateForm = () => {
    const errors = {};
    const waitNum = Number(waitMinutes);

    if (waitMinutes === '' || isNaN(waitNum)) {
      errors.waitMinutes = 'Please enter a wait duration in minutes';
    } else if (!Number.isInteger(waitNum)) {
      errors.waitMinutes = 'Wait time must be a whole number';
    } else if (waitNum < 0) {
      errors.waitMinutes = 'Wait time cannot be negative';
    } else if (waitNum > 240) {
      errors.waitMinutes = 'Wait time cannot exceed 240 minutes (4 hours)';
    }

    if (!visitedAt) {
      errors.visitedAt = 'Visit date and time is required';
    } else {
      const visitDate = new Date(visitedAt);
      const now = new Date();
      if (isNaN(visitDate.getTime())) {
        errors.visitedAt = 'Invalid date format';
      } else if (visitDate > new Date(now.getTime() + 5 * 60 * 1000)) {
        errors.visitedAt = 'Visit time cannot be in the future';
      } else if (visitDate < new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)) {
        errors.visitedAt = 'Report cannot be older than 30 days';
      }
    }

    if (note && note.length > 200) {
      errors.note = 'Note cannot exceed 200 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setSubmitSuccess(false);

      // Convert local datetime to ISO string
      const isoDate = new Date(visitedAt).toISOString();

      await api.submitReport(id, {
        waitMinutes: parseInt(waitMinutes, 10),
        visitedAt: isoDate,
        note: note.trim()
      });

      // Show success feedback
      setSubmitSuccess(true);
      showToast(`Submitted ${waitMinutes}m wait report! Thank you for contributing.`, 'success');
      setWaitMinutes('');
      setNote('');
      setVisitedAt(toLocalDatetimeString(new Date()));
      setFormErrors({});

      // Refetch stats and reports
      fetchStats();
      fetchReports();
      if (place) {
        setPlace((prev) => ({ ...prev, reportCount: (prev.reportCount || 0) + 1 }));
      }

      setTimeout(() => setSubmitSuccess(false), 6000);
    } catch (err) {
      if (err.details) {
        setFormErrors(err.details);
      } else {
        setFormErrors({ general: err.message || 'Failed to submit report. Please try again.' });
      }
      showToast('Error submitting report. Please check errors.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link to this service point copied to clipboard!', 'success');
    }
  };

  const handleAddQuickTag = (tag) => {
    setNote((prev) => (prev ? `${prev}, ${tag}` : tag).slice(0, 200));
  };

  if (loadingPlace) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <Loader message="Loading service point details..." size="lg" />
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <ErrorMessage
          message={error || 'Location not found'}
          onRetry={fetchPlace}
        />
        <div className="mt-4 text-center">
          <Link to="/" className="text-sm font-semibold text-emerald-600 hover:underline">
            ← Return to all places
          </Link>
        </div>
      </div>
    );
  }

  // Calculate min & max dates for datetime-local picker
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const maxDateStr = toLocalDatetimeString(now);
  const minDateStr = toLocalDatetimeString(thirtyDaysAgo);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Navigation & Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200/90 shadow-2xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Places</span>
        </Link>

        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:bg-slate-50 transition"
        >
          <Share2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Share Location</span>
        </button>
      </div>

      {/* Place Header Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 border border-slate-200/90 p-6 sm:p-10 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Badge variant="category" category={place.category} size="md" />
              <Badge variant="user-reported" size="md" />
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {place.name}
            </h1>

            {place.address && (
              <p className="text-sm text-slate-600 flex items-start sm:items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
                <span className="font-medium">{place.address}</span>
              </p>
            )}
          </div>

          {/* Quick Counter Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-center flex-shrink-0 sm:min-w-[160px]">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 block leading-tight">
              {place.reportCount || 0}
            </span>
            <span className="text-xs font-semibold text-slate-500 mt-1 block">
              Total Community Reports
            </span>
            <span className="text-[10px] text-emerald-700 font-bold tracking-wider uppercase mt-1 inline-block">
              Open Citizen Journal
            </span>
          </div>
        </div>
      </section>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Typical Waits & Insights & Recent Reports (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Smart Insights & Comparative Timeline */}
          {stats?.periods && (
            <StatsInsights periods={stats.periods} />
          )}

          {/* Typical Waits by Time of Day Section */}
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 mb-6">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Typical Wait by Time of Day
                  </h2>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Based on user-reported data
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Community-submitted, not official. Actual waits may vary.</span>
                </p>
              </div>

              {/* Day Filter Toggle */}
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold self-start sm:self-auto">
                {['All', 'Weekday', 'Weekend'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setDayTypeFilter(tab)}
                    className={`px-3.5 py-1.5 rounded-lg transition min-h-[34px] ${
                      dayTypeFilter === tab
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab === 'All' ? 'All Days' : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Typical Wait Cards Grid */}
            {loadingStats ? (
              <Loader message="Calculating wait distributions..." />
            ) : !stats || !stats.periods || stats.periods.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No wait data available.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.periods.map((periodData) => (
                  <TypicalWaitCard
                    key={periodData.timePeriod}
                    periodData={periodData}
                    onQuickLog={() => {
                      document.getElementById('waitMinutes')?.focus();
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Recent Reports Feed */}
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Recent Community Logs
                  </h2>
                  <p className="text-xs text-slate-500">Latest wait experiences reported by neighbors</p>
                </div>
              </div>
              <Badge variant="user-reported" size="sm" />
            </div>

            {loadingReports ? (
              <Loader message="Fetching community logs..." />
            ) : reports.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No reports logged yet"
                description="Be the first neighbor to log how long you waited at this counter!"
              />
            ) : (
              <div className="divide-y divide-slate-100 space-y-1">
                {reports.map((report) => (
                  <div key={report.id || report._id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-extrabold text-slate-900">
                            {report.waitMinutes} min wait
                          </span>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                            {report.timePeriod}
                          </span>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                            {report.dayType}
                          </span>
                          <Badge variant="user-reported" size="sm" />
                        </div>

                        {report.note && (
                          <p className="text-xs text-slate-700 italic bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 max-w-xl">
                            "{report.note}"
                          </p>
                        )}
                      </div>

                      <span className="text-xs font-medium text-slate-500 flex-shrink-0 whitespace-nowrap">
                        {formatRelativeTime(report.visitedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: "Log My Wait" Interactive Form (1 col) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                  Log My Wait
                </h2>
                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                  Help Fellow Neighbors
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Visited recently? Share your wait duration so others know what to expect.
            </p>

            {/* Success Feedback Card */}
            {submitSuccess && (
              <div
                role="status"
                className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5 animate-slide-up"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Report Saved!</p>
                  <p className="mt-0.5">Thank you for contributing. Typical ranges have been refreshed.</p>
                </div>
              </div>
            )}

            {/* General Form Error */}
            {formErrors.general && (
              <div role="alert">
                <ErrorMessage message={formErrors.general} />
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="space-y-4">
              {/* Wait Minutes Input & Presets */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="waitMinutes"
                    className="block text-xs font-bold text-slate-700"
                  >
                    Duration Waited (Minutes) *
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">0–240 min</span>
                </div>

                <div className="relative mb-2">
                  <input
                    id="waitMinutes"
                    type="number"
                    min="0"
                    max="240"
                    step="1"
                    placeholder="e.g. 15"
                    value={waitMinutes}
                    onChange={(e) => {
                      setWaitMinutes(e.target.value);
                      if (formErrors.waitMinutes) setFormErrors((prev) => ({ ...prev, waitMinutes: null }));
                    }}
                    className={`w-full px-4 py-2.5 text-sm font-semibold rounded-xl border ${
                      formErrors.waitMinutes ? 'border-red-400 bg-red-50/50' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]`}
                    aria-invalid={!!formErrors.waitMinutes}
                    aria-describedby={formErrors.waitMinutes ? 'waitMinutes-error' : undefined}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                    minutes
                  </span>
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-semibold mr-0.5">Quick:</span>
                  {PRESET_MINUTES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setWaitMinutes(m.toString());
                        if (formErrors.waitMinutes) setFormErrors((prev) => ({ ...prev, waitMinutes: null }));
                      }}
                      className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition ${
                        waitMinutes === m.toString()
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>

                {formErrors.waitMinutes && (
                  <p id="waitMinutes-error" className="mt-1.5 text-xs text-red-600" role="alert">
                    {formErrors.waitMinutes}
                  </p>
                )}
              </div>

              {/* Visited At Date & Time */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="visitedAt"
                    className="block text-xs font-bold text-slate-700"
                  >
                    When did you visit? *
                  </label>
                  <button
                    type="button"
                    onClick={() => setVisitedAt(toLocalDatetimeString(new Date()))}
                    className="text-[10px] font-bold text-emerald-700 hover:underline"
                  >
                    Set to Now
                  </button>
                </div>

                <input
                  id="visitedAt"
                  type="datetime-local"
                  max={maxDateStr}
                  min={minDateStr}
                  value={visitedAt}
                  onChange={(e) => {
                    setVisitedAt(e.target.value);
                    if (formErrors.visitedAt) setFormErrors((prev) => ({ ...prev, visitedAt: null }));
                  }}
                  className={`w-full px-4 py-2.5 text-xs font-medium rounded-xl border ${
                    formErrors.visitedAt ? 'border-red-400 bg-red-50/50' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px] bg-white`}
                  aria-invalid={!!formErrors.visitedAt}
                  aria-describedby={formErrors.visitedAt ? 'visitedAt-error' : undefined}
                />
                {formErrors.visitedAt && (
                  <p id="visitedAt-error" className="mt-1.5 text-xs text-red-600" role="alert">
                    {formErrors.visitedAt}
                  </p>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  Time bucket and weekday/weekend are derived server-side.
                </p>
              </div>

              {/* Note & Quick Tag Chips */}
              <div>
                <label
                  htmlFor="note"
                  className="block text-xs font-bold text-slate-700 mb-1"
                >
                  Context Note (Optional)
                </label>

                {/* Quick Note Tag Chips */}
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  {QUICK_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddQuickTag(tag)}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 transition"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>

                <textarea
                  id="note"
                  rows={3}
                  maxLength={200}
                  placeholder="e.g. 2 counters open, line moved fast, machine was down..."
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value);
                    if (formErrors.note) setFormErrors((prev) => ({ ...prev, note: null }));
                  }}
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                    formErrors.note ? 'border-red-400 bg-red-50/50' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  aria-invalid={!!formErrors.note}
                  aria-describedby={formErrors.note ? 'note-error' : undefined}
                />
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                  <span>{formErrors.note && <span className="text-red-600">{formErrors.note}</span>}</span>
                  <span>{note.length}/200 chars</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition disabled:opacity-50 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {submitting ? (
                  <>
                    <Loader size="sm" message="" />
                    <span>Submitting Log...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Community Wait</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>Submitted anonymously as community-reported.</span>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
