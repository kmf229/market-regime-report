import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { Article, ArticlePreview, ArticleFrontmatter } from "@/types/article";

const articlesDirectory = path.join(process.cwd(), "content/articles");

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function calculateReadingTime(content: string): number {
  // Average reading speed: 200-250 words per minute
  // Using 200 wpm for technical content
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, readingTime); // Minimum 1 minute
}

function formatDate(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getArticleSlugs(): string[] {
  if (!fs.existsSync(articlesDirectory)) {
    return [];
  }
  const files = fs.readdirSync(articlesDirectory);
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

export function getArticleBySlug(slug: string): Article | null {
  const fullPath = path.join(articlesDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const frontmatter = data as ArticleFrontmatter;

  return {
    ...frontmatter,
    content,
    readingTime: calculateReadingTime(content),
  };
}

export async function getArticleWithHtml(
  slug: string
): Promise<(Article & { htmlContent: string; formattedDate: string }) | null> {
  const article = getArticleBySlug(slug);

  if (!article) {
    return null;
  }

  const processedContent = await remark().use(html, { sanitize: false }).process(article.content);
  const htmlContent = processedContent.toString();

  return {
    ...article,
    htmlContent,
    formattedDate: formatDate(article.date),
  };
}

export function getAllPublishedArticles(): ArticlePreview[] {
  const slugs = getArticleSlugs();

  const articles = slugs
    .map((slug) => {
      const article = getArticleBySlug(slug);
      if (!article || !article.published) {
        return null;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { content, ...preview } = article;
      return preview;
    })
    .filter((article): article is ArticlePreview => article !== null);

  // Sort by date descending
  articles.sort((a, b) => {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  return articles;
}

export function getPublishedArticleSlugs(): string[] {
  return getAllPublishedArticles().map((article) => article.slug);
}

export function getAllTags(): string[] {
  const articles = getAllPublishedArticles();
  const tagSet = new Set<string>();
  articles.forEach((article) => {
    article.tags.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

export function getRelatedArticles(
  currentSlug: string,
  currentTags: string[],
  limit: number = 3
): ArticlePreview[] {
  const allArticles = getAllPublishedArticles();

  // Score articles by number of shared tags
  const scoredArticles = allArticles
    .filter((article) => article.slug !== currentSlug)
    .map((article) => {
      const sharedTags = article.tags.filter((tag) =>
        currentTags.includes(tag)
      );
      return { article, score: sharedTags.length };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scoredArticles.slice(0, limit).map((item) => item.article);
}

export { formatDate };
