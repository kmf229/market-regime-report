"""
Update Track Record - Mac Version

Run this from your Jupyter notebook or command line on Monday mornings.
Downloads IBKR data, decrypts it, calculates metrics, and uploads to Supabase.
No commit/push needed - website updates automatically.

Usage (from your main Substack directory):
    python website/scripts/update_track_record_mac.py

Or from Jupyter notebook:
    %run website/scripts/update_track_record_mac.py
"""

from __future__ import annotations

import os
import ftplib
import time
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Tuple

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.ticker import FuncFormatter

try:
    from supabase import create_client, Client
except ImportError:
    print("Please install supabase: pip install supabase")
    raise

from dotenv import load_dotenv

# Load environment variables from .env.local
env_local = Path(__file__).parent.parent / ".env.local"
if env_local.exists():
    load_dotenv(env_local)
else:
    load_dotenv()  # Try default .env

# =====================================================
# CONFIG - Same as your notebook
# =====================================================

MIN_DATE = "2025-11-14"  # Strategy start date

HOSTNAME = "ftp2.interactivebrokers.com"
USERNAME = os.environ['IBKR_FTP_USER']
PASSWORD = os.environ['IBKR_FTP_PASS']

# Paths - assumes running from Substack directory
BASE_DIR = Path(__file__).parent.parent.parent  # Goes up to Substack/
DATA_DIR = BASE_DIR / "track_record"
STORED_PATH = DATA_DIR / "daily_pnl_history.csv"

DATA_DIR.mkdir(parents=True, exist_ok=True)

# Schema
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
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")

    if not url or not key:
        raise ValueError(
            "Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and "
            "SUPABASE_SERVICE_KEY are set in .env.local"
        )

    return create_client(url, key)


def get_latest_ibkr_file(files: list) -> str:
    """Choose the most recent IBKR 'Daily_P_L' file."""
    file_name = "Daily_P_L"
    candidates = sorted([f for f in files if file_name in f])
    if not candidates:
        raise RuntimeError("No 'Daily_P_L' files found in IBKR outgoing folder.")
    return candidates[-1]


def read_pnl_csv(path: Path) -> pd.DataFrame:
    """Read stored daily_pnl_history.csv."""
    df = pd.read_csv(path)

    if "date" not in df.columns:
        df = df.rename(columns={df.columns[0]: "date"})

    df["date"] = pd.to_datetime(df["date"], errors="raise")
    df = df.set_index("date")

    df = df[COLUMNS].copy()
    for col, dtype in DTYPE_MAP.items():
        df[col] = df[col].astype(dtype, copy=False)

    return df


def read_ftp_csv(path: Path) -> pd.DataFrame:
    """Read IBKR decrypted CSV (no header)."""
    df = pd.read_csv(path, names=["account", "date", "start_equity", "flows", "end_equity", "twr"])
    df["date"] = pd.to_datetime(df["date"], format="%Y%m%d", errors="raise")
    df = df.sort_values("date").set_index("date")

    df = df[COLUMNS].copy()
    for col, dtype in DTYPE_MAP.items():
        df[col] = df[col].astype(dtype, copy=False)

    return df


def merge_append_new(stored_df: pd.DataFrame, new_df: pd.DataFrame, min_date: str) -> Tuple[pd.DataFrame, int]:
    """Append only new rows."""
    min_ts = pd.Timestamp(min_date)

    if not isinstance(stored_df.index, pd.DatetimeIndex):
        stored_df = stored_df.copy()
        stored_df.index = pd.to_datetime(stored_df.index)

    if not isinstance(new_df.index, pd.DatetimeIndex):
        new_df = new_df.copy()
        new_df.index = pd.to_datetime(new_df.index)

    new_df = new_df.loc[new_df.index >= min_ts].copy()
    if new_df.empty:
        out = stored_df.loc[stored_df.index >= min_ts].copy()
        out = out.sort_values(["account"]).sort_index()
        return out, 0

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

    combined = combined.loc[combined.index >= min_ts]
    combined.index.name = "date"
    combined = combined[COLUMNS]

    return combined, num_added


def build_equity_index_with_baseline(twr_dec: pd.Series, baseline_equity: float = 100000.0) -> pd.Series:
    """Add baseline day so curve starts at baseline_equity."""
    twr_dec = twr_dec.sort_index()
    first_date = twr_dec.index[0]
    baseline_date = first_date - pd.Timedelta(days=1)

    twr2 = pd.concat([pd.Series([0.0], index=[baseline_date]), twr_dec])
    eq = baseline_equity * (1.0 + twr2).cumprod()
    return eq


def plot_equity_curve(df: pd.DataFrame, save_path: Path) -> None:
    """Generate institutional-style equity curve chart."""
    d = df[["equity_index"]].dropna().copy()
    d = d.sort_index()

    rolling_max = d["equity_index"].cummax()

    fig, ax = plt.subplots(figsize=(12.5, 5.6))
    fig.patch.set_facecolor("white")
    ax.set_facecolor("white")

    ax.fill_between(
        d.index,
        d["equity_index"],
        rolling_max,
        where=d["equity_index"] < rolling_max,
        alpha=0.08
    )

    ax.plot(d.index, d["equity_index"], linewidth=2.4)

    fig.text(
        0.06, 0.96,
        "Time-Weighted Returns \u2022 $100,000 Baseline",
        ha="left", va="top", fontsize=14, alpha=0.7
    )

    ax.yaxis.set_major_formatter(FuncFormatter(lambda x, _: f"${x:,.0f}"))
    ax.set_ylabel("Equity", fontsize=10)

    ax.grid(axis="y", linestyle="-", linewidth=0.6, alpha=0.18)
    ax.grid(axis="x", visible=False)

    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_alpha(0.25)
    ax.spines["bottom"].set_alpha(0.25)

    ax.tick_params(axis="both", labelsize=9)

    locator = mdates.AutoDateLocator(minticks=4, maxticks=8)
    formatter = mdates.ConciseDateFormatter(locator)
    ax.xaxis.set_major_locator(locator)
    ax.xaxis.set_major_formatter(formatter)

    start_dt = d.index.min().strftime("%Y-%m-%d")
    end_dt = d.index.max().strftime("%Y-%m-%d")

    ax.text(
        1.0, -0.16,
        f"Period: {start_dt} to {end_dt} \u2022 Source: IBKR Daily P&L",
        transform=ax.transAxes, ha="right", va="top", fontsize=8.5, alpha=0.7
    )

    plt.tight_layout(rect=[0, 0.06, 1, 0.90])
    plt.savefig(save_path, dpi=350, bbox_inches="tight")
    plt.close(fig)


def upload_equity_curve(image_path: Path, supabase: Client) -> str:
    """Upload equity curve image to Supabase Storage."""
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


def upload_to_supabase(df: pd.DataFrame, supabase: Client) -> dict:
    """Calculate all metrics and upload to Supabase."""
    df = df.copy().sort_index()
    df["twr_dec"] = df["twr"] / 100.0

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

    monthly = (1 + df["twr_dec"]).resample("M").prod() - 1
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

    # Generate and upload equity curve
    equity_curve_path = DATA_DIR / "equity_curve_temp.png"
    plot_equity_curve(df, equity_curve_path)
    equity_curve_url = upload_equity_curve(equity_curve_path, supabase)
    equity_curve_path.unlink(missing_ok=True)  # Clean up temp file

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
        "daily_history": [],  # Not storing full history in Supabase to save space
        "equity_curve_url": equity_curve_url,
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }

    # Check if row exists
    existing = supabase.table("track_record").select("id").limit(1).execute()

    if existing.data:
        result = supabase.table("track_record").update(data).eq("id", existing.data[0]["id"]).execute()
    else:
        result = supabase.table("track_record").insert(data).execute()

    print(f"\nUploaded to Supabase:")
    print(f"  Cumulative Return: {cum_return*100:.2f}%")
    print(f"  CAGR: {cagr*100:.2f}%")
    print(f"  Sharpe: {sharpe:.2f}" if sharpe else "  Sharpe: N/A")
    print(f"  Max Drawdown: {max_dd*100:.2f}%")

    return result.data[0] if result.data else data


def main():
    print("=" * 50)
    print("Track Record Update")
    print(f"Started at: {datetime.now()}")
    print("=" * 50)

    # Step 1: Download from IBKR FTP
    print("\nConnecting to IBKR FTP...")
    ftp = ftplib.FTP(HOSTNAME, USERNAME, PASSWORD)
    ftp.encoding = "utf-8"

    files = ftp.nlst("outgoing")
    latest_file = get_latest_ibkr_file(files)
    print(f"Latest IBKR file: {latest_file}")

    encrypted_file = DATA_DIR / "latest.csv.pgp"
    decrypted_file = DATA_DIR / "latest.csv"

    with open(encrypted_file, "wb") as f:
        ftp.retrbinary(f"RETR {latest_file}", f.write)

    ftp.quit()
    print(f"Downloaded encrypted file")

    # Step 2: Decrypt with GPG
    print("Decrypting via gpg...")
    cmd = f"gpg --output {decrypted_file} --decrypt {encrypted_file}"
    rc = os.system(cmd)
    time.sleep(1)

    if rc != 0 or not decrypted_file.exists():
        raise RuntimeError("GPG decrypt failed.")

    encrypted_file.unlink(missing_ok=True)
    print(f"Decrypted successfully")

    # Step 3: Load and merge data
    if STORED_PATH.exists():
        stored_df = read_pnl_csv(STORED_PATH)
    else:
        stored_df = pd.DataFrame(columns=COLUMNS).astype(DTYPE_MAP)
        stored_df.index = pd.to_datetime(stored_df.index)
        stored_df.index.name = "date"

    new_df = read_ftp_csv(decrypted_file)
    combined_df, added = merge_append_new(stored_df, new_df, min_date=MIN_DATE)

    print(f"\nRows added: {added}")
    print(f"Date range: {combined_df.index.min().date()} -> {combined_df.index.max().date()}")

    # Safety check
    if combined_df.index.min() < pd.Timestamp(MIN_DATE):
        raise RuntimeError(f"Data starts before MIN_DATE={MIN_DATE}")

    # Step 4: Backup and save local CSV
    if STORED_PATH.exists():
        ts = time.strftime("%Y%m%d-%H%M%S")
        backup_path = STORED_PATH.with_name(f"{STORED_PATH.stem}.backup_{ts}.csv")
        shutil.copy2(STORED_PATH, backup_path)
        print(f"Backup created: {backup_path.name}")

    combined_df.to_csv(STORED_PATH, index=True, index_label="date")
    print(f"Saved local CSV: {STORED_PATH}")

    decrypted_file.unlink(missing_ok=True)

    # Step 5: Upload to Supabase
    print("\nUploading to Supabase...")
    supabase = get_supabase_client()
    upload_to_supabase(combined_df, supabase)

    print("\n" + "=" * 50)
    print("DONE! Website will update within 60 seconds.")
    print("=" * 50)


if __name__ == "__main__":
    main()
