"""
Prompt loading and formatting module.
"""

import os
from typing import List, Dict, Optional


# Path to prompt templates
# Check multiple possible locations
_module_dir = os.path.dirname(__file__)

# Try Pi location first: /home/kmf229/market-regime/prompts/notes/
_pi_prompts = os.path.join(_module_dir, "..", "prompts", "notes")

# Try development location: /Users/.../website/prompts/notes/
_dev_prompts = os.path.join(_module_dir, "..", "..", "..", "prompts", "notes")

if os.path.exists(_pi_prompts):
    PROMPTS_DIR = _pi_prompts
elif os.path.exists(_dev_prompts):
    PROMPTS_DIR = _dev_prompts
else:
    # Default to Pi location (will error if not found)
    PROMPTS_DIR = _pi_prompts


def load_prompt_template(note_type: str) -> str:
    """
    Load the prompt template for a given note type.

    Args:
        note_type: 'observational', 'philosophy', or 'reactive'

    Returns:
        The prompt template as a string
    """
    filename = f"{note_type}.txt"
    filepath = os.path.join(PROMPTS_DIR, filename)

    try:
        with open(filepath, 'r') as f:
            return f.read()
    except FileNotFoundError:
        raise FileNotFoundError(f"Prompt template not found: {filepath}")


def format_recent_notes(note_texts: List[str]) -> str:
    """
    Format recent note texts for inclusion in the prompt.

    Args:
        note_texts: List of previously generated note texts

    Returns:
        Formatted string for prompt
    """
    if not note_texts:
        return "No recent notes available."

    formatted = []
    for i, text in enumerate(note_texts[:10], 1):  # Limit to 10 most recent
        formatted.append(f"--- Recent Note {i} ---\n{text}\n")

    return "\n".join(formatted)


def build_prompt(
    note_type: str,
    recent_notes: List[str],
    market_data: Optional[Dict] = None,
    session_context: Optional[str] = None
) -> str:
    """
    Build the complete prompt by replacing placeholders in the template.

    Args:
        note_type: 'observational', 'philosophy', or 'reactive'
        recent_notes: List of recent note texts to avoid repetition
        market_data: Optional market data dict (for observational/reactive)
        session_context: Optional session context string (for reactive)

    Returns:
        Complete prompt ready to send to AI
    """
    template = load_prompt_template(note_type)

    # Format recent notes
    recent_notes_text = format_recent_notes(recent_notes)

    # Replace placeholders
    prompt = template.replace("{recent_notes}", recent_notes_text)

    # Add market data if provided
    if market_data and "{market_data}" in prompt:
        market_summary = market_data.get("summary", "No market data available.")
        prompt = prompt.replace("{market_data}", market_summary)

    # Add session context if provided
    if session_context and "{session_context}" in prompt:
        prompt = prompt.replace("{session_context}", session_context)

    return prompt


if __name__ == "__main__":
    # Test prompt loading
    print("Testing prompt loading...\n")

    for note_type in ['observational', 'philosophy', 'reactive']:
        print(f"=== {note_type.upper()} ===")
        template = load_prompt_template(note_type)
        print(f"Template loaded: {len(template)} characters")
        print(f"Placeholders: {template.count('{')}")
        print()
