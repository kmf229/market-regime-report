"use client";

import { FUNDING_OPTIONS, FundingLevel, BASELINE_EQUITY } from "@/lib/funding-calculations";

interface FundingLevelSelectorProps {
  selectedLevel: FundingLevel;
  onLevelChange: (level: FundingLevel) => void;
}

export default function FundingLevelSelector({
  selectedLevel,
  onLevelChange,
}: FundingLevelSelectorProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
        Funding Level
      </h3>

      {/* Toggle buttons */}
      <div className="flex gap-2 mb-3">
        {FUNDING_OPTIONS.map((level) => {
          const isSelected = level === selectedLevel;
          const leverage = (100 / level).toFixed(1);

          return (
            <button
              key={level}
              onClick={() => onLevelChange(level)}
              className={`
                flex-1 px-4 py-3 rounded-lg font-semibold transition-all
                ${
                  isSelected
                    ? "bg-sky-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              <div className="text-lg">{level}%</div>
              <div className="text-xs mt-1 opacity-90">
                {leverage}x leverage
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation text */}
      <p className="text-sm text-gray-600 leading-relaxed">
        All performance shown from a {formatCurrency(BASELINE_EQUITY)} baseline.
        Funding level represents what percentage of the notional trading level
        is deposited. Lower funding increases leverage and amplifies both
        returns and risk.
      </p>
    </div>
  );
}
