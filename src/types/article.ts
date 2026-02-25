export interface ArticleFrontmatter {
  title: string;
  date: string;
  description: string;
  slug: string;
  tags: string[];
  published: boolean;
}

export interface Article extends ArticleFrontmatter {
  content: string;
}

export interface ArticlePreview extends ArticleFrontmatter {}
