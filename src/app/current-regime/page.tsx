import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDailyUpdates } from "@/lib/daily-updates";
import DailyUpdates from "@/components/DailyUpdates";
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
    .select("current_regime_access")
    .eq("id", user.id)
    .single();

  return {
    user,
    hasAccess: profile?.current_regime_access ?? true,
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
  const { hasAccess } = await checkAccess();

  if (!hasAccess) {
    return <AccessDenied />;
  }

  const updates = await getDailyUpdates();
  const regimeData = await getRegimeData();

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <ScrollToTop />

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-48 flex-shrink-0">
          <RegimeSidebar regime={regimeData.currentRegime} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Overview Section - Live updating */}
          <LiveRegimeStatus initialData={regimeData} />

          {/* Daily Updates Section */}
          <section id="updates" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-3 mb-6">
              Daily Updates
            </h2>

            <DailyUpdates updates={updates} initialCount={5} />
          </section>

          {/* History Section */}
          <section id="history" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-3 mb-6">
              Regime History
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Period
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Regime
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">
                      Duration
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">
                      Return
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {regimeData.regimeHistory.map((period, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-gray-100 ${
                        idx === 0 ? "bg-gray-50" : ""
                      }`}
                    >
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(period.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        -{" "}
                        {period.endDate
                          ? new Date(period.endDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "Present"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded ${
                            period.regime === "bullish"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {period.regime === "bullish" ? "Bullish" : "Bearish"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {period.durationDays} days
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${
                          period.returnPct === undefined
                            ? "text-gray-400"
                            : period.returnPct >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {period.returnPct !== undefined
                          ? `${period.returnPct >= 0 ? "+" : ""}${period.returnPct.toFixed(1)}%`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
