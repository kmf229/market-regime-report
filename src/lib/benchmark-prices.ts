import { createClient } from "@/lib/supabase/server";
import { BenchmarkPrice } from "@/types/regime-data";

export async function getBenchmarkPrices(
  startDate: string,
  endDate?: string
): Promise<Record<string, BenchmarkPrice[]>> {
  const supabase = await createClient();

  const query = supabase
    .from("benchmark_prices")
    .select("*")
    .gte("date", startDate)
    .order("date", { ascending: true });

  if (endDate) {
    query.lte("date", endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching benchmark prices:", error);
    return {};
  }

  if (!data) {
    return {};
  }

  // Group by ticker
  const grouped: Record<string, BenchmarkPrice[]> = {};

  data.forEach(row => {
    if (!grouped[row.ticker]) {
      grouped[row.ticker] = [];
    }
    grouped[row.ticker].push({
      ticker: row.ticker,
      date: row.date,
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
      volume: row.volume,
    });
  });

  return grouped;
}
