"use client";

import { useState, useMemo } from "react";
import { RegimePeriod } from "@/types/regime-data";

interface RegimeCalendarProps {
  history: RegimePeriod[];
}

interface DayInfo {
  date: Date;
  regime: "bullish" | "bearish" | null;
  periodIndex: number | null; // Index into history array
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateRange(startDate: string, endDate: string | null): string {
  const start = new Date(startDate + "T00:00:00");
  const startStr = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  if (!endDate) {
    return `${startStr} → Now`;
  }

  const end = new Date(endDate + "T00:00:00");
  const endStr = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${startStr} → ${endStr}`;
}

// Generate calendar days for a given month
function getMonthDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

  const days: (Date | null)[] = [];

  // Add empty cells for days before the 1st
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  return days;
}

// Get last 12 months as [year, month] pairs
function getLast12Months(): { year: number; month: number }[] {
  const months: { year: number; month: number }[] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() });
  }

  return months;
}

export default function RegimeCalendar({ history }: RegimeCalendarProps) {
  const [hoveredPeriodIdx, setHoveredPeriodIdx] = useState<number | null>(null);

  // Build a map of date string -> period index for fast lookup
  const dateToRegime = useMemo(() => {
    const map = new Map<string, { regime: "bullish" | "bearish"; periodIndex: number }>();

    history.forEach((period, idx) => {
      const start = new Date(period.startDate + "T00:00:00");
      const end = period.endDate
        ? new Date(period.endDate + "T00:00:00")
        : new Date(); // Current period extends to today

      // Iterate through each day in the period
      const current = new Date(start);
      while (current <= end) {
        const dateStr = current.toISOString().split("T")[0];
        map.set(dateStr, { regime: period.regime, periodIndex: idx });
        current.setDate(current.getDate() + 1);
      }
    });

    return map;
  }, [history]);

  const months = getLast12Months();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Regime Calendar
      </h3>

      {/* Calendar Grid - 4 columns x 3 rows */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {months.map(({ year, month }) => {
          const days = getMonthDays(year, month);
          const monthName = new Date(year, month).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          });

          return (
            <div key={`${year}-${month}`} className="min-w-0">
              {/* Month header */}
              <div className="text-xs font-medium text-gray-700 mb-1.5 text-center">
                {monthName}
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-px mb-0.5">
                {weekDays.map((day, i) => (
                  <div
                    key={i}
                    className="text-[9px] text-gray-400 text-center"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-px">
                {days.map((date, i) => {
                  if (!date) {
                    return <div key={i} className="aspect-square" />;
                  }

                  const dateStr = date.toISOString().split("T")[0];
                  const regimeInfo = dateToRegime.get(dateStr);
                  const isToday = date.getTime() === today.getTime();
                  const isFuture = date > today;
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  const isHoveredPeriod =
                    hoveredPeriodIdx !== null &&
                    regimeInfo?.periodIndex === hoveredPeriodIdx;

                  // Base styles
                  let bgColor = "bg-gray-100"; // No data
                  let textColor = "text-gray-400";
                  let ringStyle = "";

                  if (regimeInfo && !isFuture) {
                    if (regimeInfo.regime === "bullish") {
                      bgColor = isHoveredPeriod
                        ? "bg-emerald-300"
                        : "bg-emerald-500";
                      textColor = "text-white";
                    } else {
                      bgColor = isHoveredPeriod ? "bg-red-300" : "bg-red-500";
                      textColor = "text-white";
                    }
                  }

                  if (isToday) {
                    ringStyle = "ring-2 ring-gray-900 ring-offset-1";
                  }

                  return (
                    <div
                      key={i}
                      className={`aspect-square flex items-center justify-center text-[9px] font-medium rounded-sm cursor-pointer transition-colors ${bgColor} ${textColor} ${ringStyle}`}
                      onMouseEnter={() => {
                        if (regimeInfo) {
                          setHoveredPeriodIdx(regimeInfo.periodIndex);
                        }
                      }}
                      onMouseLeave={() => setHoveredPeriodIdx(null)}
                    >
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hover tooltip - fixed position at bottom */}
      {hoveredPeriodIdx !== null && history[hoveredPeriodIdx] && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <HoverDetails period={history[hoveredPeriodIdx]} />
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3 mt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
          <span>Bullish (TQQQ)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-500"></div>
          <span>Bearish (GLD)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-300"></div>
          <span>No data</span>
        </div>
        <div className="ml-auto text-gray-400">Hover for details</div>
      </div>
    </div>
  );
}

// Details panel shown when hovering over a regime period
function HoverDetails({ period }: { period: RegimePeriod }) {
  const isBullish = period.regime === "bullish";

  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-lg ${
        isBullish ? "bg-emerald-50" : "bg-red-50"
      }`}
    >
      {/* Regime indicator */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isBullish ? "bg-emerald-500" : "bg-red-500"
        }`}
      >
        {isBullish ? (
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div
          className={`text-sm font-bold capitalize ${
            isBullish ? "text-emerald-700" : "text-red-700"
          }`}
        >
          {period.regime}
        </div>
        <div className="text-xs text-gray-600 mt-0.5">
          {formatDateRange(period.startDate, period.endDate)}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {period.durationDays}
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">
            Days
          </div>
        </div>

        {period.returnPct !== undefined && (
          <div className="text-center">
            <div
              className={`text-lg font-bold ${
                period.returnPct >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {period.returnPct >= 0 ? "+" : ""}
              {period.returnPct.toFixed(1)}%
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">
              Return
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
