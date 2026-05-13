import { AuditForm } from '@/components/audit-form';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-16">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wide">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            Free — No signup required
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Spend<span className="text-blue-600">Lens</span>
          </h1>
          <p className="text-xl font-medium text-gray-500 mb-4">AI Spend Auditor</p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            The average startup overpays <strong className="text-gray-900">$340/month</strong> on AI subscriptions.
            Enter your tools and see exactly where your money is going — in 60 seconds.
          </p>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              15 AI tools covered
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Shareable report URL
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              AI-powered summary
            </span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Your AI Subscriptions</h2>
            <p className="text-blue-100 text-sm mt-0.5">Add each tool you pay for — we&apos;ll find the savings</p>
          </div>
          <div className="p-6 md:p-8">
            <AuditForm />
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Pricing data sourced from official vendor pages. Results are estimates based on published pricing tiers.
        </p>
      </div>
    </main>
  );
}
