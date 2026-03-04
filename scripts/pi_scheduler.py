"""
Raspberry Pi Scheduler for Market Regime Updates

Runs every 10 minutes during market hours (Mon-Fri, 9:30am-4:15pm ET).
Updates Supabase with latest regime data and speedometer image.

Setup on Pi:
    1. pip install supabase python-dotenv schedule pandas numpy matplotlib
    2. Create .env file with SUPABASE_URL and SUPABASE_SERVICE_KEY
    3. Copy your stocks.py module and any dependencies
    4. Run: python pi_scheduler.py

To run as a service (survives reboot):
    sudo nano /etc/systemd/system/regime-updater.service
    # See bottom of this file for service config
"""

import os
import sys
import time
import schedule
from datetime import datetime
from pathlib import Path
import pytz

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Timezone for market hours
ET = pytz.timezone("America/New_York")

# Market hours (Eastern Time)
# Runs until 4:15pm to account for 15-minute delayed data
MARKET_OPEN_HOUR = 9
MARKET_OPEN_MINUTE = 30
MARKET_CLOSE_HOUR = 16
MARKET_CLOSE_MINUTE = 15


def is_market_hours() -> bool:
    """Check if current time is during market hours (Mon-Fri, 9:30am-4pm ET)."""
    now = datetime.now(ET)

    # Check if weekday (Monday=0, Friday=4)
    if now.weekday() > 4:
        return False

    # Check time
    market_open = now.replace(hour=MARKET_OPEN_HOUR, minute=MARKET_OPEN_MINUTE, second=0, microsecond=0)
    market_close = now.replace(hour=MARKET_CLOSE_HOUR, minute=MARKET_CLOSE_MINUTE, second=0, microsecond=0)

    return market_open <= now <= market_close


def calculate_regime():
    """
    Calculate current regime data.

    This is where your regime calculation logic goes.
    Returns regime_s, z_spread_smoothed, and speedometer_path.
    """
    import pandas as pd
    import numpy as np

    # ============================================
    # PASTE YOUR REGIME CALCULATION CODE HERE
    # ============================================

    # Import your stocks module
    from stocks import Stocks

    stocks = Stocks()

    RISK_ON_TICKERS = ["XLK", "XLY", "XLI", "SMH", "IWM"]
    RISK_OFF_TICKERS = ["XLU", "XLP", "XLV", "GLD", "TLT"]
    BENCHMARK = ["SPY"]
    WINDOW_LENGTH = 45
    EMA_SMOOTHING = 20
    BULLISH_THRESHOLD = 0.25

    today = datetime.now().strftime('%Y-%m-%d')

    def fetch_closes(tickers):
        all_series = {}
        for ticker in tickers:
            temp = stocks.ohlc(ticker, end=today)
            all_series[ticker] = (
                temp[['date', 'close']]
                .set_index('date')
                .to_dict()['close']
            )
        df = pd.DataFrame(all_series).sort_index()
        return df

    # Fetch data
    benchmark = fetch_closes(BENCHMARK)
    risk_on_df = fetch_closes(RISK_ON_TICKERS)
    risk_off_df = fetch_closes(RISK_OFF_TICKERS)
    df = pd.concat([risk_on_df, risk_off_df, benchmark], axis=1).dropna()

    # Relative strength vs benchmark
    risk_on_rs = df[RISK_ON_TICKERS].div(df['SPY'], axis=0)
    risk_off_rs = df[RISK_OFF_TICKERS].div(df['SPY'], axis=0)

    # Averages
    risk_on_avg = risk_on_rs.mean(axis=1)
    risk_off_avg = risk_off_rs.mean(axis=1)

    # Rolling mean/std -> z-scores
    ro_mean = risk_on_avg.rolling(WINDOW_LENGTH).mean()
    ro_std = risk_on_avg.rolling(WINDOW_LENGTH).std()
    rf_mean = risk_off_avg.rolling(WINDOW_LENGTH).mean()
    rf_std = risk_off_avg.rolling(WINDOW_LENGTH).std()

    risk_on_z = (risk_on_avg - ro_mean) / ro_std
    risk_off_z = (risk_off_avg - rf_mean) / rf_std

    z_spread = risk_on_z - risk_off_z
    z_spread_smoothed = z_spread.ewm(span=EMA_SMOOTHING, adjust=False).mean()

    # Regime classification
    regime_s = pd.Series(index=z_spread_smoothed.index, dtype=object)
    regime_s[z_spread_smoothed > BULLISH_THRESHOLD] = 'Bullish'
    regime_s[z_spread_smoothed <= BULLISH_THRESHOLD] = 'Bearish'

    # ============================================
    # GENERATE SPEEDOMETER
    # ============================================

    from matplotlib.patches import Wedge
    import matplotlib.pyplot as plt

    def scale_regime_strength(raw_strength, threshold=0.25, bearish_min=-3.5, bullish_max=3.5):
        """Scale raw regime strength to -10 to +10 scale."""
        if raw_strength >= threshold:
            range_size = bullish_max - threshold
            distance = raw_strength - threshold
            scaled = (distance / range_size) * 10
        else:
            range_size = threshold - bearish_min
            distance = threshold - raw_strength
            scaled = -(distance / range_size) * 10
        return max(-10, min(10, scaled))

    def save_regime_gauge(scaled_value, out_path, dpi=300):
        """Generate speedometer image."""
        out_path = Path(out_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)

        val = float(np.clip(scaled_value, -10, 10))
        is_bullish = val >= 0

        angle_deg = 90 - (val / 10) * 90
        angle = np.deg2rad(angle_deg)

        bearish_color = "#ef4444"
        bullish_color = "#22c55e"
        dark_gray = "#1f2937"

        fig, ax = plt.subplots(figsize=(4.5, 3))
        fig.patch.set_facecolor("white")
        ax.set_facecolor("white")
        ax.set_aspect("equal")
        ax.axis("off")

        r_outer = 1.0
        r_inner = 0.55

        n_segments = 100
        for i in range(n_segments):
            a1 = 180 - (i * 180 / n_segments)
            a2 = 180 - ((i + 1) * 180 / n_segments)

            t = i / n_segments
            if t < 0.5:
                r = 0.94 - (t * 0.3)
                g = 0.27 + (t * 0.5)
                b = 0.27 + (t * 0.4)
            else:
                t2 = (t - 0.5) * 2
                r = 0.64 - (t2 * 0.5)
                g = 0.52 + (t2 * 0.25)
                b = 0.47 - (t2 * 0.1)

            wedge = Wedge((0, 0), r_outer, a2, a1, width=(r_outer - r_inner),
                         facecolor=(r, g, b), edgecolor="none")
            ax.add_patch(wedge)

        theta = np.linspace(np.pi, 0, 200)
        ax.plot(r_outer * np.cos(theta), r_outer * np.sin(theta),
                linewidth=2, color=dark_gray, solid_capstyle="round")
        ax.plot(r_inner * np.cos(theta), r_inner * np.sin(theta),
                linewidth=2, color=dark_gray, solid_capstyle="round")

        ax.plot([-r_outer, -r_inner], [0, 0], linewidth=2, color=dark_gray)
        ax.plot([r_inner, r_outer], [0, 0], linewidth=2, color=dark_gray)
        ax.plot([0, 0], [r_inner, r_outer], linewidth=1.5, color="white", alpha=0.8)

        needle_len = r_inner - 0.08
        xN, yN = needle_len * np.cos(angle), needle_len * np.sin(angle)

        ax.plot([0.01, xN + 0.01], [-0.01, yN - 0.01],
                linewidth=6, color="black", alpha=0.15, solid_capstyle="round")
        ax.plot([0, xN], [0, yN], linewidth=5, color=dark_gray, solid_capstyle="round")

        hub = plt.Circle((0, 0), 0.06, facecolor=dark_gray, edgecolor="none")
        ax.add_patch(hub)

        ax.text(-0.78, 0.15, "BEARISH", ha="center", va="center",
                fontsize=7, fontweight="bold", color="white", alpha=0.95)
        ax.text(0.78, 0.15, "BULLISH", ha="center", va="center",
                fontsize=7, fontweight="bold", color="white", alpha=0.95)

        label = "Bullish" if is_bullish else "Bearish"
        label_color = bullish_color if is_bullish else bearish_color
        ax.text(0, -0.18, label, ha="center", va="center",
                fontsize=22, fontweight="bold", color=label_color)

        ax.text(0, -0.32, f"{val:+.1f}", ha="center", va="center",
                fontsize=12, fontweight="bold", color=dark_gray, family="monospace")

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M ET")
        ax.text(0, -0.42, f"Last Updated: {timestamp}", ha="center", va="center",
                fontsize=7, color="#6b7280")

        ax.set_xlim(-1.2, 1.2)
        ax.set_ylim(-0.5, 1.1)

        plt.tight_layout(pad=0.5)
        plt.savefig(out_path, dpi=dpi, bbox_inches="tight", facecolor="white")
        plt.close(fig)

        return str(out_path)

    # Generate speedometer
    z_today = float(z_spread_smoothed.iloc[-1])
    scaled_strength = scale_regime_strength(z_today)
    speedometer_path = Path("/tmp/regime_speedometer.png")
    save_regime_gauge(scaled_strength, speedometer_path)

    return regime_s, z_spread_smoothed, str(speedometer_path)


def update_regime():
    """Main update function called by scheduler."""
    if not is_market_hours():
        print(f"[{datetime.now(ET)}] Outside market hours, skipping update")
        return

    try:
        print(f"[{datetime.now(ET)}] Calculating regime...")
        regime_s, z_spread_smoothed, speedometer_path = calculate_regime()

        print(f"[{datetime.now(ET)}] Updating Supabase...")
        from update_regime_supabase import update_all
        update_all(regime_s, z_spread_smoothed, speedometer_path)

        print(f"[{datetime.now(ET)}] Update complete!")

    except Exception as e:
        print(f"[{datetime.now(ET)}] Error: {e}")
        import traceback
        traceback.print_exc()


def main():
    """Main entry point."""
    print("=" * 50)
    print("Market Regime Updater")
    print("=" * 50)
    print(f"Started at: {datetime.now(ET)}")
    print("Schedule: Every 10 minutes during market hours")
    print("Market hours: Mon-Fri, 9:30am-4:15pm ET")
    print("=" * 50)

    # Run once on startup
    update_regime()

    # Schedule to run every 10 minutes
    schedule.every(10).minutes.do(update_regime)

    # Keep running
    while True:
        schedule.run_pending()
        time.sleep(10)  # Check every 10 seconds


if __name__ == "__main__":
    main()


# ============================================
# SYSTEMD SERVICE CONFIG
# ============================================
#
# Save this as /etc/systemd/system/regime-updater.service:
#
# [Unit]
# Description=Market Regime Updater
# After=network.target
#
# [Service]
# Type=simple
# User=pi
# WorkingDirectory=/home/pi/market-regime
# Environment=SUPABASE_URL=https://your-project.supabase.co
# Environment=SUPABASE_SERVICE_KEY=your-service-key
# ExecStart=/usr/bin/python3 /home/pi/market-regime/pi_scheduler.py
# Restart=always
# RestartSec=10
#
# [Install]
# WantedBy=multi-user.target
#
# Then run:
#   sudo systemctl daemon-reload
#   sudo systemctl enable regime-updater
#   sudo systemctl start regime-updater
#   sudo systemctl status regime-updater
