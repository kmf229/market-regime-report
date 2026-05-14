export interface ArticleFrontmatter {
  title: string;
  date: string;
  description: string;
  slug: string;
  tags: string[];
  image?: string;
  published: boolean;
  category?: "updates" | "strategy" | "research";
}

export interface Article extends ArticleFrontmatter {
  content: string;
  readingTime: number;
}

export interface ArticlePreview extends ArticleFrontmatter {
  readingTime: number;
}
