import { createClient } from "@supabase/supabase-js";
import { Summary, MonthlyReturns, Trade } from "@/types/track-record";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a server-side client (no cookies needed for public data)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface TrackRecordData {
  summary: Summary | null;
  monthlyReturns: MonthlyReturns | null;
  equityCurveUrl: string | null;
  trades: Trade[];
  error: string | null;
}

export async function getTrackRecordData(): Promise<TrackRecordData> {
  try {
    const { data, error } = await supabase
      .from("track_record")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return {
        summary: null,
        monthlyReturns: null,
        equityCurveUrl: null,
        trades: [],
        error: "Failed to fetch track record data from database.",
      };
    }

    if (!data) {
      return {
        summary: null,
        monthlyReturns: null,
        equityCurveUrl: null,
        trades: [],
        error: "Track record data not found in database.",
      };
    }

    // Map database fields to Summary interface
    const summary: Summary = {
      start_date: data.start_date,
      data_through: data.data_through,
      strategy_length_days: data.strategy_length_days,
      strategy_length_years: data.strategy_length_years,
      cumulative_return: data.cumulative_return,
      cagr: data.cagr,
      max_drawdown: data.max_drawdown,
      sharpe_ratio: data.sharpe_ratio,
      avg_monthly_return: data.avg_monthly_return,
      best_month_return: data.best_month_return,
      best_month_label: data.best_month_label,
      worst_month_return: data.worst_month_return,
      worst_month_label: data.worst_month_label,
      up_months_pct: data.up_months_pct,
      // S&P 500 benchmark metrics
      sp500_cumulative_return: data.sp500_cumulative_return ?? null,
      sp500_cagr: data.sp500_cagr ?? null,
      sp500_max_drawdown: data.sp500_max_drawdown ?? null,
      alpha_vs_sp500: data.alpha_vs_sp500 ?? null,
    };

    const monthlyReturns: MonthlyReturns | null = data.monthly_returns || null;
    const equityCurveUrl: string | null = data.equity_curve_url || null;
    const trades: Trade[] = data.trades_history || [];

    return {
      summary,
      monthlyReturns,
      equityCurveUrl,
      trades,
      error: null,
    };
  } catch (err) {
    console.error("Error fetching track record:", err);
    return {
      summary: null,
      monthlyReturns: null,
      equityCurveUrl: null,
      trades: [],
      error: "An error occurred while fetching track record data.",
    };
  }
}
