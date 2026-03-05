import { createClient } from "@/lib/supabase/server";
import { RegimeData, RegimePeriod } from "@/types/regime-data";

interface RegimeStatusRow {
  current_regime: "bullish" | "bearish";
  regime_strength: number;
  strength_change: number;
  last_updated: string;
  days_in_current_regime: number;
  regime_changes_this_year: number;
  avg_regime_duration_days: number;
  regime_history: RegimePeriod[];
  speedometer_url: string | null;
  current_trade_return: number | null;
  current_trade_start: string | null;
}

export async function getRegimeData(): Promise<RegimeData> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("regime_status")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching regime data:", error);
    // Return fallback data
    return {
      currentRegime: "bearish",
      regimeStrength: 0,
      strengthChange: 0,
      lastUpdated: new Date().toISOString().split("T")[0],
      daysInCurrentRegime: 0,
      regimeChangesThisYear: 0,
      avgRegimeDurationDays: 0,
      regimeHistory: [],
      speedometerUrl: null,
      currentTradeReturn: null,
      currentTradeStart: null,
    };
  }

  const row = data as RegimeStatusRow;

  return {
    currentRegime: row.current_regime,
    regimeStrength: row.regime_strength,
    strengthChange: row.strength_change,
    lastUpdated: row.last_updated,
    daysInCurrentRegime: row.days_in_current_regime,
    regimeChangesThisYear: row.regime_changes_this_year,
    avgRegimeDurationDays: row.avg_regime_duration_days,
    regimeHistory: row.regime_history,
    speedometerUrl: row.speedometer_url,
    currentTradeReturn: row.current_trade_return,
    currentTradeStart: row.current_trade_start,
  };
}
