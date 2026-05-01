"""
Fetch and examine IBKR trades file to understand format.

This is a one-time exploration script.
"""

import os
import ftplib
import subprocess
import time
from pathlib import Path
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

HOSTNAME = "ftp2.interactivebrokers.com"
DATA_DIR = Path("/tmp/trades_sample")
DATA_DIR.mkdir(parents=True, exist_ok=True)


def get_trades_file():
    """Download and decrypt the trades file."""
    user = os.environ.get("IBKR_FTP_USER")
    passwd = os.environ.get("IBKR_FTP_PASS")

    if not user or not passwd:
        raise ValueError("Missing IBKR credentials")

    print("Connecting to IBKR FTP...")
    ftp = ftplib.FTP(HOSTNAME, user, passwd)
    ftp.encoding = "utf-8"

    # List all files
    files = ftp.nlst("outgoing")

    # Find the trades file
    trades_file = None
    for f in files:
        if "Trailing_1-Year_Trades" in f:
            trades_file = f
            print(f"Found trades file: {f}")
            break

    if not trades_file:
        raise RuntimeError("No trades file found")

    encrypted_file = DATA_DIR / "trades.csv.pgp"
    decrypted_file = DATA_DIR / "trades.csv"

    # Download
    with open(encrypted_file, "wb") as f:
        ftp.retrbinary(f"RETR {trades_file}", f.write)

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
        raise RuntimeError(f"Decrypt failed: {result.stderr}")

    encrypted_file.unlink(missing_ok=True)
    print(f"Decrypted to: {decrypted_file}")

    # Show first 30 lines
    print("\n" + "="*60)
    print("FIRST 30 LINES OF TRADES FILE:")
    print("="*60)
    with open(decrypted_file, "r") as f:
        for i, line in enumerate(f, 1):
            if i <= 30:
                print(f"{i:3d}: {line.rstrip()}")
            else:
                break

    print("\n" + "="*60)
    print(f"Full file saved at: {decrypted_file}")
    print("="*60)

    return decrypted_file


if __name__ == "__main__":
    get_trades_file()
