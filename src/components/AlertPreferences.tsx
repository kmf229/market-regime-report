"use client";

import { useState, useEffect } from "react";
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
    // Update local state immediately
    if (type === "regime_change_alerts") {
      setRegimeAlerts(value);
    } else {
      setWeeklyDigest(value);
    }

    setSaving(true);
    setSaved(false);

    // Update database
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
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Email Alerts</h3>
        {saving && (
          <span className="text-xs text-gray-500">Saving...</span>
        )}
        {saved && (
          <span className="text-xs text-emerald-600">Saved</span>
        )}
      </div>

      <div className="space-y-4">
        {/* Regime Change Alerts */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={regimeAlerts}
            onChange={(e) =>
              handleToggle("regime_change_alerts", e.target.checked)
            }
            className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
          />
          <div>
            <div className="font-medium text-gray-900">Regime Change Alerts</div>
            <div className="text-sm text-gray-500">
              Get an email at 3:30 PM ET when the regime flips between bullish and bearish
            </div>
          </div>
        </label>

        {/* Weekly Digest */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={weeklyDigest}
            onChange={(e) => handleToggle("weekly_digest", e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
          />
          <div>
            <div className="font-medium text-gray-900">Weekly Digest</div>
            <div className="text-sm text-gray-500">
              Receive a summary every Sunday with the week&apos;s performance and outlook
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}
