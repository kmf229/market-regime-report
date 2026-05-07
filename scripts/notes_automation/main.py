"""
Main entry point for Substack Notes automation.

Usage:
    python -m notes_automation.main --type observational
    python -m notes_automation.main --type philosophy
    python -m notes_automation.main --type reactive
    python -m notes_automation.main --type all
"""

import argparse
from datetime import datetime
from typing import Optional

from . import database, market_data, prompts, ai_client, sms_client


def generate_note_batch(note_type: str) -> bool:
    """
    Generate a batch of notes for the specified type.

    Args:
        note_type: 'observational', 'philosophy', or 'reactive'

    Returns:
        True if successful, False otherwise
    """
    print(f"\n{'='*60}")
    print(f"📝 Generating {note_type.upper()} notes")
    print(f"{'='*60}\n")

    try:
        # 1. Get recent notes for context (avoid repetition)
        print("📚 Fetching recent notes for context...")
        recent_same_type = database.get_recent_note_texts(note_type, limit=10)
        recent_all_types = database.get_recent_note_texts(limit=5)
        recent_notes = list(set(recent_same_type + recent_all_types))  # Deduplicate
        print(f"  ✓ Found {len(recent_notes)} recent notes to avoid repeating\n")

        # 2. Get market data if needed
        market_data_dict = None
        session_context = None

        if note_type in ['observational', 'reactive']:
            print("📊 Fetching market data...")
            market_data_dict = market_data.get_market_summary(['SPY', 'TQQQ', 'GLD'])
            print(f"  ✓ Market data for {market_data_dict['date']}\n")

        if note_type == 'reactive':
            session_context = market_data.get_session_context()
            print(f"  ✓ Session context: {session_context}\n")

        # 3. Build the prompt
        print("🔨 Building prompt...")
        full_prompt = prompts.build_prompt(
            note_type=note_type,
            recent_notes=recent_notes,
            market_data=market_data_dict,
            session_context=session_context
        )
        print(f"  ✓ Prompt ready ({len(full_prompt)} characters)\n")

        # 4. Generate notes using Claude
        notes = ai_client.generate_notes(full_prompt, note_type)

        if not notes or len(notes) == 0:
            print("✗ No notes generated")
            return False

        print()

        # 5. Store in database
        print("💾 Saving to database...")
        note_id = database.store_note_batch(
            note_type=note_type,
            prompt_used=full_prompt,
            market_data_used=market_data_dict,
            generated_options=notes
        )
        print(f"  ✓ Saved with ID: {note_id}\n")

        # 6. Send via email
        print("📧 Sending to your email...")
        message = sms_client.format_notes_message(note_type, notes, note_id)
        success = sms_client.send_text_message(
            message=message,
            subject=f"{note_type.title()} Notes - {datetime.now().strftime('%m/%d')}"
        )

        if success:
            print(f"\n✅ {note_type.upper()} notes generated and sent successfully!\n")
            return True
        else:
            print(f"\n⚠️  Notes generated but email failed. Check database ID {note_id}\n")
            return False

    except Exception as e:
        print(f"\n✗ Error generating {note_type} notes: {e}\n")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Generate Substack Notes using Claude AI"
    )
    parser.add_argument(
        "--type",
        choices=["observational", "philosophy", "reactive", "all"],
        required=True,
        help="Type of note to generate"
    )
    parser.add_argument(
        "--init-db",
        action="store_true",
        help="Initialize the database (run once)"
    )

    args = parser.parse_args()

    # Initialize database if requested
    if args.init_db:
        print("Initializing database...\n")
        database.init_database()
        print()

    # Ensure database exists
    database.init_database()

    # Generate notes based on type
    if args.type == "all":
        print("Generating ALL note types...\n")
        results = []
        for note_type in ["observational", "philosophy", "reactive"]:
            results.append(generate_note_batch(note_type))

        print(f"\n{'='*60}")
        print("📊 SUMMARY")
        print(f"{'='*60}")
        print(f"Observational: {'✅' if results[0] else '❌'}")
        print(f"Philosophy:    {'✅' if results[1] else '❌'}")
        print(f"Reactive:      {'✅' if results[2] else '❌'}")
        print()

    else:
        generate_note_batch(args.type)


if __name__ == "__main__":
    main()
