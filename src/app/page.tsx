import Link from "next/link";

export default function HomePage() {
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
        <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-4">
              Systematic Investment Strategy
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Rules-Based Investing.
              <br />
              Zero Emotion.
            </h1>
            <p className="mt-6 text-xl text-gray-700 leading-relaxed">
              A regime model that rotates between risk-on and risk-off assets
              based on market leadership—not predictions, not gut feelings,
              just systematic execution.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/track-record"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                View Track Record
              </Link>
              <Link
                href="/current-regime"
                className="inline-flex items-center justify-center px-6 py-3.5 border border-gray-300 bg-white/80 text-gray-700 font-medium rounded-lg hover:bg-white transition-colors"
              >
                See Current Regime
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-900">The Philosophy</h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Most investors lose money not because of bad analysis, but because
              of bad behavior—overtrading, selling winners early, holding losers
              too long. The Market Regime Report eliminates these mistakes with
              a systematic framework that removes emotion from the equation.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              The regime model identifies whether the market favors risk-on or
              risk-off positioning, then allocates accordingly. Signals are
              infrequent—just a handful of regime shifts per year—making this
              approach suitable for investors with full-time careers who want
              institutional-quality process without constant screen time.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-10">
            How the Regime Model Works
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Bullish Regime
                </h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                When market leadership favors growth and momentum, the model
                positions in leveraged technology exposure (TQQQ/MNQ) to capture
                upside during favorable conditions.
              </p>
            </div>
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Bearish Regime
                </h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                When conditions shift defensive, the model rotates to gold
                (GLD/MGC) as a store of value, prioritizing capital preservation
                over aggressive growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">01</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Systematic Process
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Every decision follows a repeatable, rules-based framework.
                No discretionary overrides, no second-guessing, no emotional
                interference.
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">02</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Total Transparency
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Real-time documentation of every trade, every regime shift,
                every win and loss. The track record is fully auditable with
                time-weighted returns.
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">03</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Simplicity Over Complexity
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Simple systems survive when complex ones fail. The regime model
                is designed to be robust across market conditions, not optimized
                for backtests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Track Record CTA */}
      <section className="bg-gray-900">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                See the numbers for yourself
              </h2>
              <p className="mt-2 text-gray-400">
                Full performance history with monthly breakdowns and risk metrics.
              </p>
            </div>
            <Link
              href="/track-record"
              className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              View Track Record
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Follow the Regime in Real Time
            </h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              The Market Regime Report delivers daily dashboards, regime signals,
              and educational content on systematic investing. Join investors who
              want clarity, structure, and a rules-based approach to markets.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://newsletter.marketregimes.com/subscribe"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Subscribe on Substack
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Free posts available. Paid subscription: $7/month or $70/year.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong>Disclaimer:</strong> The Market Regime Report is for
            informational and educational purposes only. The content provided
            does not constitute investment advice, financial advice, or a
            recommendation to buy or sell any securities. Past performance is
            not indicative of future results. The author is not a registered
            investment advisor, broker, or financial planner. Always conduct
            your own research and consult with a qualified financial professional
            before making investment decisions.
          </p>
        </div>
      </section>
    </div>
  );
}
