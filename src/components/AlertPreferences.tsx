"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface AlertPreferencesProps {
  userId: string;
  initialPreferences: {
    regime_change_alerts: boolean;
    weekly_digest: boolean;
  };
}

export default function AlertPreferences({
  userId,
  initialPreferences,
}: AlertPreferencesProps) {
  const [regimeAlerts, setRegimeAlerts] = useState(
    initialPreferences.regime_change_alerts
  );
  const [weeklyDigest, setWeeklyDigest] = useState(
    initialPreferences.weekly_digest
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const supabase = createClient();

  const handleToggle = async (
    type: "regime_change_alerts" | "weekly_digest",
    value: boolean
  ) => {
    if (type === "regime_change_alerts") {
      setRegimeAlerts(value);
    } else {
      setWeeklyDigest(value);
    }

    setSaving(true);
    setSaved(false);

    const { error } = await supabase
      .from("profiles")
      .update({ [type]: value })
      .eq("id", userId);

    setSaving(false);

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-6 text-sm">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={regimeAlerts}
          onChange={(e) =>
            handleToggle("regime_change_alerts", e.target.checked)
          }
          className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
        />
        <span className="text-gray-600">Regime change alerts</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={weeklyDigest}
          onChange={(e) => handleToggle("weekly_digest", e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
        />
        <span className="text-gray-600">Weekly digest</span>
      </label>

      {saving && <span className="text-xs text-gray-400">Saving...</span>}
      {saved && <span className="text-xs text-emerald-600">Saved</span>}
    </div>
  );
}
