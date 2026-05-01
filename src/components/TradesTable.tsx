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

  const formatCurrency = (value: number | null) => {
    if (value === null) return "—";
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
    return formatted;
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Trade History</h2>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-3 px-4 font-semibold text-sm">#</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Regime</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Entry</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Exit</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Symbol</th>
              <th className="text-right py-3 px-4 font-semibold text-sm">Contracts</th>
              <th className="text-right py-3 px-4 font-semibold text-sm">Entry Price</th>
              <th className="text-right py-3 px-4 font-semibold text-sm">Exit Price</th>
              <th className="text-right py-3 px-4 font-semibold text-sm">P&L</th>
              <th className="text-right py-3 px-4 font-semibold text-sm">Equity</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.trade_number} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm">{trade.trade_number}</td>
                <td className="py-3 px-4 text-sm">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      trade.regime === "Bullish"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {trade.regime}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">{formatDate(trade.date_in)}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{formatDate(trade.date_out)}</td>
                <td className="py-3 px-4 text-sm font-mono">{trade.symbol}</td>
                <td className="py-3 px-4 text-sm text-right font-mono">{trade.contracts}</td>
                <td className="py-3 px-4 text-sm text-right font-mono">{formatCurrency(trade.entry_price)}</td>
                <td className="py-3 px-4 text-sm text-right font-mono">{formatCurrency(trade.exit_price)}</td>
                <td
                  className={`py-3 px-4 text-sm text-right font-mono font-semibold ${
                    trade.pnl === null
                      ? "text-gray-400"
                      : trade.pnl >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {trade.pnl === null ? "Pending" : formatCurrency(trade.pnl)}
                </td>
                <td className="py-3 px-4 text-sm text-right font-mono font-semibold">
                  {formatCurrency(trade.equity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {trades.map((trade) => (
          <div key={trade.trade_number} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-500">Trade #{trade.trade_number}</span>
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  trade.regime === "Bullish"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
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
            </div>
          </div>
        ))}
      </div>

      {/* Note */}
      <p className="mt-4 text-xs text-gray-500">
        * All figures are scaled 10x for display purposes. Starting equity: $250,000.
      </p>
    </div>
  );
}
