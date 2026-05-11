import { AuditForm } from '@/components/audit-form';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">AI Spend Auditor</h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Find out how much you could save on your AI tool subscriptions. Enter your current
            tools, plans, and costs — we'll show you the cheapest viable options.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Your AI Subscriptions</h2>
          <AuditForm />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Pricing data is representative and may not reflect current vendor pricing.
        </p>
      </div>
    </main>
  );
}
