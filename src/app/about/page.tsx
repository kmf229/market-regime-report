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
            A systematic futures trading strategy built on institutional discipline,
            designed to remove emotion from the equation and respond to market
            leadership—not predictions.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider mb-3">
              The Problem
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              Behavioral Mistakes Destroy Returns
            </h2>
            <div className="mt-6 space-y-4 text-gray-600 leading-relaxed">
              <p>
                The biggest threat to trading performance isn't market volatility—it's
                behavioral interference. Studies consistently show that individual traders
                underperform because of poor timing decisions driven by emotion.
              </p>
              <p>
                Investors overtrade. They exit winning positions too early and hold
                losing positions too long. They panic at market bottoms and chase at
                tops. These behavioral patterns are universal, predictable, and
                detrimental to long-term returns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              The Solution
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              Rules Replace Emotion
            </h2>
            <div className="mt-6 space-y-4 text-gray-600 leading-relaxed">
              <p>
                Market Regime Capital is built on a simple premise: if the
                problem is behavioral, the solution must be systematic. No
                predictions. No gut feelings. No discretionary overrides. Just
                rules.
              </p>
              <p>
                The regime model identifies whether the market environment favors
                risk-taking or risk-avoidance based on actual market leadership
                patterns—not forecasts, not opinions, not speculation. When the data
                signals risk-on conditions, the strategy positions for growth. When
                it signals risk-off, capital moves to defensive assets.
              </p>
              <p>
                This approach prioritizes consistency over prediction.
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
                Kevin Fitzpatrick founded Market Regime Capital after two decades
                of experience in the markets, including extensive work in data
                science and systematic strategy development.
              </p>
              <p>
                His approach emerged from recognizing that behavioral discipline—not
                analytical complexity—is the primary differentiator in trading
                performance. After years of testing and refinement, he developed
                the regime-based framework that forms the foundation of Market
                Regime Capital's investment strategy.
              </p>
              <p>
                Kevin trades the strategy with personal capital and maintains full
                transparency through real-time documentation of all positions,
                regime shifts, and performance metrics. The track record reflects
                actual executed trades, not hypothetical results.
              </p>
              <p>
                Market Regime Capital's mission is to provide qualified investors
                with access to systematic, rules-based futures management—removing
                emotional interference and providing institutional-quality process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Firm Timeline */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider mb-3">
              Timeline
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Development & Track Record
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4 border-l-2 border-emerald-500 pl-4">
                <div className="flex-shrink-0 w-24 text-sm font-medium text-emerald-700">
                  2024-2025
                </div>
                <div className="text-gray-600">
                  <strong className="text-gray-900">Strategy Research & Development</strong>
                  <p className="mt-1">Systematic framework design, backtesting, and refinement</p>
                </div>
              </div>
              <div className="flex gap-4 border-l-2 border-emerald-500 pl-4">
                <div className="flex-shrink-0 w-24 text-sm font-medium text-emerald-700">
                  Nov 2025
                </div>
                <div className="text-gray-600">
                  <strong className="text-gray-900">Live Trading Commenced</strong>
                  <p className="mt-1">Strategy deployed with personal capital, full performance documentation begins</p>
                </div>
              </div>
              <div className="flex gap-4 border-l-2 border-emerald-500 pl-4">
                <div className="flex-shrink-0 w-24 text-sm font-medium text-emerald-700">
                  2026+
                </div>
                <div className="text-gray-600">
                  <strong className="text-gray-900">Track Record Development</strong>
                  <p className="mt-1">Ongoing live trading to establish institutional-quality performance history</p>
                </div>
              </div>
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
