'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Router Caught Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold text-rose-400 mb-2">Heritage Digital Twin Engine Notice</h2>
      <p className="text-slate-400 text-sm mb-6 max-w-md">{error.message || 'An unexpected rendering error occurred.'}</p>
      <button
        onClick={() => reset()}
        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm border border-slate-700"
      >
        Retry
      </button>
    </div>
  );
}

