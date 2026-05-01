"""
Parse IBKR trades CSV and generate regime trades table.

This script:
1. Parses the trades CSV
2. Groups trades into "regime trades" (bullish vs bearish)
3. Handles futures rollovers as part of the same trade
4. Calculates P&L for each regime trade
5. 10x all quantities and P&L to mask account size
6. Generates table data for display on track record page
"""

import pandas as pd
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Tuple

# Strategy start date (exclude trades before this)
MIN_DATE = "2025-11-14"  # Day after Nov 13

# Starting equity (10x real account)
STARTING_EQUITY = 250000.0

# Multiplier for account masking
MULTIPLIER = 10

# Bullish symbols
BULLISH_SYMBOLS = ["TQQQ", "MNQ"]

# Bearish symbols
BEARISH_SYMBOLS = ["GLD", "MGC", "GC", "1OZ"]


def is_bullish(symbol: str) -> bool:
    """Check if symbol is bullish."""
    for s in BULLISH_SYMBOLS:
        if symbol.startswith(s):
            return True
    return False


def is_bearish(symbol: str) -> bool:
    """Check if symbol is bearish."""
    for s in BEARISH_SYMBOLS:
        if symbol.startswith(s):
            return True
    return False


def parse_trades_csv(csv_path: Path) -> pd.DataFrame:
    """Parse IBKR trades CSV and extract strategy trades."""

    # Read CSV, skip first 4 rows (BOF, BOA, BOS, HEADER)
    df = pd.read_csv(csv_path, skiprows=4, header=None)

    # Assign column names based on header (line 4)
    # Columns: 0=RecordType, 1=SectionID, 2=AccountID, ...
    # Symbol=8, TradeDate=30, Quantity=34, TradePrice=35, FifoPnlRealized=46, Buy/Sell=54
    df.columns = [
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

    # Filter for strategy symbols only
    strategy_symbols = BULLISH_SYMBOLS + BEARISH_SYMBOLS
    df = df[df["Symbol"].str.contains("|".join(strategy_symbols), na=False)].copy()

    # Convert TradeDate to datetime (handle both "2025-09-10" and "2025-09-10;160000" formats)
    df["TradeDate"] = pd.to_datetime(df["TradeDate"].str.split(";").str[0])

    # Filter for trades >= MIN_DATE
    df = df[df["TradeDate"] >= MIN_DATE].copy()

    # Convert numeric columns
    df["Quantity"] = pd.to_numeric(df["Quantity"])
    df["TradePrice"] = pd.to_numeric(df["TradePrice"])
    df["FifoPnlRealized"] = pd.to_numeric(df["FifoPnlRealized"])

    # Sort by date, and within same date, put SELLs before BUYs (so we close positions before opening new ones)
    df["IsBuy"] = df["Quantity"] > 0
    df = df.sort_values(["TradeDate", "IsBuy"]).reset_index(drop=True)

    return df[["TradeDate", "Symbol", "Quantity", "TradePrice", "FifoPnlRealized", "BuySell"]]


def extract_base_symbol(symbol: str) -> str:
    """Extract base symbol from futures contracts or ETFs."""
    # Futures: MNQ, MGC, 1OZ have contract codes like MNQH6, MGCG6, 1OZM6
    if symbol.startswith("M") or symbol.startswith("1"):
        return symbol[:3]
    # ETFs: TQQQ, GLD, etc. - return as-is
    return symbol


def group_regime_trades(df: pd.DataFrame) -> List[Dict]:
    """
    Group trades into regime trades.

    A regime trade = all trades in the same asset class (bullish or bearish)
    before switching to the opposite.

    Futures rollovers (sell expiring, buy new) are part of the same regime trade.
    """

    trades = []
    current_trade = None
    current_regime = None

    for idx, row in df.iterrows():
        symbol = row["Symbol"]
        date = row["TradeDate"]
        qty = row["Quantity"]
        price = row["TradePrice"]
        pnl = row["FifoPnlRealized"]
        is_buy = qty > 0

        regime = "Bullish" if is_bullish(symbol) else "Bearish"

        # Closing a position (SELL) - process first to accumulate P&L before regime switch
        if not is_buy:
            if current_trade is not None and current_trade["regime"] == regime:
                # This is closing the current regime position
                current_trade["pnl"] += pnl
                current_trade["date_out"] = date
                current_trade["exit_price"] = price
                # Update symbol to the exit symbol (in case of rollovers)
                current_trade["symbol"] = extract_base_symbol(symbol)

        # Opening a new position (BUY)
        if is_buy:
            # Check if this is a regime switch
            if current_regime != regime:
                # Close previous trade if exists
                if current_trade is not None:
                    current_trade["status"] = "Closed"
                    # Remove internal tracking fields
                    current_trade.pop("full_symbol", None)
                    trades.append(current_trade)

                # Start new regime trade
                current_regime = regime
                current_trade = {
                    "regime": regime,
                    "date_in": date,
                    "date_out": None,
                    "symbol": extract_base_symbol(symbol),
                    "full_symbol": symbol,  # Track full symbol for rollover detection
                    "contracts": abs(qty),
                    "entry_price": price,
                    "exit_price": None,
                    "pnl": 0,
                    "status": "Open"
                }
            else:
                # Check if this is a rollover to a different symbol
                if current_trade is not None:
                    # Compare full symbols to detect rollovers between different contract months
                    if symbol != current_trade.get("full_symbol", symbol):
                        # This is a rollover to a different contract (different expiry or symbol)
                        # Reset contracts
                        current_trade["contracts"] = abs(qty)
                        current_trade["full_symbol"] = symbol
                    else:
                        # Same exact symbol/contract, just adding to position
                        current_trade["contracts"] += abs(qty)
            # else: This is a rollover BUY within the same regime, just continue

    # Handle final open trade
    if current_trade is not None:
        if current_trade["date_out"] is None:
            current_trade["status"] = "Pending"
        else:
            current_trade["status"] = "Closed"
        # Remove internal tracking fields
        current_trade.pop("full_symbol", None)
        trades.append(current_trade)

    return trades


def calculate_equity_curve(trades: List[Dict]) -> List[Dict]:
    """Add running equity to each trade."""
    equity = STARTING_EQUITY

    for trade in trades:
        if trade["status"] == "Closed":
            # Apply 10x multiplier to P&L
            scaled_pnl = trade["pnl"] * MULTIPLIER
            equity += scaled_pnl
            trade["pnl_scaled"] = scaled_pnl
            trade["equity_after"] = equity
        else:
            # Pending trade
            trade["pnl_scaled"] = None
            trade["equity_after"] = None

    return trades


def format_trades_table(trades: List[Dict]) -> List[Dict]:
    """Format trades for display."""

    table = []

    for i, trade in enumerate(trades, 1):
        # Scale contracts by 10x
        contracts_scaled = int(trade["contracts"] * MULTIPLIER)

        row = {
            "trade_number": i,
            "regime": trade["regime"],
            "date_in": trade["date_in"].strftime("%Y-%m-%d"),
            "date_out": trade["date_out"].strftime("%Y-%m-%d") if trade["date_out"] else "—",
            "symbol": trade["symbol"],
            "contracts": contracts_scaled,
            "entry_price": f"${trade['entry_price']:,.2f}",
            "exit_price": f"${trade['exit_price']:,.2f}" if trade["exit_price"] else "—",
            "pnl": f"${trade['pnl_scaled']:,.2f}" if trade["pnl_scaled"] is not None else "Pending",
            "equity": f"${trade['equity_after']:,.2f}" if trade["equity_after"] else "—",
            "status": trade["status"]
        }

        table.append(row)

    return table


def main():
    """Main function to parse trades and generate table."""

    # Path to decrypted CSV
    csv_path = Path("/Users/kmf229/Documents/Trading/Substack/website/trades.csv")

    if not csv_path.exists():
        print(f"Error: {csv_path} not found")
        print("Run decrypt_trades.py first!")
        return

    print("Parsing trades CSV...")
    df = parse_trades_csv(csv_path)

    print(f"Found {len(df)} strategy trades")
    print("\nRaw trades:")
    print(df.to_string())

    print("\n" + "="*80)
    print("Grouping into regime trades...")
    trades = group_regime_trades(df)

    print(f"Found {len(trades)} regime trades")

    print("\n" + "="*80)
    print("Calculating equity curve...")
    trades = calculate_equity_curve(trades)

    print("\n" + "="*80)
    print("Formatting trades table...")
    table = format_trades_table(trades)

    print("\n" + "="*80)
    print("TRADES TABLE (10x multiplier applied)")
    print("="*80)
    print(f"{'#':<4} {'Regime':<8} {'Entry':<12} {'Exit':<12} {'Symbol':<8} {'Contracts':<12} {'Entry $':<12} {'Exit $':<12} {'P&L':<15} {'Equity':<15} {'Status':<8}")
    print("-"*140)

    for row in table:
        print(f"{row['trade_number']:<4} {row['regime']:<8} {row['date_in']:<12} {row['date_out']:<12} "
              f"{row['symbol']:<8} {row['contracts']:<12} {row['entry_price']:<12} {row['exit_price']:<12} "
              f"{row['pnl']:<15} {row['equity']:<15} {row['status']:<8}")

    print("="*140)
    print(f"\nStarting Equity: ${STARTING_EQUITY:,.2f}")

    if table[-1]["equity"] != "—":
        final_equity = float(table[-1]["equity"].replace("$", "").replace(",", ""))
        total_return = ((final_equity - STARTING_EQUITY) / STARTING_EQUITY) * 100
        print(f"Current Equity: {table[-1]['equity']}")
        print(f"Total Return: {total_return:.2f}%")

    # Save as JSON for website
    import json
    output_path = Path("/Users/kmf229/Documents/Trading/Substack/website/public/trades_table.json")
    with open(output_path, "w") as f:
        json.dump(table, f, indent=2)

    print(f"\nSaved trades table to: {output_path}")


if __name__ == "__main__":
    main()
