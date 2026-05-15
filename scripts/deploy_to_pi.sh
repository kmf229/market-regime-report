#!/bin/bash
# Deploy updated track record script to Raspberry Pi

echo "Deploying track record script to Pi..."

# Copy updated script
scp scripts/update_track_record.py kmf229@192.168.1.163:/home/kmf229/market-regime/

echo "Installing yfinance on Pi..."
ssh kmf229@192.168.1.163 "cd /home/kmf229/market-regime && source venv/bin/activate && pip install yfinance"

echo "Restarting regime-updater service..."
ssh kmf229@192.168.1.163 "sudo systemctl restart regime-updater"

echo "Checking service status..."
ssh kmf229@192.168.1.163 "sudo systemctl status regime-updater --no-pager"

echo ""
echo "Deployment complete!"
echo ""
echo "To view logs, run:"
echo "  ssh kmf229@192.168.1.163 'journalctl -u regime-updater -f'"
