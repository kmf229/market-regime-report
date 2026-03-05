export interface RegimeData {
  // Current state
  currentRegime: "bullish" | "bearish";
  regimeStrength: number;
  strengthChange: number; // vs yesterday
  lastUpdated: string; // ISO date

  // Stats
  daysInCurrentRegime: number;
  regimeChangesThisYear: number;
  avgRegimeDurationDays: number;

  // Current trade
  currentTradeReturn: number | null; // return since entering current regime
  currentTradeStart: string | null; // date we entered current regime

  // Timeline (last 12 months of regime periods)
  regimeHistory: RegimePeriod[];

  // Speedometer
  speedometerUrl: string | null;
}

export interface RegimePeriod {
  regime: "bullish" | "bearish";
  startDate: string;
  endDate: string | null; // null if current
  durationDays: number;
  returnPct?: number; // optional: return during this period
}
