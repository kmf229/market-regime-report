"""
Test which Claude models are available with your API key.
"""

import os
from dotenv import load_dotenv
load_dotenv()

from anthropic import Anthropic

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Try different model IDs
models_to_try = [
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
    "claude-3-5-sonnet-20240620",
    "claude-3-5-sonnet-20241022",
]

print("Testing Claude models with your API key...\n")

for model in models_to_try:
    try:
        response = client.messages.create(
            model=model,
            max_tokens=10,
            messages=[{"role": "user", "content": "test"}]
        )
        print(f"✓ {model} works!")
    except Exception as e:
        error_msg = str(e)[:100]
        print(f"✗ {model} failed: {error_msg}")

print("\nUse the first working model in your .env file:")
print("CLAUDE_MODEL=<model-id-that-works>")
