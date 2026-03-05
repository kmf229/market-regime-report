import { createClient } from "@/lib/supabase/server";
import { DailyUpdate } from "@/types/daily-update";

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function getDailyUpdates(): Promise<DailyUpdate[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("daily_updates")
    .select("*")
    .eq("published", true)
    .order("date", { ascending: false });

  if (error || !data) {
    console.error("Error fetching daily updates:", error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    date: row.date,
    regime: row.regime,
    content: row.content,
    published: row.published,
    formattedDate: formatDate(row.date),
  }));
}

// Re-export color/label helpers
export { getRegimeColor, getRegimeBgColor, getRegimeLabel } from "./regime-helpers";
