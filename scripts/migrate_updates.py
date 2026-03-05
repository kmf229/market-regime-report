"""
One-time migration script to move existing markdown updates to Supabase.

Run this AFTER creating the daily_updates table in Supabase.

Usage:
    python scripts/migrate_updates.py
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

# Add parent directory for imports
sys.path.insert(0, str(Path(__file__).parent))

try:
    from dotenv import load_dotenv
    # Try .env.local first (Next.js convention), then .env
    env_local = Path(__file__).parent.parent / ".env.local"
    env_file = Path(__file__).parent.parent / ".env"
    if env_local.exists():
        load_dotenv(env_local)
    elif env_file.exists():
        load_dotenv(env_file)
except ImportError:
    pass

try:
    import frontmatter
except ImportError:
    print("Please install python-frontmatter: pip install python-frontmatter")
    sys.exit(1)

from update_regime_supabase import get_supabase_client


def migrate_updates():
    """Migrate markdown updates to Supabase."""
    # Path to markdown updates
    updates_dir = Path(__file__).parent.parent / "content" / "regime-updates"

    if not updates_dir.exists():
        print(f"Updates directory not found: {updates_dir}")
        return

    # Get Supabase client
    supabase = get_supabase_client()

    # Find all markdown files
    md_files = list(updates_dir.glob("*.md"))
    print(f"Found {len(md_files)} markdown files")

    migrated = 0
    skipped = 0

    for md_file in sorted(md_files):
        try:
            # Parse frontmatter
            post = frontmatter.load(md_file)

            # Skip unpublished
            if not post.get("published", False):
                print(f"  Skipping (unpublished): {md_file.name}")
                skipped += 1
                continue

            # Get data
            date = post.get("date")
            regime = post.get("regime", "").lower()
            content = post.content.strip()

            if not date or not regime or not content:
                print(f"  Skipping (missing data): {md_file.name}")
                skipped += 1
                continue

            # Upsert to Supabase
            data = {
                "date": date,
                "regime": regime,
                "content": content,
                "published": True,
            }

            supabase.table("daily_updates").upsert(
                data,
                on_conflict="date"
            ).execute()

            print(f"  Migrated: {date} ({regime})")
            migrated += 1

        except Exception as e:
            print(f"  Error migrating {md_file.name}: {e}")
            skipped += 1

    print()
    print("=" * 40)
    print(f"Migration complete!")
    print(f"  Migrated: {migrated}")
    print(f"  Skipped: {skipped}")
    print("=" * 40)


if __name__ == "__main__":
    migrate_updates()
