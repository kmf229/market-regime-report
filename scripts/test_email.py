"""Test Resend email delivery."""
import os
from pathlib import Path

# Load environment
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

import resend

# Check API key
api_key = os.environ.get("RESEND_API_KEY")
print(f"API key set: {bool(api_key)}")
if api_key:
    print(f"Key prefix: {api_key[:10]}...")
else:
    print("ERROR: RESEND_API_KEY not found in .env")
    exit(1)

resend.api_key = api_key

# Get your email from Supabase
from supabase import create_client
supabase = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_SERVICE_KEY")
)
users = supabase.table("profiles").select("email").eq("regime_change_alerts", True).execute()
print(f"Users opted in: {users.data}")

if not users.data:
    print("No users opted in for alerts!")
    exit(1)

email = users.data[0]["email"]
print(f"Sending test to: {email}")

# Try to send
try:
    result = resend.Emails.send({
        "from": "Market Regime Report <alerts@marketregimes.com>",
        "to": email,
        "subject": "Test Email from Pi",
        "html": "<h1>Test</h1><p>If you see this, Resend is working!</p>",
    })
    print(f"Success! Result: {result}")
except Exception as e:
    print(f"FAILED: {type(e).__name__}: {e}")
