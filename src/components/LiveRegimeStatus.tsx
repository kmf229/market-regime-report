"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { RegimeData } from "@/types/regime-data";
import RegimeStats from "@/components/RegimeStats";
import RegimeCalendar from "@/components/RegimeCalendar";
import RegimeContext from "@/components/RegimeContext";

interface LiveRegimeStatusProps {
  initialData: RegimeData;
}

export default function LiveRegimeStatus({
  initialData,
}: LiveRegimeStatusProps) {
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
          signalRegime: row.signal_regime ?? row.current_regime,
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
          currentTradeEntryPrice: row.current_trade_entry_price ?? null,
        });
      }
    };

    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Check if we're in a potential regime change state (signal differs from official)
  const isPotentialFlip = data.signalRegime !== data.currentRegime;

  return (
    <section id="overview" className="mb-12">
      {/* Header + Speedometer */}
      <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Current Regime
          </h1>
          <LastUpdatedTimestamp lastUpdated={data.lastUpdated} />

          {/* Potential Regime Change Alert */}
          {isPotentialFlip && (
            <div className="mt-4 mb-2">
              <PotentialRegimeChangeAlert
                currentRegime={data.currentRegime}
                signalRegime={data.signalRegime}
              />
            </div>
          )}

          {/* What This Means - shows official position */}
          <div className="mt-6">
            <RegimeContext
              regime={data.currentRegime}
              strength={data.regimeStrength}
              signalRegime={data.signalRegime}
            />
          </div>
        </div>

        {/* Speedometer */}
        <div className="relative w-full md:w-[380px] h-64 flex-shrink-0">
          <Image
            src={`${data.speedometerUrl || "/images/regime_speedometer.png"}?t=${new Date(data.lastUpdated).getTime()}`}
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

      {/* Regime Calendar */}
      <div className="mt-6">
        <RegimeCalendar history={data.regimeHistory} />
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
      timeZoneName: "short",
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

// Alert shown when intraday signal differs from official regime
function PotentialRegimeChangeAlert({
  currentRegime,
  signalRegime,
}: {
  currentRegime: "bullish" | "bearish";
  signalRegime: "bullish" | "bearish";
}) {
  const flippingTo = signalRegime === "bullish" ? "bullish" : "bearish";
  const newTicker = flippingTo === "bullish" ? "TQQQ" : "GLD";
  const currentTicker = currentRegime === "bullish" ? "TQQQ" : "GLD";

  return (
    <div className="rounded-lg border-2 border-amber-400 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-amber-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-bold text-amber-800">
            Potential Regime Change
          </h3>
          <p className="mt-1 text-sm text-amber-700">
            The intraday signal is now showing <strong>{flippingTo}</strong>, but
            the regime won&apos;t officially flip until the market close at 4pm ET.
            Currently still positioned in <strong>{currentTicker}</strong>. If the
            signal holds through the close, we&apos;ll rotate into{" "}
            <strong>{newTicker}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

