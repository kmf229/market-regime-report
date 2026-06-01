#!/usr/bin/env python3
"""
Download and decrypt the latest MTD_TWR file to see what data it contains.
"""

import os
import ftplib
import subprocess
import time
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_local = Path(__file__).parent.parent / ".env.local"
if env_local.exists():
    load_dotenv(env_local)

HOSTNAME = "ftp2.interactivebrokers.com"
DATA_DIR = Path("/tmp/track_record")
DATA_DIR.mkdir(parents=True, exist_ok=True)

def download_and_decrypt_mtd_twr():
    user = os.environ.get("IBKR_FTP_USER")
    passwd = os.environ.get("IBKR_FTP_PASS")

    if not user or not passwd:
        raise ValueError("Missing IBKR_FTP_USER or IBKR_FTP_PASS")

    print(f"Connecting to {HOSTNAME}...")
    ftp = ftplib.FTP(HOSTNAME, user, passwd)
    ftp.encoding = "utf-8"

    # Get all MTD_TWR files and find the latest
    files = ftp.nlst("outgoing")
    mtd_files = sorted([f for f in files if "MTD_TWR" in f])

    if not mtd_files:
        raise RuntimeError("No MTD_TWR files found")

    latest_file = mtd_files[-1]
    print(f"Latest MTD_TWR file: {latest_file}")

    encrypted_file = DATA_DIR / "mtd_twr.csv.pgp"
    decrypted_file = DATA_DIR / "mtd_twr.csv"

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

    # Read and display contents
    print("\n" + "=" * 80)
    print("FILE CONTENTS:")
    print("=" * 80)

    with open(decrypted_file, 'r') as f:
        contents = f.read()
        print(contents)

    print("=" * 80)

    # Parse as CSV
    print("\nParsing as CSV:")
    import pandas as pd
    df = pd.read_csv(decrypted_file)
    print(df)

    return decrypted_file

if __name__ == "__main__":
    download_and_decrypt_mtd_twr()
