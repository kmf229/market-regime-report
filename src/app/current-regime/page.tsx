import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getAllPublishedUpdates,
  getRegimeColor,
  getRegimeBgColor,
  getRegimeLabel,
} from "@/lib/regime-updates";
import { ScrollToTop } from "@/components/ScrollToTop";

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

  // Check profile for access
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_regime_access")
    .eq("id", user.id)
    .single();

  return {
    user,
    hasAccess: profile?.current_regime_access ?? true, // Default to true if no profile yet
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

  const updates = await getAllPublishedUpdates();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <ScrollToTop />
      {/* Header + Speedometer */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Current Regime
          </h1>
          <p className="text-lg text-gray-600">
            Daily updates on market conditions
          </p>
        </div>
        <div className="relative w-[420px] h-72 flex-shrink-0">
          <Image
            src="/images/regime_speedometer.png"
            alt="Current Market Regime"
            fill
            className="object-contain"
            priority
            unoptimized
          />
        </div>
      </div>

      {/* Updates */}
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
          Daily Updates
        </h2>

        {updates.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No updates yet. Check back soon.
          </p>
        ) : (
          <div className="space-y-6">
            {updates.map((update, index) => (
              <article
                key={update.date}
                className={`border-l-4 pl-6 py-4 ${
                  index === 0 ? "border-gray-900" : "border-gray-200"
                }`}
              >
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <time className="text-sm font-medium text-gray-900">
                    {update.formattedDate}
                    {update.time && (
                      <span className="text-gray-500 font-normal"> at {update.time}</span>
                    )}
                  </time>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded ${getRegimeBgColor(
                      update.regime
                    )} ${getRegimeColor(update.regime)}`}
                  >
                    {getRegimeLabel(update.regime)}
                  </span>
                </div>
                <div
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: update.htmlContent }}
                />
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <p className="text-xs text-gray-400 leading-relaxed">
          This information is for educational purposes only and should not be
          considered investment advice. Past performance does not guarantee
          future results. Always do your own research before making investment
          decisions.
        </p>
      </div>
    </div>
  );
}
