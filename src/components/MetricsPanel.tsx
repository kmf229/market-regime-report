import { Summary } from "@/types/track-record";

interface MetricsPanelProps {
  summary: Summary;
}

function formatPercent(value: number, showSign = true): string {
  const percent = value * 100;
  const formatted = percent.toFixed(2);
  if (showSign && value > 0) {
    return `+${formatted}%`;
  }
  return `${formatted}%`;
}

function formatDate(dateStr: string): string {
  // Parse YYYY-MM-DD directly to avoid timezone issues
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatMonthLabel(label: string): string {
  const [year, month] = label.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

interface MetricRowProps {
  label: string;
  value: string;
  valueClass?: string;
}

function MetricRow({ label, value, valueClass = "" }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-gray-600 text-sm">{label}</span>
      <span className={`font-mono text-sm font-medium ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

export default function MetricsPanel({ summary }: MetricsPanelProps) {
  const metrics = [
    {
      label: "Strategy Period",
      value: `${formatDate(summary.start_date)} — ${formatDate(summary.data_through)}`,
    },
    {
      label: "Strategy Length",
      value: `${summary.strategy_length_days} days (${summary.strategy_length_years.toFixed(2)} years)`,
    },
    {
      label: "Cumulative Return",
      value: formatPercent(summary.cumulative_return),
      valueClass:
        summary.cumulative_return >= 0 ? "text-positive" : "text-negative",
    },
    {
      label: "CAGR",
      value: formatPercent(summary.cagr),
      valueClass: summary.cagr >= 0 ? "text-positive" : "text-negative",
    },
    {
      label: "Max Drawdown",
      value: formatPercent(summary.max_drawdown, false),
      valueClass: "text-negative",
    },
    {
      label: "Sharpe Ratio",
      value:
        summary.sharpe_ratio !== null
          ? summary.sharpe_ratio.toFixed(2)
          : "N/A",
    },
    {
      label: "Avg Monthly Return",
      value: formatPercent(summary.avg_monthly_return),
      valueClass:
        summary.avg_monthly_return >= 0 ? "text-positive" : "text-negative",
    },
    {
      label: "Best Month",
      value: `${formatPercent(summary.best_month_return)} (${formatMonthLabel(summary.best_month_label)})`,
      valueClass: "text-positive",
    },
    {
      label: "Worst Month",
      value: `${formatPercent(summary.worst_month_return)} (${formatMonthLabel(summary.worst_month_label)})`,
      valueClass: "text-negative",
    },
    {
      label: "% Up Months",
      value: formatPercent(summary.up_months_pct, false),
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Performance Summary
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8">
        {metrics.map((metric, index) => (
          <MetricRow
            key={index}
            label={metric.label}
            value={metric.value}
            valueClass={metric.valueClass}
          />
        ))}
      </div>
    </div>
  );
}
