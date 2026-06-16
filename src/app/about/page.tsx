import Link from "next/link";
import Disclaimer from "@/components/Disclaimer";

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative border-b border-gray-200">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero.jpg')" }}
        >
          <div className="absolute inset-0 bg-white/70"></div>
        </div>
        <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-20">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            About Market Regime Capital
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl">
            Pre-registration CTA building an institutional-quality track record through
            systematic futures management. Full transparency, real capital, documented
            performance—preparing for CFTC/NFA registration in 2026-2027.
          </p>
        </div>
      </section>

      {/* The Firm */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider mb-3">
              The Firm
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              Building Track Record for CTA Registration
            </h2>
            <div className="mt-6 space-y-4 text-gray-600 leading-relaxed">
              <p>
                Market Regime Capital is a pre-registration systematic futures manager currently
                building an auditable track record in preparation for CFTC/NFA registration as a
                Commodity Trading Advisor. All trades are executed in a live account with real capital,
                documented in real-time, and available for institutional due diligence.
              </p>
              <p>
                The strategy trades with full transparency—every regime shift, every position change,
                and every win and loss is documented. Track record includes time-weighted returns,
                monthly performance, and benchmark comparisons updated daily. Performance data is
                available upon request for qualified investors. Target registration timeline: 2027-2028.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            The Framework
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mb-10">
            How the Regime Model Works
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Risk-On Positioning
                </h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                When market leadership favors growth, momentum, and risk-taking,
                the strategy allocates to equity index futures.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                The goal is to capture upside during favorable conditions while
                the regime supports it.
              </p>
            </div>
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Risk-Off Positioning
                </h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                When conditions shift defensive, the strategy rotates to alternative
                assets that serve as stores of value.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Capital preservation becomes the priority until market conditions
                improve.
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Key Characteristics
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-gray-400 mt-1">—</span>
                <span className="text-gray-600">
                  <strong className="text-gray-900">Infrequent signals:</strong>{" "}
                  Regime shifts occur only a handful of times per year, reflecting
                  significant structural changes in market leadership
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-400 mt-1">—</span>
                <span className="text-gray-600">
                  <strong className="text-gray-900">Responsive framework:</strong>{" "}
                  The model responds to what the market is doing, not what we
                  predict it will do
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-400 mt-1">—</span>
                <span className="text-gray-600">
                  <strong className="text-gray-900">Full transparency:</strong>{" "}
                  Every trade, every regime shift, every win and loss is
                  documented with complete auditability
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* About Kevin */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider mb-3">
              Leadership
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              Kevin Fitzpatrick, Founder and Portfolio Manager
            </h2>
            <div className="mt-6 space-y-4 text-gray-600 leading-relaxed">
              <p>
                Kevin Fitzpatrick founded Market Regime Capital after 20 years of trading experience
                and quantitative research. His background spans data science, systematic strategy
                development, and direct market exposure across multiple asset classes.
              </p>
              <p>
                The regime framework emerged from multi-year research into institutional capital flows
                and market leadership patterns. Development included extensive backtesting across 2,000+
                parameter variations, out-of-sample validation, and live forward testing with personal
                capital beginning in 2025. The strategy demonstrated consistent profitability across
                parameter sets, confirming the edge is structural rather than curve-fitted.
              </p>
              <p>
                Kevin trades the strategy exclusively with personal capital. Every position, regime shift,
                and performance metric is documented in real-time, with detailed performance data available
                upon request for qualified investors. The track record reflects actual executed trades at
                stated prices, including all commissions and slippage, not hypothetical or simulated results.
              </p>
              <p>
                Market Regime Capital's mission is to scale this framework for qualified institutional
                investors through a transparent, rules-based process with complete alignment of interests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Future Investment Program */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Future Availability
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Investment Program
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Market Regime Capital is building a track record in preparation for registration
              as a Commodity Trading Advisor (CTA). The program will be available to accredited
              investors with a performance-based fee structure. Investors interested in learning
              about future availability are welcome to reach out.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Review Our Approach & Track Record
            </h2>
            <p className="mt-4 text-gray-400">
              Explore our systematic methodology and live trading performance.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/approach"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                View Approach
              </Link>
              <Link
                href="/track-record"
                className="inline-flex items-center justify-center px-6 py-3.5 border border-gray-600 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                View Track Record
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <Disclaimer variant="standard" />
        </div>
      </section>
    </div>
  );
}

export const metadata = {
  title: "About",
  description:
    "Learn about Market Regime Capital's systematic futures trading approach, leadership, and institutional-quality investment process.",
};
