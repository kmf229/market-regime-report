import { Summary } from "@/types/track-record";

interface BenchmarkComparisonProps {
  summary: Summary;
}

function formatPercent(value: number | null, showSign = true): string {
  if (value === null) return "N/A";
  const percent = value * 100;
  const formatted = percent.toFixed(2);
  if (showSign && value > 0) {
    return `+${formatted}%`;
  }
  return `${formatted}%`;
}

interface ComparisonRowProps {
  label: string;
  strategy: string;
  benchmark: string;
  difference: string;
  strategyClass?: string;
  benchmarkClass?: string;
  differenceClass?: string;
}

function ComparisonRow({
  label,
  strategy,
  benchmark,
  difference,
  strategyClass = "",
  benchmarkClass = "",
  differenceClass = "",
}: ComparisonRowProps) {
  return (
    <tr className="border-b border-gray-100 last:border-b-0">
      <td className="py-3 pr-4 text-sm text-gray-600">{label}</td>
      <td className={`py-3 px-4 text-sm font-mono font-medium text-right ${strategyClass}`}>
        {strategy}
      </td>
      <td className={`py-3 px-4 text-sm font-mono font-medium text-right ${benchmarkClass}`}>
        {benchmark}
      </td>
      <td className={`py-3 pl-4 text-sm font-mono font-medium text-right ${differenceClass}`}>
        {difference}
      </td>
    </tr>
  );
}

export default function BenchmarkComparison({ summary }: BenchmarkComparisonProps) {
  // Calculate differences
  const cumDiff = summary.sp500_cumulative_return !== null
    ? summary.cumulative_return - summary.sp500_cumulative_return
    : null;

  const cagrDiff = summary.sp500_cagr !== null
    ? summary.cagr - summary.sp500_cagr
    : null;

  const ddDiff = summary.sp500_max_drawdown !== null
    ? summary.max_drawdown - summary.sp500_max_drawdown
    : null;

  const rows = [
    {
      label: "Cumulative Return",
      strategy: formatPercent(summary.cumulative_return),
      benchmark: formatPercent(summary.sp500_cumulative_return),
      difference: formatPercent(cumDiff),
      strategyClass: summary.cumulative_return >= 0 ? "text-emerald-600" : "text-red-600",
      benchmarkClass: (summary.sp500_cumulative_return ?? 0) >= 0 ? "text-emerald-600" : "text-red-600",
      differenceClass: (cumDiff ?? 0) >= 0 ? "text-emerald-600" : "text-red-600",
    },
    {
      label: "CAGR",
      strategy: formatPercent(summary.cagr),
      benchmark: formatPercent(summary.sp500_cagr),
      difference: formatPercent(cagrDiff),
      strategyClass: summary.cagr >= 0 ? "text-emerald-600" : "text-red-600",
      benchmarkClass: (summary.sp500_cagr ?? 0) >= 0 ? "text-emerald-600" : "text-red-600",
      differenceClass: (cagrDiff ?? 0) >= 0 ? "text-emerald-600" : "text-red-600",
    },
    {
      label: "Max Drawdown",
      strategy: formatPercent(summary.max_drawdown, false),
      benchmark: formatPercent(summary.sp500_max_drawdown, false),
      // For drawdown, a HIGHER (less negative) number is better
      difference: ddDiff !== null ? formatPercent(ddDiff) : "N/A",
      strategyClass: "text-red-600",
      benchmarkClass: "text-red-600",
      // If strategy drawdown is less severe (higher/less negative), that's good
      differenceClass: (ddDiff ?? 0) >= 0 ? "text-emerald-600" : "text-red-600",
    },
  ];

  // Don't render if we have no S&P data
  if (summary.sp500_cumulative_return === null) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Benchmark Comparison
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Strategy performance compared to the S&P 500 (SPY) over the same period.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 pr-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Metric
              </th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Strategy
              </th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                S&P 500
              </th>
              <th className="py-3 pl-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Difference
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <ComparisonRow
                key={row.label}
                label={row.label}
                strategy={row.strategy}
                benchmark={row.benchmark}
                difference={row.difference}
                strategyClass={row.strategyClass}
                benchmarkClass={row.benchmarkClass}
                differenceClass={row.differenceClass}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
