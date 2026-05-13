import Link from 'next/link';

export default function AuditNotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4" aria-hidden="true">
          🔍
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Audit Not Found</h1>
        <p className="text-gray-600 mb-6">
          We could not find an audit with that ID. It may have been deleted or the link may be
          incorrect.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          ← Start a New Audit
        </Link>
      </div>
    </main>
  );
}
