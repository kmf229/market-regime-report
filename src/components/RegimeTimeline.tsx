"use client";

import { useState } from "react";
import { RegimePeriod } from "@/types/regime-data";

interface RegimeTimelineProps {
  history: RegimePeriod[];
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMonthYear(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export default function RegimeTimeline({ history }: RegimeTimelineProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Calculate total days for proportional widths
  const totalDays = history.reduce((sum, p) => sum + p.durationDays, 0);

  // Reverse to show oldest first (left to right)
  const periods = [...history].reverse();

  // Generate month markers
  const getTimeMarkers = () => {
    if (periods.length === 0) return [];

    const firstDate = new Date(periods[0].startDate + "T00:00:00");
    const lastDate = periods[periods.length - 1].endDate
      ? new Date(periods[periods.length - 1].endDate + "T00:00:00")
      : new Date();

    const markers: { date: Date; label: string; position: number }[] = [];
    const current = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);

    while (current <= lastDate) {
      const daysSinceStart = Math.floor(
        (current.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const position = (daysSinceStart / totalDays) * 100;

      if (position >= 0 && position <= 100) {
        markers.push({
          date: new Date(current),
          label: current.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          }),
          position,
        });
      }

      current.setMonth(current.getMonth() + 1);
    }

    // Filter to show every 2nd or 3rd marker if too many
    if (markers.length > 6) {
      return markers.filter((_, i) => i % 2 === 0);
    }
    return markers;
  };

  const markers = getTimeMarkers();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Regime History
      </h3>

      {/* Timeline container with room for tooltips */}
      <div className="relative pt-12 pb-6">
        {/* Timeline bar */}
        <div className="flex h-10 rounded-md border border-gray-200">
          {periods.map((period, idx) => {
            const widthPct = (period.durationDays / totalDays) * 100;
            const isBullish = period.regime === "bullish";
            const isCurrent = period.endDate === null;
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                className={`relative flex items-center justify-center text-xs font-medium cursor-pointer transition-all ${
                  isBullish
                    ? "bg-emerald-500 hover:bg-emerald-400"
                    : "bg-red-500 hover:bg-red-400"
                } ${isCurrent ? "ring-2 ring-inset ring-white/50" : ""} ${
                  idx === 0 ? "rounded-l-md" : ""
                } ${idx === periods.length - 1 ? "rounded-r-md" : ""}`}
                style={{ width: `${widthPct}%`, minWidth: "24px" }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {widthPct > 10 && (
                  <span className="text-white font-semibold text-[11px]">
                    {period.durationDays}d
                  </span>
                )}

                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50">
                    <div className="font-semibold capitalize text-sm">
                      {period.regime}
                    </div>
                    <div className="text-gray-300 mt-1">
                      {formatShortDate(period.startDate)} →{" "}
                      {period.endDate ? formatShortDate(period.endDate) : "Now"}
                    </div>
                    <div className="text-gray-300">
                      {period.durationDays} days
                    </div>
                    {period.returnPct !== undefined && (
                      <div
                        className={`font-semibold mt-1 ${
                          period.returnPct >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {period.returnPct >= 0 ? "+" : ""}
                        {period.returnPct.toFixed(1)}% return
                      </div>
                    )}
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Month/Year markers */}
        <div className="absolute bottom-0 left-0 right-0 h-5">
          {markers.map((marker, idx) => (
            <div
              key={idx}
              className="absolute transform -translate-x-1/2"
              style={{ left: `${marker.position}%` }}
            >
              <div className="w-px h-2 bg-gray-300 mx-auto"></div>
              <div className="text-[10px] text-gray-500 mt-0.5 whitespace-nowrap">
                {marker.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
          <span>Bullish (TQQQ)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-500"></div>
          <span>Bearish (GLD)</span>
        </div>
        <div className="ml-auto text-gray-400">Click segments for details</div>
      </div>
    </div>
  );
}

