# Market Regime Strategy - Complete Methodology

## Overview

The Market Regime strategy is a systematic, rules-based approach that identifies when markets favor growth/momentum (bullish regime) versus defensive/safe haven assets (bearish regime). The strategy uses relative strength analysis and statistical z-scores to generate a regime signal, then invests in either TQQQ (bullish) or GLD (bearish) accordingly.

---

## 1. ETF Buckets

The strategy monitors two baskets of ETFs representing different market characteristics:

### Bullish Basket (Risk-On)
Growth, momentum, and economically-sensitive sectors:

| Ticker | Name | Sector/Asset |
|--------|------|--------------|
| XLK | Technology Select Sector SPDR | Technology |
| XLY | Consumer Discretionary Select Sector SPDR | Consumer Discretionary |
| XLI | Industrial Select Sector SPDR | Industrials |
| SMH | VanEck Semiconductor ETF | Semiconductors |
| IWM | iShares Russell 2000 ETF | Small Cap Stocks |

### Bearish Basket (Risk-Off)
Defensive sectors and safe haven assets:

| Ticker | Name | Sector/Asset |
|--------|------|--------------|
| XLU | Utilities Select Sector SPDR | Utilities |
| XLP | Consumer Staples Select Sector SPDR | Consumer Staples |
| XLV | Health Care Select Sector SPDR | Healthcare |
| GLD | SPDR Gold Shares | Gold |
| TLT | iShares 20+ Year Treasury Bond ETF | Long-term Treasuries |

### Benchmark
| Ticker | Name |
|--------|------|
| SPY | SPDR S&P 500 ETF Trust |

---

## 2. Relative Strength Calculation

Relative strength measures how each ETF is performing relative to the broad market (SPY).

### Formula
For each ETF in both baskets:

```
Relative Strength (RS) = ETF Close Price / SPY Close Price
```

This creates a ratio that shows whether the ETF is outperforming (RS increasing) or underperforming (RS decreasing) the S&P 500.

### Example
- If XLK = $200 and SPY = $500, then XLK_RS = 200/500 = 0.40
- If next day XLK = $204 and SPY = $500, then XLK_RS = 204/500 = 0.408
- XLK is outperforming (RS increased from 0.40 to 0.408)

### Basket Averages
After calculating relative strength for each ETF, we take the average for each basket:

```python
risk_on_avg = mean(XLK_RS, XLY_RS, XLI_RS, SMH_RS, IWM_RS)
risk_off_avg = mean(XLU_RS, XLP_RS, XLV_RS, GLD_RS, TLT_RS)
```

---

## 3. Z-Score Normalization

Z-scores convert the relative strength values into standardized units that account for recent volatility and trends. This makes the signals comparable across different market environments.

### Parameters
- **Window Length**: 45 trading days (~2 months)

### Formula
For each basket average:

```
Z-Score = (Current Value - Rolling Mean) / Rolling Std Dev
```

Specifically:

```python
# Risk-On Z-Score
risk_on_mean = 45-day rolling mean of risk_on_avg
risk_on_std = 45-day rolling std dev of risk_on_avg
risk_on_z = (risk_on_avg - risk_on_mean) / risk_on_std

# Risk-Off Z-Score
risk_off_mean = 45-day rolling mean of risk_off_avg
risk_off_std = 45-day rolling std dev of risk_off_avg
risk_off_z = (risk_off_avg - risk_off_mean) / risk_off_std
```

### Interpretation
- **Z > 0**: Current relative strength is above its 45-day average (strengthening)
- **Z < 0**: Current relative strength is below its 45-day average (weakening)
- **Z > 2**: Very strong performance (>2 std devs above average)
- **Z < -2**: Very weak performance (>2 std devs below average)

---

## 4. Z-Spread and Regime Strength

The regime strength is determined by the **difference** between the two z-scores.

### Raw Z-Spread Formula

```
z_spread = risk_on_z - risk_off_z
```

This single number captures the relative momentum between growth/risk and defensive assets:

- **Positive z_spread**: Risk-on assets are strengthening faster than risk-off (or weakening slower)
- **Negative z_spread**: Risk-off assets are strengthening faster than risk-on (or weakening slower)

### Example Scenarios

| Scenario | risk_on_z | risk_off_z | z_spread | Interpretation |
|----------|-----------|------------|----------|----------------|
| Strong bull market | +2.0 | -1.5 | +3.5 | Tech/growth soaring, defensives lagging |
| Moderate bullish | +0.5 | -0.2 | +0.7 | Risk assets mildly outperforming |
| Choppy market | +0.1 | +0.2 | -0.1 | Mixed signals, slight defensive edge |
| Strong bear market | -2.0 | +2.5 | -4.5 | Tech/growth crashing, safe havens rallying |

### Smoothing

To reduce whipsaws and false signals, the z_spread is smoothed using an **Exponential Moving Average (EMA)**:

```python
z_spread_smoothed = z_spread.ewm(span=20, adjust=False).mean()
```

- **EMA Span**: 20 days
- **Effect**: Recent data has more weight, but sudden spikes are dampened
- This is the final **Regime Strength** value used for signals

---

## 5. Regime Classification

The regime is determined by comparing the smoothed z-spread to a fixed threshold.

### Threshold
```
BULLISH_THRESHOLD = 0.25
```

### Rules
```python
if z_spread_smoothed > 0.25:
    regime = 'Bullish'
else:
    regime = 'Bearish'
```

### Threshold Logic
- **Why 0.25?** This threshold was chosen through backtesting to balance signal quality and trade frequency. A higher threshold (e.g., 0.5) would produce fewer but stronger signals; a lower threshold (e.g., 0.1) would produce more frequent but noisier signals.
- The threshold ensures we only flip to bullish when there's a clear, sustained advantage for growth assets over defensives.

---

## 6. Position Selection

Once the regime is determined, the strategy holds one of two leveraged/focused positions:

### Bullish Regime → Hold TQQQ
- **TQQQ**: ProShares UltraPro QQQ (3x leveraged Nasdaq-100)
- **Why TQQQ?** Maximum exposure to big tech and growth stocks when risk-on assets are in favor
- **Concentration**: Pure growth/tech exposure amplifies returns during bullish regimes

### Bearish Regime → Hold GLD
- **GLD**: SPDR Gold Shares (unleveraged gold ETF)
- **Why GLD?** Classic safe haven asset with low correlation to equities
- **Stability**: Preserves capital during market stress; often rises when equities fall

### Trade Execution
- **Flip Date Logic**: On the day the regime flips, the strategy sells the old position at close and buys the new position at close
- **All-in/All-out**: 100% of capital is always invested in either TQQQ or GLD (no cash, no partial positions)

---

## 7. Regime Strength Scaling (Display)

For user-friendly display on the website, the raw z_spread_smoothed value is scaled to a **-10 to +10** range.

### Scaling Formula

```python
def scale_regime_strength(raw_strength, threshold=0.25, bearish_min=-3.5, bullish_max=3.5):
    if raw_strength >= threshold:
        # Bullish side: threshold to +3.5 maps to 0 to +10
        range_size = bullish_max - threshold  # 3.5 - 0.25 = 3.25
        distance = raw_strength - threshold
        scaled = (distance / range_size) * 10
    else:
        # Bearish side: -3.5 to threshold maps to -10 to 0
        range_size = threshold - bearish_min  # 0.25 - (-3.5) = 3.75
        distance = threshold - raw_strength
        scaled = -(distance / range_size) * 10

    return max(-10, min(10, scaled))  # Clamp to [-10, +10]
```

### Interpretation

| Scaled Value | Label | Raw z_spread Range | Meaning |
|--------------|-------|--------------------|---------|
| +6.7 to +10 | Strong Bullish | +2.42 to +3.5+ | Very strong risk-on momentum |
| +3.3 to +6.7 | Moderate Bullish | +1.33 to +2.42 | Clear risk-on advantage |
| 0 to +3.3 | Weak Bullish | +0.25 to +1.33 | Slight risk-on edge (just above threshold) |
| 0 | Threshold | 0.25 | Exact decision point |
| 0 to -3.3 | Weak Bearish | +0.25 to -1.0 | Slight risk-off edge |
| -3.3 to -6.7 | Moderate Bearish | -1.0 to -2.25 | Clear risk-off advantage |
| -6.7 to -10 | Strong Bearish | -2.25 to -3.5- | Very strong risk-off momentum |

---

## 8. Intraday vs. Close Logic

The strategy distinguishes between **real-time signals** (updated every 10 minutes during market hours) and **official regime changes** (confirmed at 4:00pm ET close).

### Signal Regime (Intraday)
- **Updated**: Every 10 minutes from 9:30am - 4:25pm ET
- **Purpose**: Shows what the current data says the regime should be
- **Display**: Speedometer gauge, regime strength card
- **Does NOT trigger trades** until close

### Official Regime (Close)
- **Updated**: Once per day at 4:16pm ET (after market close)
- **Purpose**: This is the regime that determines actual holdings
- **Trade Logic**: If signal_regime ≠ current_regime at close, the regime officially flips
- **Display**: "Current Regime" badge, position stats, trade history

### Alert System
If the signal regime differs from the official regime during the day, an **amber alert card** appears:

> "The intraday signal is now showing [bullish/bearish], but the regime won't officially flip until market close at 4pm ET."

This gives subscribers advance notice that a regime change may be coming.

---

## 9. Return Calculation

Returns for each regime period are calculated based on the actual ETF held during that period.

### Formula

```python
# Bullish period return
entry_price = TQQQ_close[start_date]
exit_price = TQQQ_close[end_date]
return_pct = ((exit_price - entry_price) / entry_price) * 100

# Bearish period return
entry_price = GLD_close[start_date]
exit_price = GLD_close[end_date]
return_pct = ((exit_price - entry_price) / entry_price) * 100
```

### Example
- **Bullish period**: Jan 15 (TQQQ @ $50) → Feb 10 (TQQQ @ $55)
  - Return = ((55 - 50) / 50) * 100 = +10.0%
- **Bearish period**: Feb 10 (GLD @ $180) → Mar 5 (GLD @ $185)
  - Return = ((185 - 180) / 180) * 100 = +2.78%

### Cumulative Strategy Return
The overall strategy return is the compounded return across all regime periods:

```
Total Return = (1 + R1) × (1 + R2) × (1 + R3) × ... × (1 + Rn) - 1
```

Where R1, R2, etc. are the decimal returns for each regime period.

---

## 10. Data Sources and Update Frequency

### Price Data
- **Source**: Polygon.io API (real-time and historical OHLCV data)
- **Update Frequency**:
  - Intraday: Every 10 minutes during market hours (9:30am - 4:25pm ET)
  - Close: Official update at 4:16pm ET

### Storage
- **Database**: Supabase (PostgreSQL)
- **Tables**:
  - `regime_status`: Current regime, signal regime, strength, stats
  - `regime_strength_history`: Daily historical regime strength values
  - `track_record`: Performance metrics, monthly returns, equity curve
  - `daily_updates`: AI-generated market commentary

### Automation
- **Raspberry Pi**: Runs continuously, executing scheduled tasks:
  - 10-min regime updates during market hours
  - 3:30pm: Check for regime change alerts
  - 4:16pm: Official regime flip and close update
  - 8:00am: Track record update from IBKR

---

## 11. Key Strategy Characteristics

### Advantages
1. **Rules-based**: Zero discretion, fully systematic
2. **Adaptive**: Responds to changing market conditions
3. **Dual-regime**: Clear framework for both bull and bear markets
4. **Momentum-based**: Follows strength, cuts weakness
5. **Leveraged upside**: TQQQ provides 3x exposure during bullish regimes
6. **Defensive downside**: GLD provides safe haven during bearish regimes

### Risk Factors
1. **TQQQ volatility**: 3x leverage amplifies losses during whipsaws
2. **Trend-following lag**: Strategy is reactive, not predictive
3. **Threshold sensitivity**: Small changes near 0.25 can cause flips
4. **Gold opportunity cost**: GLD earns 0% during long bull runs
5. **Regime persistence**: Strategy works best when regimes last weeks/months, not days

### Performance Metrics (as of current data)
See `/track-record` page for live metrics:
- Cumulative return
- CAGR (compound annual growth rate)
- Maximum drawdown
- Sharpe ratio
- Win rate (% of profitable months)
- Benchmark comparison (SPY, QQQ, GLD)

---

## 12. Visual Representation

### Regime Speedometer
The speedometer gauge shows the scaled regime strength (-10 to +10):
- **Needle position**: Current scaled strength
- **Color gradient**: Red (bearish) to green (bullish)
- **Threshold marker**: Vertical line at 0 (raw value of 0.25)
- **Label**: "Bullish" or "Bearish" based on current signal

Generated as a PNG image using matplotlib, stored in Supabase Storage, and displayed on the `/current-regime` page.

---

## Implementation Summary

```python
# Pseudocode for complete strategy

# 1. Fetch data
prices = get_ohlc_data(RISK_ON_TICKERS + RISK_OFF_TICKERS + [SPY])

# 2. Calculate relative strength
risk_on_rs = prices[RISK_ON_TICKERS] / prices['SPY']
risk_off_rs = prices[RISK_OFF_TICKERS] / prices['SPY']

# 3. Average each basket
risk_on_avg = risk_on_rs.mean(axis=1)
risk_off_avg = risk_off_rs.mean(axis=1)

# 4. Calculate z-scores
risk_on_z = (risk_on_avg - risk_on_avg.rolling(45).mean()) / risk_on_avg.rolling(45).std()
risk_off_z = (risk_off_avg - risk_off_avg.rolling(45).mean()) / risk_off_avg.rolling(45).std()

# 5. Calculate z-spread
z_spread = risk_on_z - risk_off_z

# 6. Smooth with EMA
z_spread_smoothed = z_spread.ewm(span=20).mean()

# 7. Classify regime
regime = 'Bullish' if z_spread_smoothed > 0.25 else 'Bearish'

# 8. Determine position
position = 'TQQQ' if regime == 'Bullish' else 'GLD'

# 9. Calculate returns
if regime_changed:
    close_old_position()
    open_new_position()
```

---

## Technical Parameters Summary

| Parameter | Value | Purpose |
|-----------|-------|---------|
| Risk-On Tickers | XLK, XLY, XLI, SMH, IWM | Growth/momentum basket |
| Risk-Off Tickers | XLU, XLP, XLV, GLD, TLT | Defensive/safe haven basket |
| Benchmark | SPY | Relative strength denominator |
| Rolling Window | 45 days | Z-score lookback period |
| EMA Smoothing | 20 days | Z-spread smoothing |
| Bullish Threshold | 0.25 | Regime classification cutoff |
| Bullish Position | TQQQ | 3x leveraged Nasdaq-100 |
| Bearish Position | GLD | Gold ETF |
| Update Frequency | 10 minutes | Intraday signal updates |
| Official Flip Time | 4:00pm ET | End-of-day regime confirmation |

---

## Questions or Clarifications?

This document is version-controlled and will be updated as the strategy evolves. For implementation details, see:
- `/scripts/pi_scheduler.py` - Main calculation logic
- `/scripts/update_regime_supabase.py` - Database update functions
- `CLAUDE.md` - Full project documentation

Last updated: 2026-05-29
