'use client';

import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuditError({ error, reset }: ErrorPageProps) {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4" aria-hidden="true">
          ⚠️
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Data Retrieval Failed</h1>
        <p className="text-gray-600 mb-2">
          We encountered an error while loading your audit report. This is likely a temporary
          issue.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-4 font-mono">Error ID: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={reset}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
