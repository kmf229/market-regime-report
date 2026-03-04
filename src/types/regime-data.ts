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

  // Timeline (last 12 months of regime periods)
  regimeHistory: RegimePeriod[];
}

export interface RegimePeriod {
  regime: "bullish" | "bearish";
  startDate: string;
  endDate: string | null; // null if current
  durationDays: number;
  returnPct?: number; // optional: return during this period
}
