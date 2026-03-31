import Link from "next/link";
import { redirect } from "next/navigation";
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

async function checkAccess() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/current-regime");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_regime_access, regime_change_alerts, weekly_digest")
    .eq("id", user.id)
    .single();

  return {
    user,
    hasAccess: profile?.current_regime_access ?? true,
    alertPreferences: {
      regime_change_alerts: profile?.regime_change_alerts ?? false,
      weekly_digest: profile?.weekly_digest ?? false,
    },
  };
}

function AccessDenied() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Access Not Enabled
        </h1>
        <p className="text-gray-600 mb-8">
          Your account doesn&apos;t have access to the Current Regime page yet.
          This feature is available to paid subscribers.
        </p>
        <div className="space-y-3">
          <a
            href="https://newsletter.marketregimes.com/subscribe"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Subscribe to Get Access
          </a>
          <Link
            href="/"
            className="block w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function CurrentRegimePage() {
  const { user, hasAccess, alertPreferences } = await checkAccess();

  if (!hasAccess) {
    return <AccessDenied />;
  }

  // Daily updates disabled - kept for future use
  // const updates = await getDailyUpdates();
  const regimeData = await getRegimeData();

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <ScrollToTop />

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-48 flex-shrink-0">
          <RegimeSidebar
            regime={regimeData.currentRegime}
            userId={user.id}
            alertPreferences={alertPreferences}
          />
        </aside>

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
