import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorMessage = ({
  message = 'An error occurred while loading data',
  details = null,
  onRetry = null,
  className = ''
}) => {
  return (
    <div
      role="alert"
      className={`rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 text-sm">
          <p className="font-semibold text-red-900">{message}</p>
          {details && typeof details === 'object' && Object.keys(details).length > 0 && (
            <ul className="mt-2 list-disc list-inside text-xs text-red-700 space-y-1">
              {Object.entries(details).map(([field, msg]) => (
                <li key={field}>
                  <strong className="capitalize">{field}</strong>: {msg}
                </li>
              ))}
            </ul>
          )}
          {typeof details === 'string' && (
            <p className="mt-1 text-xs text-red-700">{details}</p>
          )}
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-red-300 text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 min-h-[36px]"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
};
