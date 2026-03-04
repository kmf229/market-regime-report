import { RegimeData } from "@/types/regime-data";

interface RegimeStatsProps {
  data: RegimeData;
}

export default function RegimeStats({ data }: RegimeStatsProps) {
  const stats = [
    {
      label: "Days in Regime",
      value: data.daysInCurrentRegime,
      subtext: `Current ${data.currentRegime} regime`,
    },
    {
      label: "Regime Changes (YTD)",
      value: data.regimeChangesThisYear,
      subtext: "Signals this year",
    },
    {
      label: "Avg Duration",
      value: `${data.avgRegimeDurationDays}d`,
      subtext: "Per regime period",
    },
    {
      label: "Regime Strength",
      value: data.regimeStrength.toFixed(2),
      subtext: `${data.strengthChange >= 0 ? "+" : ""}${data.strengthChange.toFixed(2)} vs yesterday`,
      highlight: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`p-4 rounded-lg border ${
            stat.highlight
              ? data.currentRegime === "bullish"
                ? "bg-emerald-50 border-emerald-200"
                : "bg-red-50 border-red-200"
              : "bg-white border-gray-200"
          }`}
        >
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {stat.label}
          </p>
          <p
            className={`text-2xl font-bold mt-1 ${
              stat.highlight
                ? data.currentRegime === "bullish"
                  ? "text-emerald-700"
                  : "text-red-700"
                : "text-gray-900"
            }`}
          >
            {stat.value}
          </p>
          <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
        </div>
      ))}
    </div>
  );
}
