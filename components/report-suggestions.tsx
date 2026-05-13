import type { ToolAuditResult } from '@/lib/types';

interface ReportSuggestionsProps {
  toolResults: ToolAuditResult[];
}

export function ReportSuggestions({ toolResults }: ReportSuggestionsProps) {
  const suggestions = toolResults.filter((r) => r.savings > 0);

  if (suggestions.length === 0) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl">
        <p className="text-gray-600">
          You&apos;re already on optimal plans for all your tools. Great job!
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
      <h3 className="text-lg font-semibold text-green-900 mb-3">💡 Savings Opportunities</h3>
      <ul className="space-y-2">
        {suggestions.map((result, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-green-800">
            <span className="text-green-600 font-bold">→</span>
            <span>
              Switch <strong>{result.toolName}</strong> to the{' '}
              <strong>{result.optimizedPlanName}</strong> plan to save{' '}
              <strong>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                }).format(result.savings)}
                /month
              </strong>
              .
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
