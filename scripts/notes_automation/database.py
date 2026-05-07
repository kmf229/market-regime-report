"""
SQLite database module for storing generated notes.
"""

import sqlite3
from datetime import datetime
from typing import List, Dict, Optional
import json
import os


# Database path - adjust if needed
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "notes.db")


def init_database():
    """Create tables if they don't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            note_type TEXT NOT NULL,
            prompt_used TEXT,
            market_data_used TEXT,
            generated_note_options TEXT NOT NULL,
            selected_or_posted_note TEXT,
            status TEXT DEFAULT 'generated'
        )
    """)

    # Create index for faster queries
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_note_type_created
        ON notes(note_type, created_at DESC)
    """)

    conn.commit()
    conn.close()
    print(f"✓ Database initialized at {DB_PATH}")


def store_note_batch(
    note_type: str,
    prompt_used: str,
    market_data_used: Optional[Dict],
    generated_options: List[str]
) -> int:
    """
    Store a batch of generated note options.

    Returns:
        note_id: The ID of the inserted record
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Convert lists/dicts to JSON strings for storage
    market_data_json = json.dumps(market_data_used) if market_data_used else None
    options_json = json.dumps(generated_options)

    cursor.execute("""
        INSERT INTO notes (note_type, prompt_used, market_data_used, generated_note_options)
        VALUES (?, ?, ?, ?)
    """, (note_type, prompt_used, market_data_json, options_json))

    note_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return note_id


def get_recent_notes(note_type: Optional[str] = None, limit: int = 10) -> List[Dict]:
    """
    Get recent notes, optionally filtered by type.

    Args:
        note_type: If provided, filter by this note type
        limit: Number of notes to return

    Returns:
        List of note dictionaries with parsed JSON fields
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    if note_type:
        cursor.execute("""
            SELECT * FROM notes
            WHERE note_type = ?
            ORDER BY created_at DESC
            LIMIT ?
        """, (note_type, limit))
    else:
        cursor.execute("""
            SELECT * FROM notes
            ORDER BY created_at DESC
            LIMIT ?
        """, (limit,))

    rows = cursor.fetchall()
    conn.close()

    # Convert to list of dicts and parse JSON fields
    notes = []
    for row in rows:
        note = dict(row)
        # Parse JSON strings back to objects
        if note['market_data_used']:
            note['market_data_used'] = json.loads(note['market_data_used'])
        if note['generated_note_options']:
            note['generated_note_options'] = json.loads(note['generated_note_options'])
        notes.append(note)

    return notes


def get_recent_note_texts(note_type: Optional[str] = None, limit: int = 10) -> List[str]:
    """
    Get just the text of recent notes for prompt context.

    Returns a list of note texts (from all 3 options per batch).
    """
    notes = get_recent_notes(note_type, limit)

    texts = []
    for note in notes:
        options = note['generated_note_options']
        for option in options:
            texts.append(option)

    return texts


def mark_note_posted(note_id: int, option_number: int):
    """
    Mark which option was actually posted (optional feature).

    Args:
        note_id: Database ID of the note batch
        option_number: Which option (1, 2, or 3) was posted
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get the note options
    cursor.execute("SELECT generated_note_options FROM notes WHERE id = ?", (note_id,))
    row = cursor.fetchone()

    if row:
        options = json.loads(row[0])
        if 1 <= option_number <= len(options):
            selected = options[option_number - 1]

            cursor.execute("""
                UPDATE notes
                SET selected_or_posted_note = ?, status = 'posted'
                WHERE id = ?
            """, (selected, note_id))

            conn.commit()
            print(f"✓ Marked note {note_id} option {option_number} as posted")
        else:
            print(f"✗ Invalid option number: {option_number}")
    else:
        print(f"✗ Note {note_id} not found")

    conn.close()
