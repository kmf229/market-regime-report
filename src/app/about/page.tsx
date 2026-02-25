import Link from "next/link";

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            About The Market Regime Report
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl">
            A systematic approach to investing that removes emotion from the
            equation and responds to what the market is actually doing—not what
            we think it should do.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              The Problem
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              Most Investors Beat Themselves
            </h2>
            <div className="mt-6 space-y-4 text-gray-600 leading-relaxed">
              <p>
                The biggest threat to your portfolio isn't the market—it's your
                own behavior. Studies consistently show that individual investors
                underperform the very funds they invest in because of poor timing
                decisions driven by emotion.
              </p>
              <p>
                We overtrade. We sell winners too early and hold losers too long.
                We panic at bottoms and chase at tops. We check our phones
                constantly, reacting to every headline, every red day, every
                talking head on TV.
              </p>
              <p>
                I know because I did all of this. For years, I thought my problem
                was not having the right analysis, the right indicators, the
                right information. But the problem was never the analysis—it was
                me.
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
                The Market Regime Report is built on a simple premise: if the
                problem is behavioral, the solution must be systematic. No
                predictions. No gut feelings. No discretionary overrides. Just
                rules.
              </p>
              <p>
                The regime model identifies whether the market environment favors
                risk-taking or risk-avoidance based on actual market leadership
                patterns—not forecasts, not opinions, not what the Fed might do.
                When the data says risk-on, we position for growth. When it says
                risk-off, we move defensive.
              </p>
              <p>
                This isn't about being right. It's about being consistent.
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
                  Risk-On Regime
                </h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                When market leadership favors growth, momentum, and risk-taking,
                the model allocates to leveraged technology exposure through
                instruments like TQQQ or Micro Nasdaq futures (MNQ).
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                The goal is to capture upside during favorable conditions while
                the regime supports it.
              </p>
            </div>
            <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Risk-Off Regime
                </h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                When conditions shift defensive, the model rotates to gold
                through GLD or Micro Gold futures (MGC) as a store of value.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Capital preservation becomes the priority until conditions
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
                  Regime shifts happen only a handful of times per year, not
                  daily or weekly
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-400 mt-1">—</span>
                <span className="text-gray-600">
                  <strong className="text-gray-900">No prediction required:</strong>{" "}
                  The model responds to what the market is doing, not what we
                  think it will do
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-400 mt-1">—</span>
                <span className="text-gray-600">
                  <strong className="text-gray-900">Compatible with a full-time job:</strong>{" "}
                  No need to watch screens all day—the system does the watching
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-400 mt-1">—</span>
                <span className="text-gray-600">
                  <strong className="text-gray-900">Fully transparent:</strong>{" "}
                  Every trade, every regime shift, every win and loss is
                  documented in real time
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
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              About
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              Hi, I'm Kevin
            </h2>
            <div className="mt-6 space-y-4 text-gray-600 leading-relaxed">
              <p>
                I spent years doing everything wrong in the markets. I chased
                hot tips, panic-sold during corrections, held losers hoping
                they'd come back, and sold winners way too early. I was
                constantly stressed, constantly checking my phone, and
                consistently underperforming.
              </p>
              <p>
                The turning point came when I realized my analysis wasn't the
                problem—my behavior was. I needed a system that would make
                decisions for me, removing the emotional interference that was
                costing me money.
              </p>
              <p>
                The Market Regime Report is the result of that journey. I
                developed a rules-based framework, tested it, refined it, and
                now I trade it with my own money. Everything I share here is
                what I'm actually doing—not hypothetical, not backtested-only,
                but real positions with real capital.
              </p>
              <p>
                My mission is simple: bring clarity, structure, and calm to
                people who want a better way to invest. No hype, no predictions,
                no guru nonsense—just a systematic approach documented in full
                transparency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Subscribers Get */}
      <section className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            What You Get
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mb-10">
            Inside the Newsletter
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                Daily Dashboard
              </h3>
              <p className="text-sm text-gray-600">
                Quick market observations and regime status updates so you
                always know where we stand.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                Regime Signals
              </h3>
              <p className="text-sm text-gray-600">
                Clear notifications when the model shifts between risk-on and
                risk-off positioning.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                Educational Content
              </h3>
              <p className="text-sm text-gray-600">
                Articles on systematic investing, behavioral psychology, and
                building robust trading processes.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                Full Track Record
              </h3>
              <p className="text-sm text-gray-600">
                Complete transparency with every trade documented and
                performance updated weekly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Ready to See the System in Action?
            </h2>
            <p className="mt-4 text-gray-400">
              Review the track record, then subscribe to follow along in real
              time.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/track-record"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                View Track Record
              </Link>
              <a
                href="https://www.marketregimes.com/subscribe"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3.5 border border-gray-600 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Subscribe on Substack
              </a>
            </div>
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
            not indicative of future results. I am not a registered investment
            advisor, broker, or financial planner. Always conduct your own
            research and consult with a qualified financial professional before
            making investment decisions.
          </p>
        </div>
      </section>
    </div>
  );
}

export const metadata = {
  title: "About | The Market Regime Report",
  description:
    "Learn about the rules-based regime model, how it works, and the philosophy behind systematic investing without emotion.",
};
