import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Clock,
  PlusCircle,
  Building2,
  Menu,
  X,
  ShieldAlert,
  Sparkles,
  Users
} from 'lucide-react';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-slate-200/80 shadow-xs">
      {/* Top Advisory Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white px-4 py-1.5 text-center text-xs font-medium flex items-center justify-center gap-2 shadow-inner">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" aria-hidden="true" />
        <span className="tracking-wide">
          <strong>Community Journal:</strong> All wait data is <em>user-reported</em> by neighbors, not official establishment metrics.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo & Name */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl p-1"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 group-hover:shadow-glow-emerald transition-all duration-300">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition">
                  LocalWait
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md bg-emerald-100/90 text-emerald-800 border border-emerald-300/80">
                  Times
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Community Wait-Time Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3">
            {/* Community Live Status Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 text-xs text-slate-600">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Neighbor-powered</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition min-h-[44px] flex items-center gap-2 ${
                isActive('/')
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              Explore Places
            </Link>

            <Link
              to="/places/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-sm hover:shadow-md hover:shadow-emerald-600/20 active:scale-98 transition-all min-h-[44px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <PlusCircle className="w-4 h-4" aria-hidden="true" />
              <span>Add Service Point</span>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 min-w-[44px] min-h-[44px] flex items-center justify-center transition"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-slate-800" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200/80 space-y-2.5 animate-slide-up">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${
                isActive('/')
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-600" />
              All Service Points
            </Link>
            <Link
              to="/places/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 text-center shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Add New Service Point
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
