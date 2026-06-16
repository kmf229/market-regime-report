export default function Disclaimer({
  variant = "standard",
}: {
  variant?: "standard" | "performance" | "trackrecord" | "legal";
}) {
  if (variant === "standard") {
    return (
      <div className="bg-gray-50 border-l-4 border-gray-400 p-6">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
          Disclaimer
        </h3>
        <div className="text-xs text-gray-600 leading-relaxed space-y-2">
          <p>
            Past performance is not necessarily indicative of future results. There is a
            substantial risk of loss in futures trading. Market Regime Capital is not
            currently registered as a Commodity Trading Advisor.
          </p>
          <p>
            The content on this website is for informational purposes only and does not
            constitute investment advice. Consult with qualified financial professionals
            before making any investment decisions.
          </p>
        </div>
      </div>
    );
  }

  if (variant === "trackrecord") {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
        <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-3">
          Performance Disclosure
        </h3>
        <div className="text-sm text-blue-800 space-y-3 leading-relaxed">
          <p>
            The performance data presented represents actual executed trades in a live
            trading account. All trades shown were executed at stated prices and reflect
            actual fills, commissions, and slippage.
          </p>
          <p>
            <strong>Past performance is not necessarily indicative of future results.</strong>{" "}
            There is a substantial risk of loss in futures trading. The results achieved
            in this account may not be typical and do not guarantee similar results in
            the future.
          </p>
          <p>
            <strong>Risk of Loss:</strong> Trading futures and derivatives involves
            substantial risk of loss and is not suitable for all investors. You should
            carefully consider whether trading is appropriate for you in light of your
            experience, objectives, financial resources, and other relevant circumstances.
          </p>
          <p>
            <strong>No Representation:</strong> No representation is being made that any
            account will or is likely to achieve profits or losses similar to those shown.
            Market conditions, account size, and individual circumstances will affect
            actual trading results.
          </p>
        </div>
      </div>
    );
  }

  if (variant === "performance") {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
        <h3 className="text-sm font-semibold text-yellow-900 uppercase tracking-wide mb-3">
          Hypothetical Performance Disclosure
        </h3>
        <div className="text-sm text-yellow-800 space-y-3 leading-relaxed">
          <p>
            The performance data presented includes both simulated/hypothetical results
            and actual live trading. Hypothetical performance results have certain
            inherent limitations. Unlike actual performance records, simulated results do
            not represent actual trading and may not reflect the impact of material
            economic and market factors.
          </p>
          <p>
            <strong>CFTC Rule 4.41:</strong> Hypothetical or simulated performance
            results have certain limitations. Unlike an actual performance record,
            simulated results do not represent actual trading. Also, since the trades
            have not been executed, the results may have under- or over-compensated for
            the impact, if any, of certain market factors, such as lack of liquidity.
            Simulated trading programs in general are also subject to the fact that they
            are designed with the benefit of hindsight. No representation is being made
            that any account will or is likely to achieve profits or losses similar to
            those shown.
          </p>
          <p>
            <strong>Past performance is not necessarily indicative of future results.</strong>
          </p>
          <p>
            <strong>Risk of Loss:</strong> Trading futures and derivatives involves
            substantial risk of loss and is not suitable for all investors. Only risk
            capital should be used for trading.
          </p>
        </div>
      </div>
    );
  }

  if (variant === "legal") {
    return (
      <div className="bg-gray-100 border border-gray-300 p-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
          Important Legal Disclosures
        </h3>
        <div className="text-xs text-gray-700 space-y-3 leading-relaxed">
          <p>
            <strong>Registration Status:</strong> Market Regime Capital is not currently
            registered as a Commodity Trading Advisor (CTA) with the Commodity Futures
            Trading Commission (CFTC) or the National Futures Association (NFA). This
            website is for informational and educational purposes only.
          </p>
          <p>
            <strong>No Investment Advice:</strong> The content on this website does not
            constitute investment advice, a recommendation, or an offer to buy or sell
            any securities or futures contracts. Any investment decisions should be made
            only after consulting with qualified financial professionals who are aware of
            your individual circumstances.
          </p>
          <p>
            <strong>Accredited Investors:</strong> Any investment programs offered by
            Market Regime Capital will be available only to accredited investors and
            qualified purchasers as defined under applicable securities laws.
          </p>
          <p>
            <strong>Forward-Looking Statements:</strong> This website may contain
            forward-looking statements regarding future performance, strategies, or
            market conditions. Such statements are subject to risks and uncertainties and
            actual results may differ materially.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
