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
            How the strategy works, where it fits in an institutional portfolio, and
            what makes it different from traditional trend-following CTAs.
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
              Measuring Institutional Capital Rotation
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                The framework measures relative strength across risk-on sectors (technology, industrials,
                consumer discretionary) versus risk-off sectors (utilities, staples, treasuries, gold).
                When risk-on sectors systematically outperform on a z-score normalized basis, it signals
                that institutional capital is rotating toward growth. When risk-off sectors lead, capital
                is rotating toward safety.
              </p>
              <p>
                This isn't prediction—it's measurement. By the time the signal triggers, the rotation is
                already underway. Large institutional portfolios can't reposition overnight. That lag creates
                a persistent drift we can measure and follow.
              </p>
              <p>
                Regime shifts are infrequent by design. The framework requires sustained, statistically
                significant changes in market leadership—not short-term noise. Typical signal frequency
                is 4-8 times per year, reflecting only major structural shifts in institutional positioning.
                Low turnover minimizes transaction costs while maintaining exposure to sustained trends.
              </p>
              <p>
                Every position change follows a rules-based process with complete transparency. No predictions,
                no discretionary overrides, no principal-agent risk. The strategy does exactly what the
                framework signals, documented in real-time for institutional due diligence.
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

      {/* Portfolio Fit */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider mb-3">
              Portfolio Construction
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Where It Fits in Your Portfolio
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                S&P 500 correlation ranges from 0.33 to 0.51 depending on program leverage—low enough
                to provide genuine diversification, but not zero because the strategy participates in
                equity upside during bullish regimes. This is a feature, not a bug: you get equity
                participation during bull markets AND regime-driven protection during bear markets.
              </p>
              <p>
                Bond correlation is near zero. The signal is driven by equity sector rotation, which
                operates independently of interest rate dynamics. This makes the strategy complementary
                to traditional 60/40 portfolios without introducing duration risk.
              </p>
              <p>
                <strong className="text-gray-900">The diversification story is clearest during crises.</strong> When
                the S&P dropped 38% in 2008, the strategy was positioned in gold. When COVID hit in March 2020,
                the framework detected the bearish signal and rotated defensively before catching the recovery
                rally in May 2020. This is crisis alpha—not just avoiding drawdowns, but profiting from the
                conditions that cause them.
              </p>
              <p>
                <strong className="text-gray-900">Typical allocation:</strong> 10-20% of total portfolio as part
                of a managed futures or alternatives sleeve. For a $100 million balanced portfolio, $10-15 million
                here improves portfolio Sharpe ratio without meaningfully increasing correlation to traditional
                assets. It's the third leg that zigs when stocks zag, participates when stocks rally, and generates
                alpha independent of the 60/40 framework.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How We're Different */}
      <section className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider mb-3">
              Differentiation
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              How This Differs from Traditional CTAs
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Most CTAs ask: <em>"Is this market trending up or down?"</em> We ask a fundamentally
                different question: <em>"Is the overall market environment favoring growth or safety?"</em>
              </p>
              <p>
                Traditional trend followers trade 50-100+ individual markets, applying price-based momentum
                signals (moving averages, breakouts) to each independently. Their diversification IS their
                risk management—if soybeans whipsaw, hopefully crude oil is trending.
              </p>
              <p>
                Our approach is the opposite. We make one macro decision—risk-on or risk-off—based on the
                aggregate behavior of institutional capital across sectors. Then we express that single
                decision through concentrated futures positions with maximum conviction. We're not diversified
                across markets. We're concentrated in one high-confidence regime call.
              </p>
              <p>
                The result is a strategy that's simpler, more transparent, and more understandable. An investor
                always knows exactly what they own—either equity index futures or alternative asset futures,
                nothing else. They can verify the thesis themselves with publicly available sector data. There's
                no black box, no 200-market portfolio they can't track, no complex spread trades.
              </p>
              <p>
                <strong className="text-gray-900">And the simplicity is the robustness.</strong> We tested 2,000+
                parameter variations and virtually all were profitable. That doesn't happen with overfit, complex
                systems. It happens when the underlying signal captures something structurally real.
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
