interface ReportMetricsProps {
  totalSpend: number;
  totalOptimizedSpend: number;
  totalSavings: number;
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function ReportMetrics({
  totalSpend,
  totalOptimizedSpend,
  totalSavings,
}: ReportMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
          Current Monthly Spend
        </p>
        <p className="text-3xl font-bold text-gray-900">{formatUSD(totalSpend)}</p>
        <p className="text-sm text-gray-500 mt-1">per month</p>
      </div>

      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
          Optimized Spend
        </p>
        <p className="text-3xl font-bold text-gray-900">{formatUSD(totalOptimizedSpend)}</p>
        <p className="text-sm text-gray-500 mt-1">per month</p>
      </div>

      <div className="p-6 bg-green-50 border border-green-200 rounded-xl shadow-sm text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-600 mb-1">
          Potential Savings
        </p>
        <p className="text-3xl font-bold text-green-700">{formatUSD(totalSavings)}</p>
        <p className="text-sm text-green-600 mt-1">per month</p>
      </div>
    </div>
  );
}
