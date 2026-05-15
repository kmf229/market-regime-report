import { createClient } from "@/lib/supabase/server";
import { RegimeStrengthDataPoint } from "@/types/regime-data";

export async function getRegimeStrengthHistory(): Promise<RegimeStrengthDataPoint[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("regime_strength_history")
    .select("date, regime_strength, regime")
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching regime strength history:", error);
    return [];
  }

  if (!data) {
    return [];
  }

  return data.map(row => ({
    date: row.date,
    regimeStrength: row.regime_strength,
    regime: row.regime as "bullish" | "bearish",
  }));
}
