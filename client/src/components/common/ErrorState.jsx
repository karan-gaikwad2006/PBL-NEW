import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Button from './Button';

export function ErrorBanner({ message = 'An error occurred. Please try again.', onDismiss }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-xs font-semibold underline hover:text-red-900 ml-4 focus:outline-none"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}

export default function ErrorState({
  title = 'Something went wrong',
  description = 'We encountered an error while loading this content. Please check your connection or try again.',
  onRetry,
  className = ''
}) {
  return (
    <div className={`bg-white rounded-2xl border border-red-100 p-12 text-center flex flex-col items-center justify-center ${className}`}>
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-[#1F2933]">{title}</h3>
      <p className="text-sm text-[#64707A] max-w-md mt-1.5 leading-relaxed">{description}</p>
      {onRetry && (
        <div className="mt-6">
          <Button variant="outline" onClick={onRetry} icon={RotateCcw}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
