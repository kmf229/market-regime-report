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
  };
}

export async function getArticleWithHtml(
  slug: string
): Promise<(Article & { htmlContent: string; formattedDate: string }) | null> {
  const article = getArticleBySlug(slug);

  if (!article) {
    return null;
  }

  const processedContent = await remark().use(html).process(article.content);
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

export { formatDate };
