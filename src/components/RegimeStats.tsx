"use client";

import { useState } from "react";
import { RegimeData } from "@/types/regime-data";

interface RegimeStatsProps {
  data: RegimeData;
}

const THRESHOLD = 0.25;

function getStrengthLabel(strength: number): string {
  if (strength >= 1.5) return "Strong Bullish";
  if (strength >= 0.75) return "Moderate Bullish";
  if (strength >= THRESHOLD) return "Weak Bullish";
  if (strength >= 0) return "Weak Bearish";
  if (strength >= -0.5) return "Moderate Bearish";
  return "Strong Bearish";
}

function getDistanceToFlip(strength: number, currentRegime: string): string {
  if (currentRegime === "bullish") {
    const distance = strength - THRESHOLD;
    if (distance < 0.15) return "Near threshold";
    return `${distance.toFixed(2)} above threshold`;
  } else {
    const distance = THRESHOLD - strength;
    if (distance < 0.15) return "Near threshold";
    return `${distance.toFixed(2)} below threshold`;
  }
}

export default function RegimeStats({ data }: RegimeStatsProps) {
  const [showStrengthInfo, setShowStrengthInfo] = useState(false);

  const strengthLabel = getStrengthLabel(data.regimeStrength);
  const distanceText = getDistanceToFlip(data.regimeStrength, data.currentRegime);

  const stats = [
    {
      label: "Days in Regime",
      value: data.daysInCurrentRegime,
      subtext: `Current ${data.currentRegime} regime`,
    },
    {
      label: "Regime Changes (YTD)",
      value: data.regimeChangesThisYear,
      subtext: "Signals this year",
    },
    {
      label: "Avg Duration",
      value: `${data.avgRegimeDurationDays}d`,
      subtext: "Per regime period",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="p-4 rounded-lg border bg-white border-gray-200"
        >
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {stat.label}
          </p>
          <p className="text-2xl font-bold mt-1 text-gray-900">{stat.value}</p>
          <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
        </div>
      ))}

      {/* Regime Strength - Special Card */}
      <div
        className={`p-4 rounded-lg border relative ${
          data.currentRegime === "bullish"
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
                Measures the relative strength of risk-on vs risk-off sectors.
                Above {THRESHOLD} = Bullish (hold TQQQ). Below {THRESHOLD} =
                Bearish (hold GLD). The further from {THRESHOLD}, the stronger
                the conviction.
              </p>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
            </div>
          )}
        </div>

        {/* Strength label (intuitive) */}
        <p
          className={`text-lg font-bold mt-1 ${
            data.currentRegime === "bullish"
              ? "text-emerald-700"
              : "text-red-700"
          }`}
        >
          {strengthLabel}
        </p>

        {/* Numeric value and change */}
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`text-sm font-mono ${
              data.currentRegime === "bullish"
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            {data.regimeStrength.toFixed(2)}
          </span>
          <span
            className={`text-xs ${
              data.strengthChange >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            ({data.strengthChange >= 0 ? "+" : ""}
            {data.strengthChange.toFixed(2)})
          </span>
        </div>

        {/* Distance to threshold */}
        <p className="text-xs text-gray-500 mt-1">{distanceText}</p>

        {/* Mini progress bar showing position relative to threshold */}
        <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              data.currentRegime === "bullish"
                ? "bg-emerald-500"
                : "bg-red-500"
            }`}
            style={{
              width: `${Math.min(100, Math.max(0, ((data.regimeStrength + 2) / 4) * 100))}%`,
              marginLeft:
                data.regimeStrength < THRESHOLD
                  ? "0"
                  : `${((THRESHOLD + 2) / 4) * 100}%`,
            }}
          ></div>
        </div>
        <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
          <span>Bearish</span>
          <span>Threshold</span>
          <span>Bullish</span>
        </div>
      </div>
    </div>
  );
}
