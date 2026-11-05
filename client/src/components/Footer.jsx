import React from 'react';
import { Clock, Heart, ShieldAlert, Sparkles, Building2, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-200/90 bg-white/80 backdrop-blur-md py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & mission (2 cols on tablet/desktop) */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <span className="font-black text-slate-900 text-lg tracking-tight">LocalWait Times</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md">
              A community-submitted wait-time journal for local service points: banks, post offices,
              copy shops, municipal counters, and walk-in clinics. Helping neighbors save hours by dodging peak crowds.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Free · No Registration Required</span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs tracking-wider uppercase mb-3">
              Explore Directory
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <Link to="/" className="hover:text-emerald-700 transition flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Browse All Service Points</span>
                </Link>
              </li>
              <li>
                <Link to="/places/new" className="hover:text-emerald-700 transition flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Register a New Location</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Prominent Community Disclaimer Box */}
          <div className="bg-amber-500/10 border border-amber-300/80 rounded-2xl p-4 text-xs text-amber-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>User-Reported Data Notice</span>
            </div>
            <p className="text-amber-900/90 leading-relaxed text-[11px]">
              Every piece of wait data on LocalWait Times is community-submitted and explicitly <strong>user-reported</strong>.
              It represents real citizen observations, never official provider figures.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} LocalWait Times Journal. Open citizen data.</p>
          <p className="flex items-center gap-1 font-medium">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for local communities
          </p>
        </div>
      </div>
    </footer>
  );
};
