"""
Email notification client using Resend API.
Sends note options to your email for easy copy/paste.
"""

import os
import resend

# Load .env file if available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Configure Resend
resend.api_key = os.getenv("RESEND_API_KEY")

# Email configuration from environment
TO_EMAIL = os.getenv("NOTES_EMAIL", os.getenv("SMS_PHONE", "kevin@example.com"))
FROM_EMAIL = os.getenv("FROM_EMAIL", "alerts@marketregimes.com")


def send_text_message(message: str, subject: str = "New Substack Notes") -> bool:
    """
    Send an email notification with note options using Resend.

    Args:
        message: The message text to send
        subject: Email subject line

    Returns:
        True if successful, False otherwise
    """
    print(f"📧 Sending email to {TO_EMAIL}...")

    try:
        # Format message as HTML for better readability
        html_message = f"""
        <html>
        <body style="font-family: monospace; white-space: pre-wrap;">
{message}
        </body>
        </html>
        """

        params = {
            "from": f"Market Regime Report <{FROM_EMAIL}>",
            "to": [TO_EMAIL],
            "subject": subject,
            "html": html_message,
        }

        response = resend.Emails.send(params)
        print(f"  ✓ Email sent! ID: {response.get('id', 'unknown')}")
        return True

    except Exception as e:
        print(f"  ✗ Error sending email: {e}")
        return False


def format_notes_message(note_type: str, notes: list, note_id: int) -> str:
    """
    Format the 3 note options into an SMS message.

    Args:
        note_type: Type of note (observational, philosophy, reactive)
        notes: List of 3 note options
        note_id: Database ID for reference

    Returns:
        Formatted message string
    """
    separator = "\n" + "="*40 + "\n"

    message_parts = [
        f"📝 {note_type.upper()} NOTES (ID: {note_id})",
        separator,
    ]

    for i, note in enumerate(notes, 1):
        message_parts.append(f"OPTION {i}:")
        message_parts.append(note)
        message_parts.append(separator)

    return "\n".join(message_parts)


if __name__ == "__main__":
    # Test email sending
    test_message = """
📝 TEST NOTE

This is a test message from the Substack Notes automation system.

If you receive this, the email delivery is working correctly!
    """

    print("Testing email delivery...\n")
    send_text_message(test_message, subject="Test from Notes Automation")
