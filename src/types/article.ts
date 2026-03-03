export interface ArticleFrontmatter {
  title: string;
  date: string;
  description: string;
  slug: string;
  tags: string[];
  image?: string;
  published: boolean;
}

export interface Article extends ArticleFrontmatter {
  content: string;
  readingTime: number;
}

export interface ArticlePreview extends ArticleFrontmatter {
  readingTime: number;
}
