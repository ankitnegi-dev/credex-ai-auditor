import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAuditById } from '@/lib/supabase';
import { ReportMetrics } from '@/components/report-metrics';
import { ReportBreakdownTable } from '@/components/report-breakdown-table';
import { ReportSuggestions } from '@/components/report-suggestions';
import { CopyLinkButton } from '@/components/copy-link-button';
import { EmailForm } from '@/components/email-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const canonicalUrl = `${baseUrl}/audit/${id}`;

  try {
    const audit = await getAuditById(id);
    if (!audit) {
      return {
        title: 'Audit Not Found — AI Spend Auditor',
        description: 'This audit could not be found.',
      };
    }

    const savingsFormatted = formatUSD(audit.total_savings);
    return {
      title: `Save ${savingsFormatted}/month on AI tools — AI Spend Auditor`,
      description: `This audit found ${savingsFormatted} in potential monthly savings on AI tool subscriptions.`,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: `Save ${savingsFormatted}/month on AI tools`,
        description: `This audit found ${savingsFormatted} in potential monthly savings on AI tool subscriptions. View the full breakdown.`,
        url: canonicalUrl,
        type: 'website',
      },
    };
  } catch {
    return {
      title: 'AI Spend Auditor',
      description: 'Audit your AI tool subscriptions.',
    };
  }
}

export default async function AuditReportPage({ params }: PageProps) {
  // Next.js 16: params is a Promise — must be awaited
  const { id } = await params;

  const audit = await getAuditById(id);

  if (!audit) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const reportUrl = `${baseUrl}/audit/${id}`;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your AI Spend Audit</h1>
            <p className="text-sm text-gray-500 mt-1">
              Audit ID: <span className="font-mono">{audit.id}</span>
            </p>
          </div>
          <CopyLinkButton url={reportUrl} />
        </div>

        {/* Summary Metrics */}
        <section aria-labelledby="metrics-heading">
          <h2 id="metrics-heading" className="sr-only">
            Summary Metrics
          </h2>
          <ReportMetrics
            totalSpend={audit.total_spend}
            totalOptimizedSpend={audit.total_optimized_spend}
            totalSavings={audit.total_savings}
          />
        </section>

        {/* Claude AI Summary */}
        {audit.summary && (
          <section
            aria-labelledby="summary-heading"
            className="p-6 bg-indigo-50 border border-indigo-200 rounded-xl"
          >
            <h2 id="summary-heading" className="text-lg font-semibold text-indigo-900 mb-2">
              ✨ AI Summary
            </h2>
            <p className="text-indigo-800 leading-relaxed">{audit.summary}</p>
          </section>
        )}

        {/* Savings Suggestions */}
        <section aria-labelledby="suggestions-heading">
          <h2 id="suggestions-heading" className="text-xl font-semibold text-gray-900 mb-3">
            Recommendations
          </h2>
          <ReportSuggestions toolResults={audit.tool_results} />
        </section>

        {/* Per-Tool Breakdown */}
        <section aria-labelledby="breakdown-heading">
          <h2 id="breakdown-heading" className="text-xl font-semibold text-gray-900 mb-3">
            Per-Tool Breakdown
          </h2>
          <ReportBreakdownTable toolResults={audit.tool_results} />
        </section>

        {/* Email Form */}
        <section aria-labelledby="email-heading">
          <h2 id="email-heading" className="sr-only">
            Email Report
          </h2>
          <EmailForm auditId={audit.id} />
        </section>

        {/* Back link */}
        <div className="text-center">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← Run another audit
          </Link>
        </div>
      </div>
    </main>
  );
}
