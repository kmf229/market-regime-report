import { createClient } from "@/lib/supabase/server";
// Daily updates disabled - kept for future use
// import { getDailyUpdates } from "@/lib/daily-updates";
// import DailyUpdates from "@/components/DailyUpdates";
import { ScrollToTop } from "@/components/ScrollToTop";
import RegimeSidebar from "@/components/RegimeSidebar";
import { getRegimeData } from "@/lib/regime-data";
import LiveRegimeStatus from "@/components/LiveRegimeStatus";

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

  // Daily updates disabled - kept for future use
  // const updates = await getDailyUpdates();
  const regimeData = await getRegimeData();

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
          {/* Overview Section - Live updating */}
          <LiveRegimeStatus initialData={regimeData} />

          {/* Daily Updates Section - DISABLED (kept for potential future use)
          <section id="updates" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-3 mb-6">
              Daily Updates
            </h2>

            <DailyUpdates updates={updates} initialCount={5} />
          </section>
          */}

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
