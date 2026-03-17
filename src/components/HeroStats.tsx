import { Summary } from "@/types/track-record";

interface HeroStatsProps {
  summary: Summary;
}

function formatPercent(value: number): string {
  const percent = value * 100;
  const formatted = percent.toFixed(1);
  if (value > 0) {
    return `+${formatted}%`;
  }
  return `${formatted}%`;
}

export default function HeroStats({ summary }: HeroStatsProps) {
  const stats = [
    {
      label: "Cumulative Return",
      value: formatPercent(summary.cumulative_return),
      positive: summary.cumulative_return >= 0,
    },
    {
      label: "Alpha vs S&P 500",
      value: summary.alpha_vs_sp500 !== null ? formatPercent(summary.alpha_vs_sp500) : "N/A",
      positive: (summary.alpha_vs_sp500 ?? 0) >= 0,
    },
    {
      label: "CAGR",
      value: formatPercent(summary.cagr),
      positive: summary.cagr >= 0,
    },
    {
      label: "Sharpe Ratio",
      value: summary.sharpe_ratio !== null ? summary.sharpe_ratio.toFixed(2) : "N/A",
      positive: (summary.sharpe_ratio ?? 0) >= 1,
    },
    {
      label: "Max Drawdown",
      value: formatPercent(summary.max_drawdown),
      positive: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-gray-200 rounded-lg p-4 md:p-6"
        >
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {stat.label}
          </p>
          <p
            className={`mt-2 text-2xl md:text-3xl font-bold font-mono ${
              stat.label === "Max Drawdown"
                ? "text-red-600"
                : stat.positive
                  ? "text-emerald-600"
                  : "text-gray-900"
            }`}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
