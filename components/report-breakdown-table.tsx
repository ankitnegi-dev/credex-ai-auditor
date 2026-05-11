import type { ToolAuditResult } from '@/lib/types';

interface ReportBreakdownTableProps {
  toolResults: ToolAuditResult[];
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function ReportBreakdownTable({ toolResults }: ReportBreakdownTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Tool</th>
            <th className="px-4 py-3">Current Plan</th>
            <th className="px-4 py-3">Current Cost</th>
            <th className="px-4 py-3">Optimized Plan</th>
            <th className="px-4 py-3">Optimized Cost</th>
            <th className="px-4 py-3 text-green-700">Savings</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {toolResults.map((result, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{result.toolName}</td>
              <td className="px-4 py-3 text-gray-600">{result.userPlan}</td>
              <td className="px-4 py-3 text-gray-600">{formatUSD(result.userMonthlyCost)}</td>
              <td className="px-4 py-3 text-gray-600">{result.optimizedPlanName}</td>
              <td className="px-4 py-3 text-gray-600">{formatUSD(result.optimizedMonthlyCost)}</td>
              <td className="px-4 py-3 font-semibold text-green-700">
                {result.savings > 0 ? formatUSD(result.savings) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
