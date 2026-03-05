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

