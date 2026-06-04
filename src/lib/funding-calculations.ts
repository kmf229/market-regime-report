import { Summary, MonthlyReturns, MonthlyReturnsRow, Trade, DailyHistoryRow, SP500DailyHistoryRow } from "@/types/track-record";

// Constants
export const BASELINE_EQUITY = 100000; // Chart baseline (what Python script uses)
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
 * Calculate starting equity for trades table based on funding level
 */
export function getTradesStartingEquity(fundingPct: number): number {
  return NOTIONAL_TRADING_LEVEL * (fundingPct / 100);
}

/**
 * Adjust a single return percentage based on funding level
 */
export function adjustReturn(originalReturn: number, fundingPct: number): number {
  const scaleFactor = getScaleFactor(fundingPct);
  return originalReturn * scaleFactor;
}

/**
 * Build equity curve from daily history with adjusted returns for funding level
 * This matches the Python script's approach exactly
 */
export function buildEquityCurveFromDaily(
  dailyHistory: DailyHistoryRow[],
  fundingPct: number
): { dates: Date[]; strategyEquity: number[] } {
  if (!dailyHistory || dailyHistory.length === 0) {
    return { dates: [], strategyEquity: [] };
  }

  const scaleFactor = getScaleFactor(fundingPct);

  // Start at baseline equity ($100K)
  const dates: Date[] = [];
  const strategyEquity: number[] = [BASELINE_EQUITY];
  let currentEquity = BASELINE_EQUITY;

  // Add baseline date (day before first data point)
  const firstDate = new Date(dailyHistory[0].date);
  const baselineDate = new Date(firstDate);
  baselineDate.setDate(baselineDate.getDate() - 1);
  dates.push(baselineDate);

  // Build equity curve from daily TWR
  // NOTE: TWR values in database are stored as percentages (e.g., 2.5 for 2.5%)
  // Convert to decimal by dividing by 100
  for (const day of dailyHistory) {
    const twrDecimal = day.twr / 100; // Convert percentage to decimal
    const adjustedReturn = twrDecimal * scaleFactor;
    currentEquity *= (1 + adjustedReturn);

    dates.push(new Date(day.date));
    strategyEquity.push(currentEquity);
  }

  // Debug logging
  console.log(`Equity curve at ${fundingPct}% funding:`, {
    scaleFactor,
    numDays: dailyHistory.length,
    startEquity: BASELINE_EQUITY,
    endEquity: currentEquity,
    totalReturn: ((currentEquity - BASELINE_EQUITY) / BASELINE_EQUITY) * 100,
    sampleAdjustedReturns: dailyHistory.slice(0, 5).map(d => ({
      date: d.date,
      originalTWR_pct: d.twr,
      twrDecimal: d.twr / 100,
      adjustedReturn: (d.twr / 100) * scaleFactor,
    }))
  });

  return { dates, strategyEquity };
}

/**
 * Build S&P 500 equity curve from daily history data
 * S&P 500 stays constant regardless of funding level
 */
export function buildSP500CurveFromDaily(
  sp500DailyHistory: SP500DailyHistoryRow[]
): number[] {
  if (!sp500DailyHistory || sp500DailyHistory.length === 0) {
    return [];
  }

  return sp500DailyHistory.map(row => row.equity);
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
 * Calculate cumulative return from a series of returns
 */
function calculateCumulativeReturn(returns: number[]): number {
  let cumulative = 1;
  for (const ret of returns) {
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
  let maxDDPoint = { peak: peak, trough: peak, dd: 0 };

  for (const equity of equityCurve) {
    if (equity > peak) {
      peak = equity;
    }
    const drawdown = (equity - peak) / peak;
    if (drawdown < maxDD) {
      maxDD = drawdown;
      maxDDPoint = { peak, trough: equity, dd: maxDD };
    }
  }

  console.log('Max Drawdown Calculation:', {
    maxDD: (maxDD * 100).toFixed(2) + '%',
    peak: maxDDPoint.peak.toFixed(2),
    trough: maxDDPoint.trough.toFixed(2),
    equityCurveLength: equityCurve.length,
    startEquity: equityCurve[0],
    endEquity: equityCurve[equityCurve.length - 1]
  });

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
 * Adjust the summary metrics based on funding level
 */
export function adjustSummary(
  originalSummary: Summary,
  monthlyReturnsData: MonthlyReturns,
  dailyHistory: DailyHistoryRow[],
  fundingPct: number
): Summary {
  // Get adjusted monthly returns
  const adjustedMonthlyData = adjustMonthlyReturns(monthlyReturnsData, fundingPct);
  const adjustedReturns = extractMonthlyReturnsArray(adjustedMonthlyData);

  // Build equity curve from daily data for max drawdown calculation
  const { strategyEquity } = buildEquityCurveFromDaily(dailyHistory, fundingPct);

  // Calculate adjusted metrics
  const cumulativeReturn = calculateCumulativeReturn(adjustedReturns);
  const cagr = calculateCAGR(cumulativeReturn, originalSummary.strategy_length_years);
  const maxDrawdown = strategyEquity.length > 0 ? calculateMaxDrawdown(strategyEquity) : originalSummary.max_drawdown;
  const sharpeRatio = calculateSharpeRatio(adjustedReturns);
  const avgMonthlyReturn = adjustedReturns.reduce((a, b) => a + b, 0) / adjustedReturns.length;

  // Find best and worst months
  let bestMonthReturn = adjustedReturns[0];
  let worstMonthReturn = adjustedReturns[0];
  let bestMonthLabel = originalSummary.best_month_label;
  let worstMonthLabel = originalSummary.worst_month_label;

  let monthIndex = 0;
  for (const row of adjustedMonthlyData.rows) {
    for (const col of adjustedMonthlyData.columns) {
      if (col !== "Year" && col !== "YTD") {
        const value = row[col as keyof typeof row] as number | null;
        if (value !== null) {
          if (value > bestMonthReturn) {
            bestMonthReturn = value;
            const monthNum = adjustedMonthlyData.columns.indexOf(col);
            bestMonthLabel = `${row.Year}-${String(monthNum).padStart(2, '0')}`;
          }
          if (value < worstMonthReturn) {
            worstMonthReturn = value;
            const monthNum = adjustedMonthlyData.columns.indexOf(col);
            worstMonthLabel = `${row.Year}-${String(monthNum).padStart(2, '0')}`;
          }
        }
      }
    }
  }

  // Up months % doesn't change
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
  };
}

/**
 * Adjust trade history based on funding level
 * Dollar P&L stays the same, but equity changes
 */
export function adjustTrades(
  originalTrades: Trade[],
  fundingPct: number
): Trade[] {
  const startingEquity = getTradesStartingEquity(fundingPct);
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
