import { getTrackRecordData } from "@/lib/track-record-data";
import HeroStats from "@/components/HeroStats";
import BenchmarkComparison from "@/components/BenchmarkComparison";
import MetricsPanel from "@/components/MetricsPanel";
import MonthlyReturnsTable from "@/components/MonthlyReturnsTable";
import EquityCurve from "@/components/EquityCurve";
import TradesTable from "@/components/TradesTable";
import { ScrollToTop } from "@/components/ScrollToTop";

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function TrackRecordPage() {
  const { summary, monthlyReturns, equityCurveUrl, trades, error } = await getTrackRecordData();

  if (error || !summary) {
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
              Track record is updated every Monday morning using time-weighted
              returns and reflects performance through the end of the prior week.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Performance period: {formatDate(summary.start_date)} —{" "}
              {formatDate(summary.data_through)} ({summary.strategy_length_days}{" "}
              days)
            </p>
          </div>

          {/* Hero Stats */}
          <HeroStats summary={summary} />
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Benchmark Comparison */}
        <section className="mb-12">
          <BenchmarkComparison summary={summary} />
        </section>

        {/* Monthly Returns */}
        {monthlyReturns && (
          <section className="mb-12">
            <MonthlyReturnsTable data={monthlyReturns} />
          </section>
        )}

        {/* Performance Metrics */}
        <section className="mb-12">
          <MetricsPanel summary={summary} />
        </section>

        {/* Equity Curve */}
        <section className="mb-12">
          <EquityCurve imageUrl={equityCurveUrl} />
        </section>

        {/* Trades Table */}
        {trades && trades.length > 0 && (
          <section className="mb-12">
            <TradesTable trades={trades} />
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

export const metadata = {
  title: "Track Record | The Market Regime Report",
  description:
    "Transparent, auditable track record with time-weighted returns and detailed performance metrics.",
};

// Revalidate every 60 seconds to pick up updates without redeploy
export const revalidate = 60;
