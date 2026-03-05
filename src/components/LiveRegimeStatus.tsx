"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { RegimeData } from "@/types/regime-data";
import RegimeStats from "@/components/RegimeStats";
import RegimeTimeline from "@/components/RegimeTimeline";
import RegimeContext from "@/components/RegimeContext";

interface LiveRegimeStatusProps {
  initialData: RegimeData;
}

export default function LiveRegimeStatus({ initialData }: LiveRegimeStatusProps) {
  const [data, setData] = useState<RegimeData>(initialData);

  useEffect(() => {
    const supabase = createClient();

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

    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="overview" className="mb-12">
      {/* Header + Speedometer */}
      <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Current Regime
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Real-time market regime status and daily updates
          </p>
          <LastUpdatedTimestamp lastUpdated={data.lastUpdated} />

          {/* What This Means */}
          <div className="mt-6">
            <RegimeContext regime={data.currentRegime} strength={data.regimeStrength} />
          </div>
        </div>

        {/* Speedometer */}
        <div className="relative w-full md:w-[380px] h-64 flex-shrink-0">
          <Image
            src={data.speedometerUrl || "/images/regime_speedometer.png"}
            alt="Current Market Regime"
            fill
            className="object-contain"
            priority
            unoptimized
          />
        </div>
      </div>

      {/* Stats Panel */}
      <RegimeStats data={data} />

      {/* Current Trade P&L */}
      <div className="mt-6">
        <CurrentTradePnL
          regime={data.currentRegime}
          returnPct={data.currentTradeReturn}
          startDate={data.currentTradeStart}
        />
      </div>

      {/* Timeline */}
      <div className="mt-6">
        <RegimeTimeline history={data.regimeHistory} />
      </div>
    </section>
  );
}

// Helper component to display the last updated timestamp
export function LastUpdatedTimestamp({ lastUpdated }: { lastUpdated: string }) {
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    if (isToday) {
      return `Today at ${timeStr}`;
    }

    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return `${dateStr} at ${timeStr}`;
  };

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span>Updated {formatDateTime(lastUpdated)}</span>
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
  const isBullish = regime === "bullish";

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate days in trade
  const start = new Date(startDate + "T00:00:00");
  const now = new Date();
  const diffTime = now.getTime() - start.getTime();
  const daysInTrade = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-gray-600">Current Trade</div>
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded ${
            isBullish
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {isBullish ? "BULLISH" : "BEARISH"}
        </span>
      </div>

      <div className="flex items-baseline gap-3 mb-3">
        <span
          className={`text-3xl font-bold ${
            isPositive ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {isPositive ? "+" : ""}
          {returnPct.toFixed(1)}%
        </span>
        <span className="text-lg font-medium text-gray-700">{ticker}</span>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <div>
          <span className="text-gray-400">Entry:</span>{" "}
          <span className="text-gray-600">{formatDate(startDate)}</span>
        </div>
        <div className="text-gray-300">|</div>
        <div>
          <span className="text-gray-400">Duration:</span>{" "}
          <span className="text-gray-600">{daysInTrade} days</span>
        </div>
      </div>
    </div>
  );
}
