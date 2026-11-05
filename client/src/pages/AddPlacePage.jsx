import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  PlusCircle,
  CheckCircle2,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { api } from '../api.js';
import { Loader } from '../components/Loader.jsx';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { useToast } from '../components/Toast.jsx';

const CATEGORIES = [
  { name: 'Copy Shop', desc: 'Xerox, print, binding & lamination hubs' },
  { name: 'Bank', desc: 'Cash counters, teller desks & customer service' },
  { name: 'Post Office', desc: 'Speed post, parcel dispatch & stamp counters' },
  { name: 'Government Office', desc: 'Passports, civic documents & municipal desks' },
  { name: 'Clinic/Pharmacy', desc: 'Prescription counters & walk-in clinics' },
  { name: 'Other', desc: 'Utility bill counters & neighborhood services' }
];

export const AddPlacePage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Copy Shop');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  const validate = () => {
    const errs = {};
    const trimmedName = name.trim();

    if (!trimmedName) {
      errs.name = 'Place name is required';
    } else if (trimmedName.length < 2) {
      errs.name = 'Place name must be at least 2 characters';
    } else if (trimmedName.length > 80) {
      errs.name = 'Place name cannot exceed 80 characters';
    }

    if (!category || !CATEGORIES.some((c) => c.name === category)) {
      errs.category = 'Please choose a valid category';
    }

    if (address && address.trim().length > 160) {
      errs.address = 'Address cannot exceed 160 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    try {
      setSubmitting(true);
      const newPlace = await api.createPlace({
        name: name.trim(),
        category,
        address: address.trim()
      });

      showToast(`Registered "${name.trim()}"! You can now log wait times.`, 'success');
      navigate(`/places/${newPlace.id || newPlace._id}`);
    } catch (err) {
      if (err.status === 409) {
        setGeneralError('A service point with this exact name and address already exists in the community journal.');
      } else if (err.details && typeof err.details === 'object') {
        setErrors(err.details);
      } else {
        setGeneralError(err.message || 'Failed to create place. Please try again.');
      }
      showToast('Could not register place. Please check errors.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Back Link */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Places</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 flex-shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Add a Service Point
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Add a local counter or shop so you and your neighbors can track and log wait times.
            </p>
          </div>
        </div>

        <hr className="border-slate-100" />

        {generalError && (
          <div role="alert" className="animate-slide-up">
            <ErrorMessage message={generalError} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="place-name" className="block text-xs font-bold text-slate-800 mb-1.5">
              Service Point Name *
            </label>
            <input
              id="place-name"
              type="text"
              required
              maxLength={80}
              placeholder="e.g. State Bank Customer Service Branch, City Copy Center"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
              }}
              className={`w-full px-4 py-3 text-sm font-medium rounded-xl border ${
                errors.name ? 'border-red-400 bg-red-50/50' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[46px]`}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5">
              <span>{errors.name ? <span className="text-red-600 font-semibold">{errors.name}</span> : '2–80 characters.'}</span>
              <span>{name.length}/80</span>
            </div>
          </div>

          {/* Category Tile Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Category *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => {
                      setCategory(cat.name);
                      if (errors.category) setErrors((prev) => ({ ...prev, category: null }));
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                        {cat.name}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight">
                      {cat.desc}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.category && (
              <p className="mt-1.5 text-xs text-red-600 font-semibold" role="alert">
                {errors.category}
              </p>
            )}
          </div>

          {/* Address Field */}
          <div>
            <label htmlFor="place-address" className="block text-xs font-bold text-slate-800 mb-1.5">
              Address / Location Specifics (Optional)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="place-address"
                type="text"
                maxLength={160}
                placeholder="e.g. 14 Market Street, Opposite Bus Terminus, Sector 4"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (errors.address) setErrors((prev) => ({ ...prev, address: null }));
                }}
                className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border ${
                  errors.address ? 'border-red-400 bg-red-50/50' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[46px]`}
                aria-invalid={!!errors.address}
                aria-describedby={errors.address ? 'address-error' : undefined}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5">
              <span>{errors.address ? <span className="text-red-600 font-semibold">{errors.address}</span> : 'Distinguishes between branches in the same city.'}</span>
              <span>{address.length}/160</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto px-5 py-3 text-center text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition min-h-[44px] flex items-center justify-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50 min-h-[46px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {submitting ? (
                <>
                  <Loader size="sm" message="" />
                  <span>Registering Service Point...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Register Location</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
