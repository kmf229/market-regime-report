import { createClient } from "@/lib/supabase/server";
import { ScrollToTop } from "@/components/ScrollToTop";
import RegimeSidebar from "@/components/RegimeSidebar";
import { getRegimeData } from "@/lib/regime-data";
import { getRegimeStrengthHistory } from "@/lib/regime-strength-history";
import { getBenchmarkPrices } from "@/lib/benchmark-prices";
import LiveRegimeStatus from "@/components/LiveRegimeStatus";
import RegimeStrengthChart from "@/components/RegimeStrengthChart";
import CurrentTradeBenchmark from "@/components/CurrentTradeBenchmark";
import RegimeTimeline from "@/components/RegimeTimeline";

export const metadata = {
  title: "Current Regime | The Market Regime Report",
  description: "Daily market regime updates and current positioning.",
};

async function getUserData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("regime_change_alerts, weekly_digest")
    .eq("id", user.id)
    .single();

  return {
    user,
    alertPreferences: {
      regime_change_alerts: profile?.regime_change_alerts ?? false,
      weekly_digest: profile?.weekly_digest ?? false,
    },
  };
}

export default async function CurrentRegimePage() {
  const userData = await getUserData();
  const regimeData = await getRegimeData();

  // Fetch historical data for new components
  const strengthHistory = await getRegimeStrengthHistory();

  // Fetch benchmark prices for current trade comparison
  const tradeStartDate = regimeData.currentTradeStart || regimeData.lastUpdated;
  const benchmarkPrices = await getBenchmarkPrices(tradeStartDate);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <ScrollToTop />

      <div className="flex gap-8">
        {/* Sidebar - only show for logged-in users */}
        {userData && (
          <aside className="hidden lg:block w-48 flex-shrink-0">
            <RegimeSidebar
              regime={regimeData.currentRegime}
              userId={userData.user.id}
              alertPreferences={userData.alertPreferences}
            />
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Overview Section - Live updating (speedometer + stats) */}
          <LiveRegimeStatus initialData={regimeData} />

          {/* Regime Strength History Chart */}
          <section className="mb-8">
            <RegimeStrengthChart
              data={strengthHistory}
              currentStrength={regimeData.regimeStrength}
            />
          </section>

          {/* Benchmark Comparison (current trade vs SPY/QQQ/GLD) */}
          {regimeData.currentTradeReturn !== null && regimeData.currentTradeStart && (
            <section className="mb-8">
              <CurrentTradeBenchmark
                currentRegime={regimeData.currentRegime}
                tradeStartDate={regimeData.currentTradeStart}
                strategyReturn={regimeData.currentTradeReturn}
                benchmarkPrices={benchmarkPrices}
              />
            </section>
          )}

          {/* Regime Timeline Strip */}
          <section className="mb-12">
            <RegimeTimeline history={regimeData.regimeHistory} />
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
    </div>
  );
}
