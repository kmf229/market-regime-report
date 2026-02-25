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
