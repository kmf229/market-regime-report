import { ScrollToTop } from "@/components/ScrollToTop";
import { getRegimeData } from "@/lib/regime-data";
import { getRegimeStrengthHistory } from "@/lib/regime-strength-history";
import { getBenchmarkPrices } from "@/lib/benchmark-prices";
import LiveRegimeStatus from "@/components/LiveRegimeStatus";
import CurrentTradeBenchmark from "@/components/CurrentTradeBenchmark";
import RegimeTimeline from "@/components/RegimeTimeline";

export const metadata = {
  title: "Current Regime | Market Regime Capital",
  description: "Daily market regime updates and current positioning.",
};

// Revalidate every 60 seconds to fetch fresh benchmark data
export const revalidate = 60;

export default async function CurrentRegimePage() {
  const regimeData = await getRegimeData();

  // Fetch historical data for new components
  const strengthHistory = await getRegimeStrengthHistory();

  // Fetch benchmark prices for current trade comparison
  const tradeStartDate = regimeData.currentTradeStart || regimeData.lastUpdated;
  const benchmarkPrices = await getBenchmarkPrices(tradeStartDate);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <ScrollToTop />

      {/* Main Content */}
      <main>
        {/* Overview Section - Live updating (speedometer + stats + chart) */}
        <LiveRegimeStatus
          initialData={regimeData}
          strengthHistory={strengthHistory}
        />

        {/* Benchmark Comparison (current trade vs SPY/QQQ/GLD) */}
        {regimeData.currentTradeReturn !== null && regimeData.currentTradeStart && (
          <section className="mb-8">
            <CurrentTradeBenchmark
              currentRegime={regimeData.currentRegime}
              tradeStartDate={regimeData.currentTradeStart}
              strategyReturn={regimeData.currentTradeReturn}
              tradeEntryPrice={regimeData.currentTradeEntryPrice}
              benchmarkPrices={benchmarkPrices}
            />
          </section>
        )}

        {/* Regime Timeline Strip */}
        <section className="mb-12">
          <RegimeTimeline
            history={regimeData.regimeHistory}
            currentRegime={regimeData.currentRegime}
            tradeEntryPrice={regimeData.currentTradeEntryPrice}
          />
        </section>

        {/* Disclaimer */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-400 leading-relaxed">
            This information is for educational purposes only and should not be
            considered investment advice. Past performance does not guarantee
            future results. Always do your own research before making investment
            decisions.
          </p>
        </div>
      </main>
    </div>
  );
}
