"""
Test if the Anthropic API key is valid and check available models.
"""

import os
from dotenv import load_dotenv
load_dotenv()

from anthropic import Anthropic

api_key = os.getenv("ANTHROPIC_API_KEY")

if not api_key:
    print("✗ No ANTHROPIC_API_KEY found in environment")
    exit(1)

print(f"API Key found: {api_key[:20]}...{api_key[-4:]}")
print()

client = Anthropic(api_key=api_key)

# Try to list available models or make a simple request
# Test with the newest model names
newer_models = [
    "claude-sonnet-4-20250514",  # This is what generate_blurb.py uses successfully
    "claude-3-5-sonnet-20241022",
    "claude-3-5-sonnet-latest",
    "claude-3-opus-latest",
    "claude-3-sonnet-latest",
    "claude-3-haiku-latest",
]

print("Testing newer model names...\n")

for model in newer_models:
    try:
        response = client.messages.create(
            model=model,
            max_tokens=10,
            messages=[{"role": "user", "content": "Hi"}]
        )
        print(f"✓ {model} WORKS!")
        print(f"  Response: {response.content[0].text}")
        break
    except Exception as e:
        error_msg = str(e).split('\n')[0]
        print(f"✗ {model}: {error_msg[:80]}")

print("\n" + "="*60)
print("If all models failed, your API key may:")
print("1. Be invalid or expired")
print("2. Not have access to the API (check console.anthropic.com)")
print("3. Need to be regenerated")
