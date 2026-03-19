"""
Update Track Record in Supabase.

Downloads daily P&L data from IBKR FTP, decrypts it, calculates metrics,
and uploads everything to Supabase.

Requirements:
    pip install supabase python-dotenv pandas numpy matplotlib requests

Environment variables needed:
    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_SERVICE_KEY=your-service-role-key
    IBKR_FTP_USER=your-ibkr-ftp-username
    IBKR_FTP_PASS=your-ibkr-ftp-password

Also requires:
    - GPG installed with the decryption key for IBKR files

Usage:
    python update_track_record.py
"""

from __future__ import annotations

import os
import ssl
import ftplib
import subprocess
import time
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Tuple, Optional

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend for Pi
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.ticker import FuncFormatter

try:
    from supabase import create_client, Client
except ImportError:
    print("Please install supabase: pip install supabase")
    raise

# Load environment variables
try:
    from dotenv import load_dotenv
    env_file = Path(__file__).parent / ".env"
    env_local = Path(__file__).parent.parent / ".env.local"
    if env_file.exists():
        load_dotenv(env_file)
    elif env_local.exists():
        load_dotenv(env_local)
except ImportError:
    pass

# Import Stocks class for S&P 500 benchmark data
try:
    from stocks_simple import Stocks
    HAS_STOCKS = True
except ImportError:
    HAS_STOCKS = False
    print("Warning: stocks_simple not available, S&P 500 benchmark will be skipped")

# =====================================================
# CONFIG
# =====================================================

MIN_DATE = "2025-11-14"  # Strategy start date

# IBKR FTP
HOSTNAME = "ftp2.interactivebrokers.com"

# Local temp paths
DATA_DIR = Path("/tmp/track_record")
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Schema for daily P&L data
COLUMNS = ["account", "start_equity", "flows", "end_equity", "twr"]
DTYPE_MAP = {
    "account": "string",
    "start_equity": "float64",
    "flows": "float64",
    "end_equity": "float64",
    "twr": "float64",
}


def get_supabase_client() -> Client:
    """Get Supabase client using environment variables."""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")

    if not url or not key:
        raise ValueError(
            "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables."
        )

    return create_client(url, key)


def get_ibkr_credentials() -> Tuple[str, str]:
    """Get IBKR FTP credentials from environment."""
    user = os.environ.get("IBKR_FTP_USER")
    passwd = os.environ.get("IBKR_FTP_PASS")

    if not user or not passwd:
        raise ValueError(
            "Missing IBKR_FTP_USER or IBKR_FTP_PASS environment variables."
        )

    return user, passwd


def get_latest_ibkr_file(files: list) -> str:
    """Choose the most recent IBKR 'Daily_P_L' file by sorted filename."""
    file_name = "Daily_P_L"
    candidates = sorted([f for f in files if file_name in f])
    if not candidates:
        raise RuntimeError("No 'Daily_P_L' files found in IBKR outgoing folder.")
    return candidates[-1]


def download_and_decrypt_ibkr() -> Path:
    """Download latest IBKR file and decrypt it."""
    user, passwd = get_ibkr_credentials()

    print("Connecting to IBKR FTP...")

    # IBKR uses plain FTP (not FTPS)
    ftp = ftplib.FTP(HOSTNAME, user, passwd)
    ftp.encoding = "utf-8"

    files = ftp.nlst("outgoing")
    latest_file = get_latest_ibkr_file(files)
    print(f"Latest IBKR file: {latest_file}")

    encrypted_file = DATA_DIR / "latest.csv.pgp"
    decrypted_file = DATA_DIR / "latest.csv"

    with open(encrypted_file, "wb") as f:
        ftp.retrbinary(f"RETR {latest_file}", f.write)

    ftp.quit()
    print(f"Downloaded encrypted file to: {encrypted_file}")

    print("Decrypting via gpg...")
    result = subprocess.run(
        ["gpg", "--yes", "--output", str(decrypted_file), "--decrypt", str(encrypted_file)],
        capture_output=True,
        text=True
    )

    time.sleep(1)

    if result.returncode != 0 or not decrypted_file.exists():
        raise RuntimeError(f"GPG decrypt failed: {result.stderr}")

    # Clean up encrypted file
    encrypted_file.unlink(missing_ok=True)

    print(f"Decrypted file to: {decrypted_file}")
    return decrypted_file


def read_ftp_csv(path: Path) -> pd.DataFrame:
    """
    Read IBKR decrypted CSV (no header):
    account, date(YYYYMMDD), start_equity, flows, end_equity, twr
    """
    df = pd.read_csv(path, names=["account", "date", "start_equity", "flows", "end_equity", "twr"])
    df["date"] = pd.to_datetime(df["date"], format="%Y%m%d", errors="raise")
    df = df.sort_values("date").set_index("date")

    df = df[COLUMNS].copy()
    for col, dtype in DTYPE_MAP.items():
        df[col] = df[col].astype(dtype, copy=False)

    return df


def fetch_stored_history(supabase: Client) -> pd.DataFrame:
    """Fetch existing daily_history from Supabase."""
    result = supabase.table("track_record").select("daily_history").limit(1).execute()

    if not result.data or not result.data[0].get("daily_history"):
        # Return empty DataFrame with correct structure
        df = pd.DataFrame(columns=COLUMNS).astype(DTYPE_MAP)
        df.index = pd.to_datetime(df.index)
        df.index.name = "date"
        return df

    history = result.data[0]["daily_history"]
    if not history:
        df = pd.DataFrame(columns=COLUMNS).astype(DTYPE_MAP)
        df.index = pd.to_datetime(df.index)
        df.index.name = "date"
        return df

    df = pd.DataFrame(history)
    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date")

    for col, dtype in DTYPE_MAP.items():
        if col in df.columns:
            df[col] = df[col].astype(dtype, copy=False)

    return df


def merge_append_new(stored_df: pd.DataFrame, new_df: pd.DataFrame, min_date: str) -> Tuple[pd.DataFrame, int]:
    """
    Append only rows whose (date, account) are not already in stored_df,
    and whose date is >= min_date.
    """
    min_ts = pd.Timestamp(min_date)

    # Ensure datetime index
    if not isinstance(stored_df.index, pd.DatetimeIndex):
        stored_df = stored_df.copy()
        stored_df.index = pd.to_datetime(stored_df.index)

    if not isinstance(new_df.index, pd.DatetimeIndex):
        new_df = new_df.copy()
        new_df.index = pd.to_datetime(new_df.index)

    # Filter new data to min_date+
    new_df = new_df.loc[new_df.index >= min_ts].copy()
    if new_df.empty:
        out = stored_df.loc[stored_df.index >= min_ts].copy()
        out = out.sort_values(["account"]).sort_index()
        return out, 0

    # Keys by (date, account)
    stored_keys = stored_df.reset_index()[["date", "account"]]
    new_reset = new_df.reset_index()

    flagged = new_reset.merge(
        stored_keys.assign(_in_stored=True),
        on=["date", "account"],
        how="left",
    )

    to_add = flagged[flagged["_in_stored"].isna()].drop(columns=["_in_stored"])
    num_added = len(to_add)

    combined = pd.concat([stored_df.reset_index(), to_add], ignore_index=True)
    combined = combined.drop_duplicates(subset=["date", "account"], keep="first")
    combined = combined.sort_values(["account", "date"]).set_index("date")

    # Enforce cutoff
    combined = combined.loc[combined.index >= min_ts]
    combined.index.name = "date"
    combined = combined[COLUMNS]

    return combined, num_added


def build_equity_index_with_baseline(twr_dec: pd.Series, baseline_equity: float = 100000.0) -> pd.Series:
    """Add a baseline day with 0 return so curve starts at baseline_equity."""
    twr_dec = twr_dec.sort_index()
    first_date = twr_dec.index[0]
    baseline_date = first_date - pd.Timedelta(days=1)

    twr2 = pd.concat([pd.Series([0.0], index=[baseline_date]), twr_dec])
    eq = baseline_equity * (1.0 + twr2).cumprod()
    return eq


def fetch_sp500_data(start_date: str, end_date: str, baseline_equity: float = 100000.0) -> pd.DataFrame:
    """Fetch S&P 500 (SPY) data using Polygon.io API and calculate equity curve."""
    if not HAS_STOCKS:
        return pd.DataFrame()

    # Add buffer days to ensure we have data for start date
    start_dt = pd.Timestamp(start_date) - pd.Timedelta(days=5)

    try:
        stocks = Stocks()
        spy_raw = stocks.ohlc("SPY", start=start_dt.strftime("%Y-%m-%d"), end=end_date)
    except Exception as e:
        print(f"Warning: Could not fetch SPY data from Polygon.io: {e}")
        return pd.DataFrame()

    if spy_raw.empty:
        print("Warning: Could not fetch SPY data")
        return pd.DataFrame()

    spy = spy_raw[["date", "close"]].copy()
    spy = spy.set_index("date")
    spy.index = pd.to_datetime(spy.index)

    # Calculate daily returns
    spy["daily_return"] = spy["close"].pct_change()

    # Filter to strategy period (start_date onwards)
    start_ts = pd.Timestamp(start_date)
    spy = spy[spy.index >= start_ts].copy()

    if spy.empty:
        print("Warning: No SPY data for the strategy period")
        return pd.DataFrame()

    # Build equity curve starting at baseline
    spy["daily_return"] = spy["daily_return"].fillna(0)

    # Add baseline day before first day
    first_date = spy.index[0]
    baseline_date = first_date - pd.Timedelta(days=1)
    baseline_row = pd.DataFrame({"close": [0], "daily_return": [0]}, index=[baseline_date])
    spy = pd.concat([baseline_row, spy])

    spy["equity_index"] = baseline_equity * (1 + spy["daily_return"]).cumprod()

    return spy


def calculate_sp500_metrics(spy_df: pd.DataFrame) -> dict:
    """Calculate S&P 500 benchmark metrics."""
    if spy_df.empty:
        return {
            "sp500_cumulative_return": None,
            "sp500_cagr": None,
            "sp500_max_drawdown": None,
        }

    # Filter out the baseline day for calculations
    spy = spy_df[spy_df["daily_return"] != 0].copy() if len(spy_df) > 1 else spy_df.copy()

    if spy.empty or len(spy) < 2:
        return {
            "sp500_cumulative_return": None,
            "sp500_cagr": None,
            "sp500_max_drawdown": None,
        }

    # Cumulative return
    cum_return = (1 + spy["daily_return"]).prod() - 1

    # CAGR
    start_ts = spy.index.min()
    end_ts = spy.index.max()
    n_days = max((end_ts - start_ts).days, 1)
    cagr = (1 + cum_return) ** (365.25 / n_days) - 1

    # Max drawdown
    eq = spy_df["equity_index"].dropna()
    max_dd = (eq / eq.cummax() - 1).min()

    return {
        "sp500_cumulative_return": float(cum_return),
        "sp500_cagr": float(cagr),
        "sp500_max_drawdown": float(max_dd),
    }


def plot_equity_curve(df: pd.DataFrame, save_path: Path, spy_df: pd.DataFrame = None) -> None:
    """Generate institutional-style equity curve chart with optional S&P 500 comparison."""
    d = df[["equity_index"]].dropna().copy()
    d = d.sort_index()

    # Calculate drawdown
    rolling_max = d["equity_index"].cummax()

    fig, ax = plt.subplots(figsize=(12.5, 5.6))
    fig.patch.set_facecolor("white")
    ax.set_facecolor("white")

    # Strategy drawdown shading
    ax.fill_between(
        d.index,
        d["equity_index"],
        rolling_max,
        where=d["equity_index"] < rolling_max,
        alpha=0.08,
        color="#3b82f6"  # Blue for strategy
    )

    # S&P 500 line (gray, no shading)
    if spy_df is not None and not spy_df.empty:
        spy_plot = spy_df[["equity_index"]].dropna().copy()
        spy_plot = spy_plot.sort_index()
        ax.plot(spy_plot.index, spy_plot["equity_index"], linewidth=1.8, color="#9ca3af",
                linestyle="-", label="S&P 500", alpha=0.8)

    # Strategy line (on top)
    ax.plot(d.index, d["equity_index"], linewidth=2.4, color="#3b82f6", label="Strategy")

    # Legend
    if spy_df is not None and not spy_df.empty:
        ax.legend(loc="upper left", fontsize=9, framealpha=0.9)

    # Title
    fig.text(
        0.06, 0.96,
        "Time-Weighted Returns \u2022 $100,000 Baseline",
        ha="left",
        va="top",
        fontsize=14,
        alpha=0.7
    )

    # Y-axis formatting
    ax.yaxis.set_major_formatter(FuncFormatter(lambda x, _: f"${x:,.0f}"))
    ax.set_ylabel("Equity", fontsize=10)

    # Grid
    ax.grid(axis="y", linestyle="-", linewidth=0.6, alpha=0.18)
    ax.grid(axis="x", visible=False)

    # Clean spines
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_alpha(0.25)
    ax.spines["bottom"].set_alpha(0.25)

    ax.tick_params(axis="both", labelsize=9)

    # Date formatting
    locator = mdates.AutoDateLocator(minticks=4, maxticks=8)
    formatter = mdates.ConciseDateFormatter(locator)
    ax.xaxis.set_major_locator(locator)
    ax.xaxis.set_major_formatter(formatter)

    # Footnote
    start_dt = d.index.min().strftime("%Y-%m-%d")
    end_dt = d.index.max().strftime("%Y-%m-%d")

    ax.text(
        1.0, -0.16,
        f"Period: {start_dt} to {end_dt} \u2022 Source: IBKR Daily P&L",
        transform=ax.transAxes,
        ha="right",
        va="top",
        fontsize=8.5,
        alpha=0.7
    )

    plt.tight_layout(rect=[0, 0.06, 1, 0.90])
    plt.savefig(save_path, dpi=350, bbox_inches="tight")
    plt.close(fig)


def upload_equity_curve(image_path: Path, supabase: Client) -> str:
    """Upload equity curve image to Supabase Storage."""
    if not image_path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    with open(image_path, "rb") as f:
        image_bytes = f.read()

    bucket_name = "regime-assets"
    file_name = "equity_curve.png"

    try:
        supabase.storage.from_(bucket_name).upload(
            file_name,
            image_bytes,
            file_options={"content-type": "image/png", "upsert": "true"}
        )
    except Exception as e:
        if "already exists" in str(e).lower() or "duplicate" in str(e).lower():
            supabase.storage.from_(bucket_name).update(
                file_name,
                image_bytes,
                file_options={"content-type": "image/png"}
            )
        else:
            raise

    public_url = supabase.storage.from_(bucket_name).get_public_url(file_name)
    print(f"Uploaded equity curve to: {public_url}")
    return public_url


def calculate_and_upload_track_record(combined_df: pd.DataFrame, supabase: Client) -> dict:
    """Calculate all metrics and upload to Supabase."""
    df = combined_df.copy().sort_index()
    df["twr_dec"] = df["twr"] / 100.0

    # Equity curve
    df["equity_index"] = build_equity_index_with_baseline(df["twr_dec"], baseline_equity=100000.0)

    start_ts = df.index.min()
    end_ts = df.index.max()

    length_days = int((end_ts - start_ts).days)
    length_years = length_days / 365.25

    cum_return = (1 + df["twr_dec"]).prod() - 1
    n_days = max(length_days, 1)
    cagr = (1 + cum_return) ** (365.25 / n_days) - 1

    eq = df["equity_index"]
    max_dd = (eq / eq.cummax() - 1).min()

    daily = df["twr_dec"].dropna()
    daily_std = float(daily.std(ddof=0))
    sharpe = None
    if daily_std > 0:
        sharpe = float(np.sqrt(252) * (float(daily.mean()) / daily_std))

    monthly = (1 + df["twr_dec"]).resample("ME").prod() - 1
    avg_month = float(monthly.mean()) if len(monthly) else None
    best_month = float(monthly.max()) if len(monthly) else None
    worst_month = float(monthly.min()) if len(monthly) else None
    best_month_label = monthly.idxmax().strftime("%Y-%m") if len(monthly) else None
    worst_month_label = monthly.idxmin().strftime("%Y-%m") if len(monthly) else None
    up_month_pct = float((monthly > 0).mean()) if len(monthly) else None

    # Build monthly returns structure
    monthly_df = monthly.to_frame("ret")
    monthly_df["Year"] = monthly_df.index.year
    monthly_df["Month"] = monthly_df.index.month

    pivot = monthly_df.pivot(index="Year", columns="Month", values="ret").reindex(columns=range(1, 13))
    ytd = (1 + df["twr_dec"]).groupby(df.index.year).prod() - 1
    pivot["YTD"] = ytd

    cols = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "YTD"]

    rows = []
    for year, row in pivot.iterrows():
        r = {"Year": int(year)}
        for month_num, col in enumerate(cols[:12], start=1):
            val = row.get(month_num)
            r[col] = None if pd.isna(val) else float(val)
        r["YTD"] = None if pd.isna(row.get("YTD")) else float(row.get("YTD"))
        rows.append(r)

    monthly_returns = {"columns": cols, "rows": rows}

    # Fetch S&P 500 data for the same period
    print("Fetching S&P 500 benchmark data...")
    spy_df = fetch_sp500_data(str(start_ts.date()), str(end_ts.date()), baseline_equity=100000.0)
    sp500_metrics = calculate_sp500_metrics(spy_df)

    # Calculate alpha (strategy excess return over S&P 500)
    alpha = None
    if sp500_metrics["sp500_cumulative_return"] is not None:
        alpha = float(cum_return) - sp500_metrics["sp500_cumulative_return"]
        print(f"  S&P 500 Cumulative Return: {sp500_metrics['sp500_cumulative_return']*100:.2f}%")
        print(f"  Alpha vs S&P 500: {alpha*100:.2f}%")

    # Generate and upload equity curve (with S&P 500 line)
    equity_curve_path = DATA_DIR / "equity_curve.png"
    plot_equity_curve(df, equity_curve_path, spy_df=spy_df)
    equity_curve_url = upload_equity_curve(equity_curve_path, supabase)

    # Convert daily history to JSON-serializable format
    history_df = combined_df.reset_index()
    history_df["date"] = history_df["date"].dt.strftime("%Y-%m-%d")
    daily_history = history_df.to_dict(orient="records")

    # Build update data
    data = {
        "start_date": str(start_ts.date()),
        "data_through": str(end_ts.date()),
        "strategy_length_days": length_days,
        "strategy_length_years": round(length_years, 2),
        "cumulative_return": float(cum_return),
        "cagr": float(cagr),
        "max_drawdown": float(max_dd),
        "sharpe_ratio": sharpe,
        "avg_monthly_return": avg_month,
        "best_month_return": best_month,
        "best_month_label": best_month_label,
        "worst_month_return": worst_month,
        "worst_month_label": worst_month_label,
        "up_months_pct": up_month_pct,
        "monthly_returns": monthly_returns,
        "daily_history": daily_history,
        "equity_curve_url": equity_curve_url,
        "sp500_cumulative_return": sp500_metrics["sp500_cumulative_return"],
        "sp500_cagr": sp500_metrics["sp500_cagr"],
        "sp500_max_drawdown": sp500_metrics["sp500_max_drawdown"],
        "alpha_vs_sp500": alpha,
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }

    # Check if row exists
    existing = supabase.table("track_record").select("id").limit(1).execute()

    if existing.data:
        result = supabase.table("track_record").update(data).eq("id", existing.data[0]["id"]).execute()
    else:
        result = supabase.table("track_record").insert(data).execute()

    print(f"Updated track record: {length_days} days, {cum_return*100:.2f}% cumulative return")
    return result.data[0] if result.data else data


def update_track_record():
    """Main function to update track record."""
    print("=" * 50)
    print("Track Record Update")
    print(f"Started at: {datetime.now()}")
    print("=" * 50)

    supabase = get_supabase_client()

    # Download and decrypt IBKR file
    decrypted_file = download_and_decrypt_ibkr()

    # Read new data
    new_df = read_ftp_csv(decrypted_file)
    print(f"New data: {len(new_df)} rows, {new_df.index.min().date()} to {new_df.index.max().date()}")

    # Fetch stored history from Supabase
    stored_df = fetch_stored_history(supabase)
    print(f"Stored history: {len(stored_df)} rows")

    # Merge
    combined_df, added = merge_append_new(stored_df, new_df, min_date=MIN_DATE)
    print(f"Rows added: {added}")
    print(f"Combined date range: {combined_df.index.min().date()} -> {combined_df.index.max().date()}")

    # Safety check
    if combined_df.index.min() < pd.Timestamp(MIN_DATE):
        raise RuntimeError(
            f"Safety brake: combined_df starts at {combined_df.index.min().date()} earlier than MIN_DATE={MIN_DATE}."
        )

    # Calculate metrics and upload
    calculate_and_upload_track_record(combined_df, supabase)

    # Clean up temp files
    decrypted_file.unlink(missing_ok=True)

    print("=" * 50)
    print("Track Record Update Complete!")
    print("=" * 50)


if __name__ == "__main__":
    update_track_record()
