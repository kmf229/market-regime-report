"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RegimeData } from "@/types/regime-data";

interface LiveRegimeStatusProps {
  initialData: RegimeData;
  children: (data: RegimeData) => React.ReactNode;
}

export default function LiveRegimeStatus({
  initialData,
  children,
}: LiveRegimeStatusProps) {
  const [data, setData] = useState<RegimeData>(initialData);

  useEffect(() => {
    const supabase = createClient();

    // Fetch latest data
    const fetchData = async () => {
      const { data: row, error } = await supabase
        .from("regime_status")
        .select("*")
        .limit(1)
        .single();

      if (!error && row) {
        setData({
          currentRegime: row.current_regime,
          regimeStrength: row.regime_strength,
          strengthChange: row.strength_change,
          lastUpdated: row.last_updated,
          daysInCurrentRegime: row.days_in_current_regime,
          regimeChangesThisYear: row.regime_changes_this_year,
          avgRegimeDurationDays: row.avg_regime_duration_days,
          regimeHistory: row.regime_history,
          speedometerUrl: row.speedometer_url,
          currentTradeReturn: row.current_trade_return ?? null,
          currentTradeStart: row.current_trade_start ?? null,
        });
      }
    };

    // Poll every 60 seconds
    const interval = setInterval(fetchData, 60000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  return <>{children(data)}</>;
}

// Helper component to display the last updated timestamp
export function LastUpdatedTimestamp({ lastUpdated }: { lastUpdated: string }) {
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    const updateTimeAgo = () => {
      const updated = new Date(lastUpdated);
      const now = new Date();
      const diffMs = now.getTime() - updated.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) {
        setTimeAgo("just now");
      } else if (diffMins < 60) {
        setTimeAgo(`${diffMins} min${diffMins === 1 ? "" : "s"} ago`);
      } else if (diffHours < 24) {
        setTimeAgo(`${diffHours} hour${diffHours === 1 ? "" : "s"} ago`);
      } else {
        setTimeAgo(updated.toLocaleDateString());
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [lastUpdated]);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span>
        Updated {formatTime(lastUpdated)} ({timeAgo})
      </span>
    </div>
  );
}

// Helper component to display current trade P&L
export function CurrentTradePnL({
  regime,
  returnPct,
  startDate,
}: {
  regime: "bullish" | "bearish";
  returnPct: number | null;
  startDate: string | null;
}) {
  if (returnPct === null || startDate === null) {
    return null;
  }

  const isPositive = returnPct >= 0;
  const ticker = regime === "bullish" ? "TQQQ" : "GLD";

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="text-sm text-gray-600 mb-1">Current Trade</div>
      <div className="flex items-baseline gap-2">
        <span
          className={`text-2xl font-bold ${
            isPositive ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {isPositive ? "+" : ""}
          {returnPct.toFixed(1)}%
        </span>
        <span className="text-gray-500 text-sm">
          {ticker} since {formatDate(startDate)}
        </span>
      </div>
    </div>
  );
}
