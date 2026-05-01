"use client";

interface Trade {
  trade_number: number;
  regime: string;
  date_in: string;
  date_out: string | null;
  symbol: string;
  contracts: number;
  entry_price: number;
  exit_price: number | null;
  pnl: number | null;
  equity: number | null;
  status: string;
}

interface TradesTableProps {
  trades: Trade[];
}

export default function TradesTable({ trades }: TradesTableProps) {
  if (!trades || trades.length === 0) {
    return null;
  }

  const STARTING_EQUITY = 250000;

  const formatCurrency = (value: number | null, compact: boolean = false) => {
    if (value === null) return "—";
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: compact ? 0 : 2,
      maximumFractionDigits: compact ? 0 : 2,
    }).format(value);
    return formatted;
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    // Parse as local date (YYYY-MM-DD) to avoid timezone issues
    const [year, month, day] = date.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    // Use more compact format: "Jan 9, '26" instead of "Jan 9, 2026"
    const formatted = localDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const yearShort = `'${String(year).slice(-2)}`;
    return `${formatted}, ${yearShort}`;
  };

  const calculateCumulativeReturn = (equity: number | null) => {
    if (equity === null) return null;
    return ((equity - STARTING_EQUITY) / STARTING_EQUITY) * 100;
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Trade History</h2>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-2 px-2 font-semibold text-xs">#</th>
              <th className="text-left py-2 px-2 font-semibold text-xs">Regime</th>
              <th className="text-left py-2 px-2 font-semibold text-xs">Entry</th>
              <th className="text-left py-2 px-2 font-semibold text-xs">Exit</th>
              <th className="text-left py-2 px-2 font-semibold text-xs">Symbol</th>
              <th className="text-right py-2 px-2 font-semibold text-xs">Qty</th>
              <th className="text-right py-2 px-2 font-semibold text-xs">Entry $</th>
              <th className="text-right py-2 px-2 font-semibold text-xs">Exit $</th>
              <th className="text-right py-2 px-2 font-semibold text-xs">P&L</th>
              <th className="text-right py-2 px-2 font-semibold text-xs">Equity</th>
              <th className="text-right py-2 px-2 font-semibold text-xs">Return</th>
            </tr>
          </thead>
          <tbody>
            {/* Starting equity row */}
            <tr className="border-b border-gray-200 bg-gray-50">
              <td className="py-2 px-2 text-xs">—</td>
              <td className="py-2 px-2 text-xs">—</td>
              <td className="py-2 px-2 text-xs">—</td>
              <td className="py-2 px-2 text-xs">—</td>
              <td className="py-2 px-2 text-xs">—</td>
              <td className="py-2 px-2 text-xs text-right">—</td>
              <td className="py-2 px-2 text-xs text-right">—</td>
              <td className="py-2 px-2 text-xs text-right">—</td>
              <td className="py-2 px-2 text-xs text-right">—</td>
              <td className="py-2 px-2 text-xs text-right font-mono font-semibold">{formatCurrency(STARTING_EQUITY)}</td>
              <td className="py-2 px-2 text-xs text-right font-mono">0.00%</td>
            </tr>

            {trades.map((trade) => {
              const cumulativeReturn = calculateCumulativeReturn(trade.equity);
              return (
              <tr key={trade.trade_number} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-2 px-2 text-xs">{trade.trade_number}</td>
                <td className="py-2 px-2 text-xs">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      trade.regime === "Bullish"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {trade.regime}
                  </span>
                </td>
                <td className="py-2 px-2 text-xs text-gray-600">{formatDate(trade.date_in)}</td>
                <td className="py-2 px-2 text-xs text-gray-600">{formatDate(trade.date_out)}</td>
                <td className="py-2 px-2 text-xs font-mono">{trade.symbol}</td>
                <td className="py-2 px-2 text-xs text-right font-mono">{trade.contracts}</td>
                <td className="py-2 px-2 text-xs text-right font-mono">{formatCurrency(trade.entry_price, true)}</td>
                <td className="py-2 px-2 text-xs text-right font-mono">{formatCurrency(trade.exit_price, true)}</td>
                <td
                  className={`py-2 px-2 text-xs text-right font-mono font-semibold ${
                    trade.pnl === null
                      ? "text-gray-400"
                      : trade.pnl >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {trade.pnl === null ? "Pending" : formatCurrency(trade.pnl)}
                </td>
                <td className="py-2 px-2 text-xs text-right font-mono font-semibold">
                  {formatCurrency(trade.equity)}
                </td>
                <td
                  className={`py-2 px-2 text-xs text-right font-mono font-semibold whitespace-nowrap ${
                    cumulativeReturn === null
                      ? "text-gray-400"
                      : cumulativeReturn >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {cumulativeReturn === null ? "—" : formatPercent(cumulativeReturn)}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {/* Starting equity card */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-500">Starting Equity</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-600 font-semibold">Equity:</span>
              <span className="font-mono font-semibold">{formatCurrency(STARTING_EQUITY)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-semibold">Cumulative Return:</span>
              <span className="font-mono">0.00%</span>
            </div>
          </div>
        </div>

        {trades.map((trade) => {
          const cumulativeReturn = calculateCumulativeReturn(trade.equity);
          return (
          <div key={trade.trade_number} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-500">Trade #{trade.trade_number}</span>
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  trade.regime === "Bullish"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {trade.regime}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Symbol:</span>
                <span className="font-mono font-semibold">{trade.symbol}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Contracts:</span>
                <span className="font-mono">{trade.contracts}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Entry:</span>
                <span className="font-mono">{formatDate(trade.date_in)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Exit:</span>
                <span className="font-mono">{formatDate(trade.date_out)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Entry Price:</span>
                <span className="font-mono">{formatCurrency(trade.entry_price)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Exit Price:</span>
                <span className="font-mono">{formatCurrency(trade.exit_price)}</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-600 font-semibold">P&L:</span>
                <span
                  className={`font-mono font-semibold ${
                    trade.pnl === null
                      ? "text-gray-400"
                      : trade.pnl >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {trade.pnl === null ? "Pending" : formatCurrency(trade.pnl)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 font-semibold">Equity:</span>
                <span className="font-mono font-semibold">{formatCurrency(trade.equity)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 font-semibold">Cumulative Return:</span>
                <span
                  className={`font-mono font-semibold ${
                    cumulativeReturn === null
                      ? "text-gray-400"
                      : cumulativeReturn >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {cumulativeReturn === null ? "—" : formatPercent(cumulativeReturn)}
                </span>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
