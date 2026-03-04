interface RegimeContextProps {
  regime: "bullish" | "bearish";
  strength: number;
}

export default function RegimeContext({ regime, strength }: RegimeContextProps) {
  const isBullish = regime === "bullish";
  const threshold = 0.25;
  const distanceToFlip = isBullish
    ? strength - threshold
    : threshold - strength;
  const isNearFlip = Math.abs(distanceToFlip) < 0.15;

  return (
    <div
      className={`rounded-lg border p-5 ${
        isBullish
          ? "bg-emerald-50 border-emerald-200"
          : "bg-red-50 border-red-200"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isBullish ? "bg-emerald-500" : "bg-red-500"
          }`}
        >
          {isBullish ? (
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          )}
        </div>

        <div className="flex-1">
          <h3
            className={`text-lg font-bold ${
              isBullish ? "text-emerald-800" : "text-red-800"
            }`}
          >
            {isBullish ? "Risk-On Positioning" : "Defensive Positioning"}
          </h3>

          <p
            className={`mt-1 text-sm ${
              isBullish ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {isBullish ? (
              <>
                The model favors <strong>growth and momentum</strong>. Currently
                positioned in <strong>TQQQ</strong> (3x leveraged Nasdaq) to
                capture upside during favorable market conditions.
              </>
            ) : (
              <>
                The model favors <strong>capital preservation</strong>. Currently
                positioned in <strong>GLD</strong> (gold ETF) as a defensive
                store of value during unfavorable conditions.
              </>
            )}
          </p>

          {isNearFlip && (
            <div
              className={`mt-3 px-3 py-2 rounded text-xs font-medium ${
                isBullish
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-current mr-2 animate-pulse"></span>
              Regime strength approaching threshold — monitoring closely
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
