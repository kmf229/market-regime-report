export interface Summary {
  start_date: string;
  data_through: string;
  strategy_length_days: number;
  strategy_length_years: number;
  cumulative_return: number;
  cagr: number;
  max_drawdown: number;
  sharpe_ratio: number | null;
  avg_monthly_return: number;
  best_month_return: number;
  best_month_label: string;
  worst_month_return: number;
  worst_month_label: string;
  up_months_pct: number;
  // S&P 500 benchmark metrics
  sp500_cumulative_return: number | null;
  sp500_cagr: number | null;
  sp500_max_drawdown: number | null;
  alpha_vs_sp500: number | null;
}

export interface MonthlyReturnsRow {
  Year: number;
  Jan: number | null;
  Feb: number | null;
  Mar: number | null;
  Apr: number | null;
  May: number | null;
  Jun: number | null;
  Jul: number | null;
  Aug: number | null;
  Sep: number | null;
  Oct: number | null;
  Nov: number | null;
  Dec: number | null;
  YTD: number | null;
}

export interface MonthlyReturns {
  columns: string[];
  rows: MonthlyReturnsRow[];
}

export interface Trade {
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
