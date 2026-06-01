#!/usr/bin/env python3
"""
List all files in IBKR FTP outgoing folder.
"""

import os
import ftplib
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_local = Path(__file__).parent.parent / ".env.local"
if env_local.exists():
    load_dotenv(env_local)

HOSTNAME = "ftp2.interactivebrokers.com"

def list_ibkr_files():
    user = os.environ.get("IBKR_FTP_USER")
    passwd = os.environ.get("IBKR_FTP_PASS")

    if not user or not passwd:
        raise ValueError("Missing IBKR_FTP_USER or IBKR_FTP_PASS")

    print(f"Connecting to {HOSTNAME}...")
    ftp = ftplib.FTP(HOSTNAME, user, passwd)
    ftp.encoding = "utf-8"

    print("\nFiles in 'outgoing' folder:")
    print("-" * 80)

    files = ftp.nlst("outgoing")
    for f in sorted(files):
        # Get file size
        try:
            ftp.voidcmd("TYPE I")
            size = ftp.size(f)
            size_kb = size / 1024 if size else 0
            print(f"  {f:<60} ({size_kb:>8.1f} KB)")
        except:
            print(f"  {f}")

    print(f"\nTotal files: {len(files)}")

    # Group by file type
    print("\nFile types:")
    file_types = {}
    for f in files:
        # Extract file type from name
        parts = f.split('_')
        if len(parts) >= 2:
            # Get everything except the date part
            file_type = '_'.join([p for p in parts if not p.replace('-', '').replace('.', '').isdigit()])
            file_types[file_type] = file_types.get(file_type, 0) + 1

    for file_type, count in sorted(file_types.items()):
        print(f"  {file_type:<40} ({count} files)")

    ftp.quit()

if __name__ == "__main__":
    list_ibkr_files()
