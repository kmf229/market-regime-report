export interface RegimeUpdateFrontmatter {
  date: string;
  time?: string;
  regime: "bullish" | "bearish";
  published: boolean;
}

export interface RegimeUpdate extends RegimeUpdateFrontmatter {
  content: string;
}

export interface RegimeUpdateWithHtml extends RegimeUpdate {
  htmlContent: string;
  formattedDate: string;
}
