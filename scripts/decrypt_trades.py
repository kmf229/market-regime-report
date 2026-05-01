"""
Decrypt the trades file that's already downloaded.
"""

import subprocess
import time
from pathlib import Path

# Paths
encrypted_file = Path("/Users/kmf229/Documents/Trading/Substack/website/U3589081.Trailing_1-Year_Trades.20250501.20260430.csv.pgp")
decrypted_file = Path("/Users/kmf229/Documents/Trading/Substack/website/trades.csv")

print(f"Looking for: {encrypted_file}")

if not encrypted_file.exists():
    print(f"Error: File not found at {encrypted_file}")
    exit(1)

print("Decrypting...")
result = subprocess.run(
    ["gpg", "--yes", "--output", str(decrypted_file), "--decrypt", str(encrypted_file)],
    capture_output=True,
    text=True
)

time.sleep(1)

if result.returncode != 0 or not decrypted_file.exists():
    print(f"Decrypt failed: {result.stderr}")
    exit(1)

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
