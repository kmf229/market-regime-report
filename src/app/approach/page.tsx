import Link from "next/link";
import Disclaimer from "@/components/Disclaimer";

export default function ApproachPage() {
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
            Our Investment Approach
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl">
            A systematic framework designed for consistency, not prediction. Our
            regime-based approach responds to market leadership patterns with
            institutional discipline.
          </p>
        </div>
      </section>

      {/* Methodology Overview */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider mb-3">
              Methodology
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Regime-Based Framework
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                The core of our investment strategy is identifying and responding to
                market regimes—distinct periods where specific leadership patterns
                dominate market behavior. Rather than predicting what will happen next,
                we systematically identify what is happening now.
              </p>
              <p>
                The framework analyzes relative strength and momentum across major
                market sectors to determine whether conditions favor risk-taking or
                risk-avoidance. When the data indicates risk-on conditions, the strategy
                positions for growth. When it signals risk-off, capital rotates to
                defensive assets.
              </p>
              <p>
                This approach removes emotional interference, eliminates prediction
                bias, and ensures every decision follows a repeatable, rules-based
                process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Asset Universe */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider mb-3">
              What We Trade
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Asset Universe
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                We trade liquid futures contracts across major asset classes,
                focusing on instruments that provide:
              </p>
              <ul className="space-y-3 ml-6">
                <li className="flex items-start gap-3">
                  <span className="text-gray-400 mt-1">—</span>
                  <span>
                    <strong className="text-gray-900">Deep liquidity:</strong> Tight
                    bid-ask spreads and substantial open interest for efficient execution
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-400 mt-1">—</span>
                  <span>
                    <strong className="text-gray-900">Transparent pricing:</strong>{" "}
                    Real-time, centralized pricing with no information asymmetry
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-400 mt-1">—</span>
                  <span>
                    <strong className="text-gray-900">Institutional infrastructure:</strong>{" "}
                    Regulated exchanges with robust clearing mechanisms
                  </span>
                </li>
              </ul>
              <p className="mt-6">
                The primary allocation categories are equity index futures (for risk-on
                positioning) and alternative assets (for risk-off positioning). This
                simple two-asset framework reduces complexity while maintaining exposure
                to major market trends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Management */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider mb-3">
              Protecting Capital
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Risk Management
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Risk management is embedded in every aspect of the strategy, not
                applied as an afterthought. Key risk controls include:
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="p-5 bg-white border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Position Sizing
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Systematic position sizing methodology ensures consistent risk
                    exposure across market conditions, preventing over-leverage during
                    favorable periods and under-allocation during opportunities.
                  </p>
                </div>
                <div className="p-5 bg-white border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Drawdown Controls
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Portfolio-level drawdown limits trigger defensive positioning
                    adjustments, protecting capital during extended adverse conditions
                    while maintaining systematic discipline.
                  </p>
                </div>
                <div className="p-5 bg-white border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Real-Time Monitoring
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Continuous tracking of market conditions, regime status, and
                    portfolio exposure ensures rapid response to changing environments
                    without discretionary interference.
                  </p>
                </div>
                <div className="p-5 bg-white border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Concentrated Exposure
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Rather than diversifying across dozens of positions, the strategy
                    maintains concentrated exposure to high-conviction regime-driven
                    opportunities, accepting higher volatility for clearer edge.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Futures */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Why Futures?
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Futures contracts provide institutional-quality characteristics that
                make them superior vehicles for systematic strategies:
              </p>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Superior Liquidity
                    </h3>
                    <p className="text-sm text-gray-600">
                      Major futures contracts trade with enormous volume and tight
                      spreads, enabling large position changes without market impact.
                      This is critical for systematic strategies operating at scale.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Cost Efficiency
                    </h3>
                    <p className="text-sm text-gray-600">
                      Futures carry no management fees, minimal transaction costs, and
                      favorable tax treatment (60/40 tax rate). Over time, these cost
                      advantages compound significantly versus mutual funds or ETFs.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Two-Way Markets
                    </h3>
                    <p className="text-sm text-gray-600">
                      Futures allow equally efficient long and short positioning without
                      borrowing costs or uptick rules. This flexibility is essential for
                      regime-based strategies that require rapid rotation.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Complete Transparency
                    </h3>
                    <p className="text-sm text-gray-600">
                      Exchange-traded futures provide centralized pricing, volume data,
                      and open interest. No opaque pricing, no dealer spreads, no
                      information advantages for sophisticated participants.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research & Development */}
      <section className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider mb-3">
              Ongoing Development
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Research & Continuous Improvement
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                The regime framework is not static. We continuously monitor performance,
                analyze market structure changes, and refine the methodology based on
                observed results—not curve-fitting to past data.
              </p>
              <p>
                Our commitment is to robustness over optimization. Simple, logical
                frameworks tend to survive changing market conditions, while complex,
                over-fitted models break when conditions shift. Every refinement must
                improve out-of-sample consistency, not just historical backtests.
              </p>
              <p>
                This disciplined approach to research ensures the strategy evolves
                intelligently without sacrificing the core principles that drive its edge.
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
              Ready to Learn More?
            </h2>
            <p className="mt-4 text-gray-400">
              Review our track record or get in touch to discuss future investment availability.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/track-record"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                View Track Record
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3.5 border border-gray-600 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Contact Us
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
  title: "Approach",
  description:
    "Our systematic regime-based framework for futures trading. Learn about our methodology, asset universe, risk management, and investment process.",
};
