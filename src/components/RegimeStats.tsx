"use client";

import { useState, useEffect } from "react";
import { RegimeData } from "@/types/regime-data";

interface RegimeStatsProps {
  data: RegimeData;
}

const THRESHOLD = 0.25;
const BEARISH_MIN = -3.5;  // Raw value that maps to -10
const BULLISH_MAX = 3.5;   // Raw value that maps to +10

function scaleStrength(rawStrength: number): number {
  // Scale raw strength to -10 to +10 scale, with threshold (0.25) as zero
  let scaled: number;

  if (rawStrength >= THRESHOLD) {
    // Bullish side: 0.25 to 3.5 maps to 0 to 10
    const range = BULLISH_MAX - THRESHOLD; // 3.25
    const distance = rawStrength - THRESHOLD;
    scaled = (distance / range) * 10;
  } else {
    // Bearish side: 0.25 to -3.5 maps to 0 to -10
    const range = THRESHOLD - BEARISH_MIN; // 3.75
    const distance = THRESHOLD - rawStrength;
    scaled = -(distance / range) * 10;
  }

  // Cap at ±10
  return Math.max(-10, Math.min(10, scaled));
}

function getStrengthLabel(scaledStrength: number): string {
  const absValue = Math.abs(scaledStrength);
  const direction = scaledStrength >= 0 ? "Bullish" : "Bearish";

  if (absValue >= 6.66) return `Strong ${direction}`;
  if (absValue >= 3.33) return `Moderate ${direction}`;
  return `Weak ${direction}`;
}

export default function RegimeStats({ data }: RegimeStatsProps) {
  const [showStrengthInfo, setShowStrengthInfo] = useState(false);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [liveReturn, setLiveReturn] = useState<number | null>(null);

  const scaledStrength = scaleStrength(data.regimeStrength);
  const strengthLabel = getStrengthLabel(scaledStrength);

  // Fetch live price for current trade
  useEffect(() => {
    const ticker = data.currentRegime === "bullish" ? "TQQQ" : "GLD";

    const fetchPrice = async () => {
      try {
        const response = await fetch(`/api/stock-price?ticker=${ticker}`);
        if (response.ok) {
          const result = await response.json();
          setLivePrice(result.price);

          // Calculate live return if we have entry price
          if (data.currentTradeEntryPrice && result.price) {
            const returnPct = ((result.price - data.currentTradeEntryPrice) / data.currentTradeEntryPrice) * 100;
            setLiveReturn(returnPct);
          }
        }
      } catch (error) {
        console.error("Error fetching live price:", error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, [data.currentRegime, data.currentTradeEntryPrice]);

  // Format current trade value - use live return if available
  const formatTradeValue = () => {
    const pct = liveReturn ?? data.currentTradeReturn;
    if (pct === null) return "—";
    const sign = pct >= 0 ? "+" : "";
    const ticker = data.currentRegime === "bullish" ? "TQQQ" : "GLD";
    return `${sign}${pct.toFixed(1)}% ${ticker}`;
  };

  // Calculate days in regime dynamically from start date
  // Shows 0 on entry day, 1 after first full day, etc.
  const calculateDaysInRegime = () => {
    if (!data.currentTradeStart) return data.daysInCurrentRegime;
    const start = new Date(data.currentTradeStart + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const stats = [
    {
      label: "Days in Regime",
      value: calculateDaysInRegime(),
      subtext: `Current ${data.currentRegime} regime`,
    },
    {
      label: "Avg Duration",
      value: `${data.avgRegimeDurationDays}d`,
      subtext: "Per regime period",
    },
    {
      label: "Current Trade",
      value: formatTradeValue(),
      subtext: data.currentTradeStart
        ? `Since ${new Date(data.currentTradeStart + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
        : "",
      isTradeCard: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        // Special styling for Current Trade card - use live return if available
        const tradeReturn = liveReturn ?? data.currentTradeReturn;
        const isPositive = stat.isTradeCard && tradeReturn !== null && tradeReturn >= 0;
        const isNegative = stat.isTradeCard && tradeReturn !== null && tradeReturn < 0;

        return (
          <div
            key={stat.label}
            className="p-4 rounded-lg border bg-white border-gray-200"
          >
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {stat.label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${
              isPositive ? "text-emerald-600" : isNegative ? "text-red-600" : "text-gray-900"
            }`}>
              {stat.value}
            </p>
            <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
          </div>
        );
      })}

      {/* Regime Strength - Special Card (uses signal regime for real-time display) */}
      <div
        className={`p-4 rounded-lg border relative ${
          data.signalRegime === "bullish"
            ? "bg-emerald-50 border-emerald-200"
            : "bg-red-50 border-red-200"
        }`}
      >
        <div className="flex items-center gap-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Regime Strength
          </p>
          {/* Info icon */}
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onMouseEnter={() => setShowStrengthInfo(true)}
            onMouseLeave={() => setShowStrengthInfo(false)}
            onClick={() => setShowStrengthInfo(!showStrengthInfo)}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          {/* Info tooltip */}
          {showStrengthInfo && (
            <div className="absolute left-0 right-0 top-full mt-2 mx-4 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50">
              <p className="font-semibold mb-1">What is Regime Strength?</p>
              <p className="text-gray-300 leading-relaxed">
                Scale from -10 (strong bearish) to +10 (strong bullish).
                Zero is the threshold between regimes. Negative = hold GLD,
                Positive = hold TQQQ. The further from zero, the stronger
                the conviction.
              </p>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
            </div>
          )}
        </div>

        {/* Strength label (intuitive) - uses signal regime for real-time display */}
        <p
          className={`text-lg font-bold mt-1 ${
            data.signalRegime === "bullish"
              ? "text-emerald-700"
              : "text-red-700"
          }`}
        >
          {strengthLabel}
        </p>

        {/* Numeric value */}
        <p
          className={`text-2xl font-bold font-mono mt-1 ${
            data.signalRegime === "bullish"
              ? "text-emerald-600"
              : "text-red-600"
          }`}
        >
          {scaledStrength >= 0 ? "+" : ""}{scaledStrength.toFixed(1)}
        </p>
      </div>
    </div>
  );
}
