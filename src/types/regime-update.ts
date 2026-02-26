export interface RegimeUpdateFrontmatter {
  date: string;
  regime: "bullish" | "bearish";
  published: boolean;
}

export interface RegimeUpdate extends RegimeUpdateFrontmatter {
  content: string;
  publishedTime: string | null;
}

export interface RegimeUpdateWithHtml extends RegimeUpdate {
  htmlContent: string;
  formattedDate: string;
}
