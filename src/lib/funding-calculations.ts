import { Summary, MonthlyReturns, MonthlyReturnsRow, Trade } from "@/types/track-record";

// Constants
export const BASELINE_EQUITY = 100000; // Chart baseline (what's shown to users)
export const NOTIONAL_TRADING_LEVEL = 250000; // Actual trading level
export const DEFAULT_FUNDING_PCT = 33; // 3x leverage (Kevin's actual trading)
export const FUNDING_OPTIONS = [33, 50, 75, 100] as const;
export type FundingLevel = (typeof FUNDING_OPTIONS)[number];

/**
 * Calculate the scale factor for adjusting returns based on funding level
 */
function getScaleFactor(fundingPct: number): number {
  return DEFAULT_FUNDING_PCT / fundingPct;
}

/**
 * Get chart baseline equity (always $100K for display purposes)
 */
export function getChartBaselineEquity(): number {
  return BASELINE_EQUITY; // Always $100K for display
}

/**
 * Calculate starting equity for trades table based on funding level
 * Uses the actual notional trading level
 */
export function getTradesStartingEquity(fundingPct: number): number {
  return NOTIONAL_TRADING_LEVEL * (fundingPct / 100);
}

/**
 * @deprecated Use getChartBaselineEquity() or getTradesStartingEquity() instead
 */
export function getStartingEquity(fundingPct: number): number {
  return getTradesStartingEquity(fundingPct);
}

/**
 * Adjust a single return percentage based on funding level
 */
export function adjustReturn(originalReturn: number, fundingPct: number): number {
  const scaleFactor = getScaleFactor(fundingPct);
  return originalReturn * scaleFactor;
}

/**
 * Adjust monthly returns data based on funding level
 */
export function adjustMonthlyReturns(
  originalData: MonthlyReturns,
  fundingPct: number
): MonthlyReturns {
  const scaleFactor = getScaleFactor(fundingPct);

  const adjustedRows: MonthlyReturnsRow[] = originalData.rows.map((row) => {
    const adjustedRow: MonthlyReturnsRow = { Year: row.Year } as MonthlyReturnsRow;

    originalData.columns.forEach((col) => {
      const value = row[col as keyof typeof row] as number | null;
      if (col === "Year") {
        adjustedRow[col as keyof MonthlyReturnsRow] = value as any;
      } else {
        adjustedRow[col as keyof MonthlyReturnsRow] = (value !== null ? value * scaleFactor : null) as any;
      }
    });

    return adjustedRow;
  });

  return {
    columns: originalData.columns,
    rows: adjustedRows,
  };
}

/**
 * Calculate cumulative return from a series of monthly returns
 */
function calculateCumulativeReturn(monthlyReturns: number[]): number {
  let cumulative = 1;
  for (const ret of monthlyReturns) {
    cumulative *= 1 + ret;
  }
  return cumulative - 1;
}

/**
 * Calculate CAGR from cumulative return and number of years
 */
function calculateCAGR(cumulativeReturn: number, years: number): number {
  if (years === 0) return 0;
  return Math.pow(1 + cumulativeReturn, 1 / years) - 1;
}

/**
 * Calculate max drawdown from equity curve
 */
function calculateMaxDrawdown(equityCurve: number[]): number {
  let maxDD = 0;
  let peak = equityCurve[0];

  for (const equity of equityCurve) {
    if (equity > peak) {
      peak = equity;
    }
    const drawdown = (equity - peak) / peak;
    if (drawdown < maxDD) {
      maxDD = drawdown;
    }
  }

  return maxDD;
}

/**
 * Calculate Sharpe ratio from monthly returns
 */
function calculateSharpeRatio(monthlyReturns: number[]): number {
  if (monthlyReturns.length === 0) return 0;

  const mean = monthlyReturns.reduce((a, b) => a + b, 0) / monthlyReturns.length;
  const variance = monthlyReturns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / monthlyReturns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  return (mean / stdDev) * Math.sqrt(12); // Annualized
}

/**
 * Calculate gain to pain ratio
 */
function calculateGainToPainRatio(monthlyReturns: number[]): number {
  const gains = monthlyReturns.filter(r => r > 0).reduce((a, b) => a + b, 0);
  const losses = Math.abs(monthlyReturns.filter(r => r < 0).reduce((a, b) => a + b, 0));

  if (losses === 0) return gains > 0 ? Infinity : 0;
  return gains / losses;
}

/**
 * Calculate profit factor
 */
function calculateProfitFactor(monthlyReturns: number[]): number {
  const gains = monthlyReturns.filter(r => r > 0).reduce((a, b) => a + b, 0);
  const losses = Math.abs(monthlyReturns.filter(r => r < 0).reduce((a, b) => a + b, 0));

  if (losses === 0) return gains > 0 ? Infinity : 0;
  return gains / losses;
}

/**
 * Extract all non-null monthly returns from MonthlyReturns data
 */
function extractMonthlyReturnsArray(data: MonthlyReturns): number[] {
  const returns: number[] = [];

  data.rows.forEach((row) => {
    data.columns.forEach((col) => {
      if (col !== "Year" && col !== "YTD") {
        const value = row[col as keyof typeof row] as number | null;
        if (value !== null) {
          returns.push(value);
        }
      }
    });
  });

  return returns;
}

/**
 * Adjust the summary metrics based on funding level
 */
export function adjustSummary(
  originalSummary: Summary,
  monthlyReturnsData: MonthlyReturns,
  fundingPct: number
): Summary {
  // Get adjusted monthly returns
  const adjustedMonthlyData = adjustMonthlyReturns(monthlyReturnsData, fundingPct);
  const adjustedReturns = extractMonthlyReturnsArray(adjustedMonthlyData);

  // Build equity curve for max drawdown calculation
  // Use chart baseline ($100K) for consistency with display
  const startingEquity = getChartBaselineEquity();
  const equityCurve: number[] = [startingEquity];
  let currentEquity = startingEquity;

  for (const ret of adjustedReturns) {
    currentEquity *= (1 + ret);
    equityCurve.push(currentEquity);
  }

  // Calculate adjusted metrics
  const cumulativeReturn = calculateCumulativeReturn(adjustedReturns);
  const cagr = calculateCAGR(cumulativeReturn, originalSummary.strategy_length_years);
  const maxDrawdown = calculateMaxDrawdown(equityCurve);
  const sharpeRatio = calculateSharpeRatio(adjustedReturns);
  const avgMonthlyReturn = adjustedReturns.reduce((a, b) => a + b, 0) / adjustedReturns.length;

  // Find best and worst months
  let bestMonthReturn = adjustedReturns[0];
  let worstMonthReturn = adjustedReturns[0];
  let bestMonthLabel = originalSummary.best_month_label;
  let worstMonthLabel = originalSummary.worst_month_label;

  // We need to track which month corresponds to which adjusted return
  let monthIndex = 0;
  for (const row of adjustedMonthlyData.rows) {
    for (const col of adjustedMonthlyData.columns) {
      if (col !== "Year" && col !== "YTD") {
        const value = row[col as keyof typeof row] as number | null;
        if (value !== null) {
          if (value > bestMonthReturn) {
            bestMonthReturn = value;
            bestMonthLabel = `${row.Year}-${String(adjustedMonthlyData.columns.indexOf(col) + 1).padStart(2, '0')}`;
          }
          if (value < worstMonthReturn) {
            worstMonthReturn = value;
            worstMonthLabel = `${row.Year}-${String(adjustedMonthlyData.columns.indexOf(col) + 1).padStart(2, '0')}`;
          }
        }
      }
    }
  }

  // Up months % doesn't change (same months are positive/negative)
  const upMonthsPct = originalSummary.up_months_pct;

  // Calculate YTD return (last row's YTD value)
  const lastRow = adjustedMonthlyData.rows[adjustedMonthlyData.rows.length - 1];
  const ytdReturn = lastRow.YTD;

  // Calculate gain to pain and profit factor
  const gainToPainRatio = calculateGainToPainRatio(adjustedReturns);
  const profitFactor = calculateProfitFactor(adjustedReturns);

  return {
    ...originalSummary,
    cumulative_return: cumulativeReturn,
    cagr: cagr,
    max_drawdown: maxDrawdown,
    sharpe_ratio: sharpeRatio,
    ytd_return: ytdReturn,
    avg_monthly_return: avgMonthlyReturn,
    best_month_return: bestMonthReturn,
    best_month_label: bestMonthLabel,
    worst_month_return: worstMonthReturn,
    worst_month_label: worstMonthLabel,
    up_months_pct: upMonthsPct,
    gain_to_pain_ratio: gainToPainRatio,
    profit_factor: profitFactor,
    // S&P 500 metrics don't change
    sp500_cumulative_return: originalSummary.sp500_cumulative_return,
    sp500_cagr: originalSummary.sp500_cagr,
    sp500_max_drawdown: originalSummary.sp500_max_drawdown,
    alpha_vs_sp500: originalSummary.alpha_vs_sp500,
  };
}

/**
 * Adjust trade history based on funding level
 * Dollar P&L stays the same, but equity and return % change
 */
export function adjustTrades(
  originalTrades: Trade[],
  fundingPct: number
): Trade[] {
  const startingEquity = getStartingEquity(fundingPct);
  let currentEquity = startingEquity;

  return originalTrades.map((trade) => {
    if (trade.pnl !== null) {
      currentEquity = currentEquity + trade.pnl;
    }

    return {
      ...trade,
      equity: currentEquity,
    };
  });
}

/**
 * Generate adjusted equity curve data for chart
 * Returns array of equity values over time
 */
export function generateEquityCurve(
  monthlyReturnsData: MonthlyReturns,
  fundingPct: number
): number[] {
  const adjustedMonthlyData = adjustMonthlyReturns(monthlyReturnsData, fundingPct);
  const adjustedReturns = extractMonthlyReturnsArray(adjustedMonthlyData);

  // Always start at $100K baseline for chart display
  const startingEquity = getChartBaselineEquity();
  const equityCurve: number[] = [startingEquity];
  let currentEquity = startingEquity;

  for (const ret of adjustedReturns) {
    currentEquity *= (1 + ret);
    equityCurve.push(currentEquity);
  }

  return equityCurve;
}
