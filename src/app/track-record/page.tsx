"use client";

import { useEffect, useState } from "react";
import { getTrackRecordData } from "@/lib/track-record-data";
import { Summary, MonthlyReturns, Trade } from "@/types/track-record";
import HeroStats from "@/components/HeroStats";
import BenchmarkComparison from "@/components/BenchmarkComparison";
import MetricsPanel from "@/components/MetricsPanel";
import MonthlyReturnsTable from "@/components/MonthlyReturnsTable";
import EquityCurve from "@/components/EquityCurve";
import TradesTable from "@/components/TradesTable";
import FundingLevelSelector from "@/components/FundingLevelSelector";
import { ScrollToTop } from "@/components/ScrollToTop";
import {
  FundingLevel,
  DEFAULT_FUNDING_PCT,
  adjustSummary,
  adjustMonthlyReturns,
  adjustTrades,
} from "@/lib/funding-calculations";

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function TrackRecordPage() {
  const [originalData, setOriginalData] = useState<{
    summary: Summary | null;
    monthlyReturns: MonthlyReturns | null;
    equityCurveUrl: string | null;
    trades: Trade[];
    error: string | null;
  } | null>(null);
  const [fundingLevel, setFundingLevel] = useState<FundingLevel>(DEFAULT_FUNDING_PCT as FundingLevel);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      const data = await getTrackRecordData();
      setOriginalData(data);
    }
    fetchData();
  }, []);

  // Loading state
  if (!originalData) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <p className="text-gray-600">Loading track record data...</p>
        </div>
      </div>
    );
  }

  const { summary: originalSummary, monthlyReturns: originalMonthlyReturns, equityCurveUrl, trades: originalTrades, error } = originalData;

  if (error || !originalSummary || !originalMonthlyReturns) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-lg font-semibold text-red-800">
            Data Unavailable
          </h1>
          <p className="mt-2 text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate adjusted data based on selected funding level
  const adjustedSummary = adjustSummary(originalSummary, originalMonthlyReturns, fundingLevel);
  const adjustedMonthlyReturns = adjustMonthlyReturns(originalMonthlyReturns, fundingLevel);
  const adjustedTrades = adjustTrades(originalTrades, fundingLevel);

  return (
    <div>
      <ScrollToTop />
      {/* Hero Section */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Track Record
            </h1>
            <p className="mt-2 text-gray-600">
              Track record is updated daily (weekdays) at 8am ET using time-weighted
              returns and reflects performance through the most recent trading day.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Performance period: {formatDate(originalSummary.start_date)} —{" "}
              {formatDate(originalSummary.data_through)} ({originalSummary.strategy_length_days}{" "}
              days)
            </p>
          </div>

          {/* Hero Stats */}
          <HeroStats summary={adjustedSummary} />
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Benchmark Comparison */}
        <section className="mb-12">
          <BenchmarkComparison summary={adjustedSummary} />
        </section>

        {/* Monthly Returns */}
        <section className="mb-12">
          <MonthlyReturnsTable data={adjustedMonthlyReturns} />
        </section>

        {/* Performance Metrics */}
        <section className="mb-12">
          <MetricsPanel summary={adjustedSummary} />
        </section>

        {/* Funding Level Selector */}
        <section className="mb-12">
          <FundingLevelSelector
            selectedLevel={fundingLevel}
            onLevelChange={setFundingLevel}
          />
        </section>

        {/* Equity Curve */}
        <section className="mb-12">
          <EquityCurve
            imageUrl={equityCurveUrl}
            monthlyReturns={originalMonthlyReturns}
            fundingLevel={fundingLevel}
          />
        </section>

        {/* Trades Table */}
        {adjustedTrades && adjustedTrades.length > 0 && (
          <section className="mb-12">
            <TradesTable trades={adjustedTrades} fundingLevel={fundingLevel} />
          </section>
        )}

        {/* Disclaimer */}
        <section className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Disclaimer
          </h3>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            Past performance is not indicative of future results. All returns
            shown are time-weighted and net of any applicable fees. This
            information is provided for informational purposes only and does not
            constitute investment advice or a recommendation to buy or sell any
            securities. The author is not a registered investment advisor,
            broker, or financial planner.
          </p>
        </section>
      </div>
    </div>
  );
}

