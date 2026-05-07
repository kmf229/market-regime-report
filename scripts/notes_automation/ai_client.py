"""
AI client for generating notes using Claude (Anthropic API).
"""

import os
from typing import List
from anthropic import Anthropic

# Load .env file if available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Initialize Anthropic client
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Model to use - configurable via environment variable
# Use same model as generate_blurb.py
MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-20250514")


def generate_notes(prompt: str, note_type: str) -> List[str]:
    """
    Generate 3 candidate notes using Claude.

    Args:
        prompt: The complete prompt to send to Claude
        note_type: Type of note being generated (for logging)

    Returns:
        List of 3 generated note options
    """
    print(f"🤖 Generating {note_type} notes using Claude...")

    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=2000,
            temperature=0.8,  # Higher temperature for creative variety
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        # Extract the text response
        raw_text = response.content[0].text

        # Debug: save raw response for inspection
        debug_file = f"/tmp/claude_response_{note_type}.txt"
        with open(debug_file, 'w') as f:
            f.write(raw_text)
        print(f"  📝 Raw response saved to: {debug_file}")

        # Parse the 3 numbered options
        notes = parse_note_options(raw_text)

        if len(notes) != 3:
            print(f"⚠ Warning: Expected 3 notes, got {len(notes)}")
            print(f"  💡 Check {debug_file} to see Claude's response")

        for i, note in enumerate(notes, 1):
            print(f"  ✓ Option {i}: {len(note)} characters")

        return notes

    except Exception as e:
        print(f"✗ Error generating notes: {e}")
        raise


def parse_note_options(raw_text: str) -> List[str]:
    """
    Parse Claude's response into individual note options.

    Handles multiple formats:
    - 1. Note option 1
    - **Note option 1**
    - Note option 1

    Returns:
        List of 3 note texts (without the headers)
    """
    import re

    # Try splitting by **Note option N** format first
    if '**Note option' in raw_text:
        pattern = r'\*\*Note option \d+\*\*'
        parts = re.split(pattern, raw_text)
        # Remove empty first part and clean up
        notes = [part.strip() for part in parts[1:] if part.strip()]
        return notes

    # Fall back to numbered format (1., 2., 3.)
    lines = raw_text.strip().split('\n')
    notes = []
    current_note = []
    in_note = False

    for line in lines:
        stripped = line.strip()

        # Check if this is a new note header (1., 2., 3.)
        if stripped.startswith(('1.', '2.', '3.')):
            # Save previous note if exists
            if current_note:
                notes.append('\n'.join(current_note).strip())
                current_note = []

            # Start new note (remove the number prefix)
            note_text = stripped[2:].strip()
            if note_text:  # Only add if there's text after the number
                current_note.append(note_text)
            in_note = True

        elif in_note:
            # Continue adding lines to current note
            if stripped:  # Skip empty lines between sections
                current_note.append(line)

    # Add the last note
    if current_note:
        notes.append('\n'.join(current_note).strip())

    return notes


if __name__ == "__main__":
    # Test note generation
    test_prompt = """
You are generating a Substack Note for The Market Regime Report.

NOTE TYPE: Test

TASK:
Write 3 short test notes.

OUTPUT FORMAT:
1. Note option 1
2. Note option 2
3. Note option 3
    """

    print("Testing Claude API...\n")
    notes = generate_notes(test_prompt, "test")

    for i, note in enumerate(notes, 1):
        print(f"\n=== OPTION {i} ===")
        print(note)
