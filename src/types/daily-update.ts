export interface DailyUpdate {
  id: string;
  date: string;
  regime: "bullish" | "bearish";
  content: string;
  published: boolean;
  formattedDate: string;
}
