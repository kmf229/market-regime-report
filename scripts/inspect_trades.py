#!/usr/bin/env python3
"""
Download and inspect the trades file to see all available columns.
"""

import os
import ftplib
import subprocess
import time
from pathlib import Path
import pandas as pd
from dotenv import load_dotenv

# Load environment variables
env_local = Path(__file__).parent.parent / ".env.local"
if env_local.exists():
    load_dotenv(env_local)

HOSTNAME = "ftp2.interactivebrokers.com"
DATA_DIR = Path("/tmp/track_record")
DATA_DIR.mkdir(parents=True, exist_ok=True)

def download_and_decrypt_trades():
    user = os.environ.get("IBKR_FTP_USER")
    passwd = os.environ.get("IBKR_FTP_PASS")

    if not user or not passwd:
        raise ValueError("Missing IBKR_FTP_USER or IBKR_FTP_PASS")

    print(f"Connecting to {HOSTNAME}...")
    ftp = ftplib.FTP(HOSTNAME, user, passwd)
    ftp.encoding = "utf-8"

    # Get all trades files and find the latest
    files = ftp.nlst("outgoing")
    trades_files = sorted([f for f in files if "Trailing_1-Year_Trades" in f])

    if not trades_files:
        raise RuntimeError("No Trailing_1-Year_Trades files found")

    latest_file = trades_files[-1]
    print(f"Latest trades file: {latest_file}")

    encrypted_file = DATA_DIR / "trades.csv.pgp"
    decrypted_file = DATA_DIR / "trades.csv"

    # Download
    with open(encrypted_file, "wb") as f:
        ftp.retrbinary(f"RETR {latest_file}", f.write)

    ftp.quit()
    print(f"Downloaded to: {encrypted_file}")

    # Decrypt
    print("Decrypting...")
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

    print(f"Decrypted to: {decrypted_file}")

    # Parse
    print("\n" + "=" * 80)
    print("PARSING TRADES FILE:")
    print("=" * 80)

    # Read CSV, skip first 4 rows (BOF, BOA, BOS, HEADER)
    df = pd.read_csv(decrypted_file, skiprows=4, header=None, low_memory=False)

    # Column names from the script
    columns = [
        "RecordType", "SectionID", "ClientAccountID", "AccountAlias", "Model",
        "CurrencyPrimary", "FXRateToBase", "AssetClass", "Symbol", "Description",
        "Conid", "SecurityID", "SecurityIDType", "CUSIP", "ISIN", "ListingExchange",
        "UnderlyingConid", "UnderlyingSymbol", "UnderlyingSecurityID", "UnderlyingListingExchange",
        "Issuer", "Multiplier", "Strike", "Expiry", "TradeID", "PutCall", "RelatedTradeID",
        "PrincipalAdjustFactor", "ReportDate", "DateTime", "TradeDate", "SettleDateTarget",
        "TransactionType", "Exchange", "Quantity", "TradePrice", "TradeMoney", "Proceeds",
        "Taxes", "IBCommission", "IBCommissionCurrency", "NetCash", "ClosePrice",
        "OpenCloseIndicator", "NotesCodes", "CostBasis", "FifoPnlRealized", "FxPnl",
        "MtmPnl", "OrigTradePrice", "OrigTradeDate", "OrigTradeID", "OrigOrderID",
        "OrigTransactionID", "BuySell", "ClearingFirmID", "IBOrderID", "TransactionID",
        "IBExecID", "RelatedTransactionID", "BrokerageOrderID", "OrderReference",
        "VolatilityOrderLink", "ExchOrderID", "ExtExecID", "OrderTime", "OpenDateTime",
        "HoldingPeriodDateTime", "WhenRealized", "WhenReopened", "LevelOfDetail",
        "ChangeInPrice", "ChangeInQuantity", "OrderType", "TraderID", "IsAPIOrder",
        "AccruedInterest", "SerialNumber", "DeliveryType", "CommodityType", "Fineness", "Weight"
    ]

    df.columns = columns

    # Filter for strategy symbols
    strategy_symbols = ["NQ", "MNQ", "GC", "MGC", "1OZ"]
    df = df[df["Symbol"].str.contains("|".join(strategy_symbols), na=False)].copy()

    # Convert TradeDate
    df["TradeDate"] = pd.to_datetime(df["TradeDate"].str.split(";").str[0])

    # Filter recent trades (last 30 days)
    df = df[df["TradeDate"] >= "2026-04-01"].copy()

    # Show key columns
    key_cols = ["TradeDate", "Symbol", "Quantity", "TradePrice", "ClosePrice",
                "FifoPnlRealized", "MtmPnl", "CostBasis", "BuySell"]

    print("\nRecent strategy trades:")
    print(df[key_cols].to_string())

    # Check for open positions
    print("\n" + "=" * 80)
    print("LOOKING FOR OPEN POSITION DATA:")
    print("=" * 80)

    # Look for the most recent BUY trade
    buys = df[df["Quantity"].astype(float) > 0].copy()
    if not buys.empty:
        latest_buy = buys.iloc[-1]
        print(f"\nLatest BUY trade:")
        print(f"  Date: {latest_buy['TradeDate']}")
        print(f"  Symbol: {latest_buy['Symbol']}")
        print(f"  Quantity: {latest_buy['Quantity']}")
        print(f"  Entry Price: {latest_buy['TradePrice']}")
        print(f"  Current Price (ClosePrice): {latest_buy['ClosePrice']}")
        print(f"  Cost Basis: {latest_buy['CostBasis']}")
        print(f"  MtmPnl (Mark-to-Market P&L): {latest_buy['MtmPnl']}")
        print(f"  FifoPnlRealized: {latest_buy['FifoPnlRealized']}")

        # Calculate return based on MtmPnl and CostBasis
        try:
            mtm_pnl = float(latest_buy['MtmPnl'])
            cost_basis = float(latest_buy['CostBasis'])
            if cost_basis != 0:
                return_pct = (mtm_pnl / abs(cost_basis)) * 100
                print(f"\n  >>> MtmPnl / CostBasis = {return_pct:.2f}%")
        except:
            pass

    return decrypted_file

if __name__ == "__main__":
    download_and_decrypt_trades()
