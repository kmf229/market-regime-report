export interface ArticleFrontmatter {
  title: string;
  date: string;
  description?: string; // Optional, summary can be used instead
  summary?: string; // One-liner for blog feeds
  slug: string;
  tags?: string[]; // Optional for updates
  image?: string;
  published: boolean;
  category?: "updates" | "strategy" | "research"; // Deprecated, use section
  section?: "updates" | "strategy" | "research"; // Preferred field
}

export interface Article extends ArticleFrontmatter {
  content: string;
  readingTime: number;
}

export interface ArticlePreview extends ArticleFrontmatter {
  readingTime: number;
}
