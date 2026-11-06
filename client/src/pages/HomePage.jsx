import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  PlusCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Building2,
  Users,
  Flame,
  LayoutGrid,
  ListFilter,
  CheckCircle2,
  Share2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../api.js';
import { Badge } from '../components/Badge.jsx';
import { Loader } from '../components/Loader.jsx';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { useToast } from '../components/Toast.jsx';

const CATEGORIES = [
  { name: 'All', icon: Building2 },
  { name: 'Copy Shop', icon: Sparkles },
  { name: 'Bank', icon: Building2 },
  { name: 'Post Office', icon: Clock },
  { name: 'Government Office', icon: Building2 },
  { name: 'Clinic/Pharmacy', icon: Sparkles },
  { name: 'Other', icon: Building2 }
];

export const HomePage = () => {
  const { showToast } = useToast();

  const [places, setPlaces] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filters
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('reports-desc'); // 'reports-desc' | 'name-asc' | 'recent'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Delete modal state
  const [placeToDelete, setPlaceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getPlaces({
        search: activeSearch,
        category: selectedCategory === 'All' ? '' : selectedCategory,
        page,
        limit: 12
      });
      setPlaces(res.places || []);
      setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err.message || 'Could not load places. Please check the server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [activeSearch, selectedCategory, page]);

  // Client-side sorting for snappy responsiveness
  const sortedPlaces = useMemo(() => {
    const list = [...places];
    if (sortBy === 'reports-desc') {
      return list.sort((a, b) => (b.reportCount || 0) - (a.reportCount || 0));
    }
    if (sortBy === 'name-asc') {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === 'recent') {
      return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return list;
  }, [places, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
    setPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleShareApp = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin);
      showToast('App link copied to clipboard! Share it with your neighbors.', 'success');
    }
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!placeToDelete) return;
    try {
      setIsDeleting(true);
      const targetId = placeToDelete.id || placeToDelete._id;
      await api.deletePlace(targetId);
      showToast(`"${placeToDelete.name}" removed successfully.`, 'success');
      setPlaces((prev) => prev.filter((p) => (p.id || p._id) !== targetId));
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1)
      }));
      setPlaceToDelete(null);
    } catch (err) {
      showToast(err.message || 'Failed to remove service place', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Keyboard shortcut for search (/ or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('home-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-900 via-slate-900 to-slate-950 text-white p-8 sm:p-14 shadow-2xl border border-slate-800">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Community-Powered Service Counter Journal</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight sm:leading-tight mb-4">
            Never wait blindly again.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
              Know typical wait times
            </span>{' '}
            by time of day.
          </h1>

          <p className="text-slate-300 text-sm sm:text-lg leading-relaxed mb-8 max-w-2xl font-normal">
            Real wait durations submitted by local residents for bank tellers, copy shops, post offices,
            and government desks. Filtered with 25th–75th percentiles so outliers don't deceive you.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
            <div className="bg-slate-800/40 backdrop-blur-xs rounded-xl p-3 border border-slate-700/60">
              <span className="text-2xl font-black text-emerald-400 block">{pagination.total || 5}+</span>
              <span className="text-[11px] font-medium text-slate-400">Service Points Tracked</span>
            </div>
            <div className="bg-slate-800/40 backdrop-blur-xs rounded-xl p-3 border border-slate-700/60">
              <span className="text-2xl font-black text-teal-300 block">50+</span>
              <span className="text-[11px] font-medium text-slate-400">User Wait Reports</span>
            </div>
            <div className="bg-slate-800/40 backdrop-blur-xs rounded-xl p-3 border border-slate-700/60">
              <span className="text-2xl font-black text-amber-300 block">5</span>
              <span className="text-[11px] font-medium text-slate-400">Daily Time Windows</span>
            </div>
            <div className="bg-slate-800/40 backdrop-blur-xs rounded-xl p-3 border border-slate-700/60">
              <span className="text-2xl font-black text-indigo-300 block">100%</span>
              <span className="text-[11px] font-medium text-slate-400">User-Reported Data</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search, Filter & Controls Panel */}
      <section className="glass-panel rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          {/* Main Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="home-search-input"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search service points by name, location, or street (e.g. Bank, Post Office, Downtown)..."
              className="w-full pl-11 pr-24 py-3 text-sm rounded-xl border border-slate-300/90 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white min-h-[46px] shadow-xs"
              aria-label="Search places"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-14 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 rounded border border-slate-200">
              Ctrl K
            </kbd>
          </form>

          {/* Search Button */}
          <button
            type="button"
            onClick={handleSearchSubmit}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition shadow-xs min-h-[46px] focus:outline-none focus:ring-2 focus:ring-slate-700"
          >
            Search
          </button>

          {/* Add Place CTA */}
          <Link
            to="/places/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm rounded-xl transition shadow-sm hover:shadow-md min-h-[46px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Service Point</span>
          </Link>
        </div>

        {/* Category Pills & Sort Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-200/60">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {CATEGORIES.map(({ name: cat }) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition min-h-[38px] font-semibold flex items-center gap-1.5 flex-shrink-0 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                  }`}
                  aria-pressed={isSelected}
                >
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          {/* Sort By & View Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0 text-xs">
            <span className="text-slate-500 font-semibold hidden md:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[38px]"
              aria-label="Sort places"
            >
              <option value="reports-desc">Most Reports First</option>
              <option value="recent">Recently Added</option>
              <option value="name-asc">Name (A to Z)</option>
            </select>

            {/* Layout Mode Toggle */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                aria-label="List view"
              >
                <ListFilter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Active Filter Chips */}
      {(activeSearch || selectedCategory !== 'All') && (
        <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap animate-fade-in">
          <span className="font-semibold text-slate-700">Active Filters:</span>
          {activeSearch && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
              Search: "{activeSearch}"
              <button onClick={handleClearSearch} className="hover:text-red-600 p-0.5" aria-label="Clear search">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {selectedCategory !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
              Category: {selectedCategory}
              <button onClick={() => setSelectedCategory('All')} className="hover:text-red-600 p-0.5" aria-label="Clear category">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          <button
            onClick={() => {
              setSearchInput('');
              setActiveSearch('');
              setSelectedCategory('All');
              setPage(1);
            }}
            className="text-emerald-700 hover:text-emerald-800 font-bold ml-2 underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Main Places Section */}
      {loading ? (
        <Loader message="Loading community service counters..." size="lg" />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchPlaces} />
      ) : sortedPlaces.length === 0 ? (
        <EmptyState
          title="No service points found"
          description={
            activeSearch || selectedCategory !== 'All'
              ? 'No places match your search or filter. Try a broader search or add a new place.'
              : 'There are no local service points registered yet. Be the first to add one!'
          }
          actionLabel="Add a New Place"
          onAction={() => (window.location.href = '/places/new')}
        />
      ) : (
        <>
          {/* Places Grid or List View */}
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {sortedPlaces.map((place) => {
              const placeId = place.id || place._id;

              return (
                <div
                  key={placeId}
                  className="group relative bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-xl hover:border-emerald-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Top Ambient Card Glow on Hover */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/15 transition-all duration-300 pointer-events-none" />

                  <div>
                    {/* Header Badges & Actions */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="category" category={place.category} />
                        <Badge variant="user-reported" size="sm" />
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPlaceToDelete(place);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title={`Remove ${place.name}`}
                        aria-label={`Remove ${place.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Place Name */}
                    <Link to={`/places/${placeId}`} className="block">
                      <h3 className="font-extrabold text-slate-900 group-hover:text-emerald-700 transition text-lg leading-snug line-clamp-2 mb-2">
                        {place.name}
                      </h3>
                    </Link>

                    {/* Address */}
                    {place.address && (
                      <p className="text-xs text-slate-500 flex items-start gap-1.5 line-clamp-2 mb-5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{place.address}</span>
                      </p>
                    )}
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-bold text-slate-900">{place.reportCount || 0}</span>
                      <span>community report{place.reportCount === 1 ? '' : 's'}</span>
                    </div>

                    <Link
                      to={`/places/${placeId}`}
                      className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 transition"
                    >
                      <span>View Typical Waits</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200/80 pt-6 gap-4">
              <p className="text-xs text-slate-500">
                Showing <span className="font-bold text-slate-700">{places.length}</span> of{' '}
                <span className="font-bold text-slate-700">{pagination.total}</span> registered locations
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage}
                  className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed min-h-[42px] transition shadow-xs"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <span className="text-xs font-semibold text-slate-700 px-3 py-2 bg-slate-100 rounded-lg">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={!pagination.hasNextPage}
                  className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed min-h-[42px] transition shadow-xs"
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* "How It Works" 3-Step Guide Strip */}
      <section className="bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-slate-50 rounded-3xl border border-emerald-100 p-8 sm:p-10 shadow-xs">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <span className="text-xs font-bold text-emerald-800 tracking-wider uppercase">
            Simple & Transparent
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            How LocalWait Times Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Built by neighbors for neighbors. Honest, open community wait data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-black text-base flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Pick a Service Point</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Find your local branch or counter — banks, clinics, copy centers, or postal desks.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 font-black text-base flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Check 5 Time Windows</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                See typical 25th–75th percentile wait ranges by time period to dodge peak rush hours.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 font-black text-base flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Log Your Own Wait</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Visited today? Submit your wait time in 15 seconds. Keep the data accurate for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {placeToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-home-place-title"
        >
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 id="delete-home-place-title" className="text-lg font-black text-slate-900">
                  Remove Service Place?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Permanent removal from LocalWait Times
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                Are you sure you want to permanently remove{' '}
                <strong className="text-slate-900 font-bold">{placeToDelete.name}</strong>?
              </p>
              <p className="text-rose-600 font-medium">
                ⚠️ This will also delete all{' '}
                <strong>{placeToDelete.reportCount || 0} user-reported wait records</strong> submitted for this place.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPlaceToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Remove Place</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
