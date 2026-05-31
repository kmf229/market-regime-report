"use client";

import { useState, useEffect } from "react";
import { BenchmarkPrice } from "@/types/regime-data";

interface CurrentTradeBenchmarkProps {
  currentRegime: "bullish" | "bearish";
  tradeStartDate: string;
  strategyReturn: number;
  tradeEntryPrice: number | null;
  benchmarkPrices: Record<string, BenchmarkPrice[]>;
}

function calculateReturn(prices: BenchmarkPrice[]): number | null {
  if (prices.length < 2) return null;
  const startPrice = prices[0].close;
  const endPrice = prices[prices.length - 1].close;
  return ((endPrice - startPrice) / startPrice) * 100;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CurrentTradeBenchmark({
  currentRegime,
  tradeStartDate,
  strategyReturn,
  tradeEntryPrice,
  benchmarkPrices,
}: CurrentTradeBenchmarkProps) {
  const currentTicker = currentRegime === "bullish" ? "NQ=F" : "GC=F";
  const [liveStrategyReturn, setLiveStrategyReturn] = useState<number | null>(null);

  // Fetch live price for strategy position
  useEffect(() => {
    if (!tradeEntryPrice) {
      setLiveStrategyReturn(null);
      return;
    }

    const fetchPrice = async () => {
      try {
        const response = await fetch(`/api/stock-price?ticker=${currentTicker}`);
        if (response.ok) {
          const result = await response.json();
          if (result.price) {
            const returnPct = ((result.price - tradeEntryPrice) / tradeEntryPrice) * 100;
            setLiveStrategyReturn(returnPct);
          }
        }
      } catch (error) {
        console.error("Error fetching live price:", error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, [currentTicker, tradeEntryPrice]);

  // Use live return if available, otherwise fall back to stored return
  const displayStrategyReturn = liveStrategyReturn ?? strategyReturn;

  // Calculate returns for each benchmark
  const benchmarks = [
    {
      name: "Strategy",
      ticker: currentRegime === "bullish" ? "NQ" : "GC",
      return: displayStrategyReturn,
      isStrategy: true,
    },
    {
      name: "SPY",
      ticker: "SPY",
      return: calculateReturn(benchmarkPrices["SPY"] || []),
      isStrategy: false,
    },
    {
      name: "QQQ",
      ticker: "QQQ",
      return: calculateReturn(benchmarkPrices["QQQ"] || []),
      isStrategy: false,
    },
    {
      name: "GLD",
      ticker: "GLD",
      return: calculateReturn(benchmarkPrices["GLD"] || []),
      isStrategy: false,
    },
  ];

  // Filter out benchmarks with no data
  const validBenchmarks = benchmarks.filter((b) => b.return !== null);

  if (validBenchmarks.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Benchmark Comparison
        </h3>
        <p className="text-sm text-gray-500 mt-2">
          No benchmark data available yet. Historical price data will be collected daily.
        </p>
      </div>
    );
  }

  // Find max return for scaling
  const maxReturn = Math.max(...validBenchmarks.map((b) => Math.abs(b.return!)));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Benchmark Comparison
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Returns since {formatDate(tradeStartDate)} (current trade start)
          </p>
        </div>
      </div>

      {/* Bars */}
      <div className="space-y-4">
        {validBenchmarks.map((benchmark) => {
          const returnVal = benchmark.return!;
          const isPositive = returnVal >= 0;
          const widthPct = maxReturn > 0 ? (Math.abs(returnVal) / maxReturn) * 100 : 0;

          return (
            <div key={benchmark.ticker} className="relative">
              {/* Label row */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-semibold ${
                      benchmark.isStrategy ? "text-gray-900" : "text-gray-700"
                    }`}
                  >
                    {benchmark.name}
                  </span>
                  {benchmark.isStrategy && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                      CURRENT POSITION
                    </span>
                  )}
                </div>
                <span
                  className={`text-sm font-mono font-semibold ${
                    isPositive ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {returnVal.toFixed(1)}%
                </span>
              </div>

              {/* Bar */}
              <div className="flex items-center gap-2">
                {/* Negative space (for negative returns) */}
                {!isPositive && (
                  <div className="flex-1 flex justify-end">
                    <div
                      className={`h-10 rounded-lg transition-all ${
                        benchmark.isStrategy
                          ? "bg-red-500"
                          : "bg-red-300"
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                )}

                {/* Center line */}
                <div className="w-px h-10 bg-gray-300"></div>

                {/* Positive space (for positive returns) */}
                {isPositive && (
                  <div className="flex-1">
                    <div
                      className={`h-10 rounded-lg transition-all ${
                        benchmark.isStrategy
                          ? "bg-emerald-500"
                          : "bg-emerald-300"
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 leading-relaxed">
          The strategy is currently positioned in <strong>{currentRegime === "bullish" ? "NQ" : "GC"} futures</strong>.
          Returns are calculated from the trade entry date ({formatDate(tradeStartDate)})
          to the most recent market close. The strategy bar is highlighted to emphasize
          current performance vs. passive alternatives.
        </p>
      </div>
    </div>
  );
}
