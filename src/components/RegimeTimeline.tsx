"use client";

import { RegimePeriod } from "@/types/regime-data";

interface RegimeTimelineProps {
  history: RegimePeriod[];
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function RegimeTimeline({ history }: RegimeTimelineProps) {
  // Calculate total days for proportional widths
  const totalDays = history.reduce((sum, p) => sum + p.durationDays, 0);

  // Reverse to show oldest first (left to right)
  const periods = [...history].reverse();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Regime History (Last 12 Months)
      </h3>

      {/* Timeline bar */}
      <div className="flex h-8 rounded-md overflow-hidden border border-gray-200">
        {periods.map((period, idx) => {
          const widthPct = (period.durationDays / totalDays) * 100;
          const isBullish = period.regime === "bullish";
          const isCurrent = period.endDate === null;

          return (
            <div
              key={idx}
              className={`relative group flex items-center justify-center text-xs font-medium transition-all ${
                isBullish
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-red-500 hover:bg-red-600"
              } ${isCurrent ? "ring-2 ring-inset ring-white/50" : ""}`}
              style={{ width: `${widthPct}%`, minWidth: "20px" }}
            >
              {widthPct > 8 && (
                <span className="text-white/90 text-[10px]">
                  {period.durationDays}d
                </span>
              )}

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                <div className="font-medium capitalize">{period.regime}</div>
                <div>
                  {formatShortDate(period.startDate)} -{" "}
                  {period.endDate ? formatShortDate(period.endDate) : "Now"}
                </div>
                <div>{period.durationDays} days</div>
                {period.returnPct !== undefined && (
                  <div
                    className={
                      period.returnPct >= 0 ? "text-emerald-400" : "text-red-400"
                    }
                  >
                    {period.returnPct >= 0 ? "+" : ""}
                    {period.returnPct.toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
          <span>Bullish (TQQQ)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-500"></div>
          <span>Bearish (GLD)</span>
        </div>
        <div className="ml-auto text-gray-400">Hover for details</div>
      </div>
    </div>
  );
}
