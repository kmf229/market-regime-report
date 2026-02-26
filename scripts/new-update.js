#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Get regime from command line argument
const regime = process.argv[2];

if (!regime || !["bullish", "bearish"].includes(regime)) {
  console.log("Usage: node scripts/new-update.js <bullish|bearish>");
  console.log("Example: node scripts/new-update.js bullish");
  process.exit(1);
}

// Get current date and time in EST
const now = new Date();
const dateStr = now.toLocaleDateString("en-CA", { timeZone: "America/New_York" }); // YYYY-MM-DD format
const timeStr = now.toLocaleTimeString("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "America/New_York",
}) + " EST";

const filename = `${dateStr}.md`;
const filepath = path.join(__dirname, "..", "content", "regime-updates", filename);

// Check if file already exists
if (fs.existsSync(filepath)) {
  console.log(`Update for ${dateStr} already exists: ${filepath}`);
  console.log("Edit that file directly to update it.");
  process.exit(1);
}

const content = `---
date: "${dateStr}"
time: "${timeStr}"
regime: "${regime}"
published: true
---

`;

fs.writeFileSync(filepath, content);
console.log(`Created: ${filepath}`);
console.log(`Date: ${dateStr}`);
console.log(`Time: ${timeStr}`);
console.log(`Regime: ${regime}`);
console.log("");
console.log("Add your update content to the file, then commit and push.");
