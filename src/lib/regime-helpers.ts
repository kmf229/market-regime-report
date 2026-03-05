// Helper functions for regime display (can be used in both client and server components)

export function getRegimeColor(regime: string): string {
  return regime === "bullish" ? "text-emerald-600" : "text-red-600";
}

export function getRegimeBgColor(regime: string): string {
  return regime === "bullish" ? "bg-emerald-50" : "bg-red-50";
}

export function getRegimeLabel(regime: string): string {
  return regime === "bullish" ? "Bullish" : "Bearish";
}
