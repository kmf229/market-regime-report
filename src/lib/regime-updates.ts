import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import {
  RegimeUpdate,
  RegimeUpdateFrontmatter,
  RegimeUpdateWithHtml,
} from "@/types/regime-update";

const updatesDirectory = path.join(process.cwd(), "content/regime-updates");

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

function getUpdateFiles(): string[] {
  if (!fs.existsSync(updatesDirectory)) {
    return [];
  }
  return fs
    .readdirSync(updatesDirectory)
    .filter((file) => file.endsWith(".md"));
}

function getUpdateByFilename(filename: string): RegimeUpdate | null {
  const fullPath = path.join(updatesDirectory, filename);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const frontmatter = data as RegimeUpdateFrontmatter;

  return {
    ...frontmatter,
    content,
  };
}

async function processMarkdown(content: string): Promise<string> {
  const processedContent = await remark().use(html).process(content);
  return processedContent.toString();
}

export async function getAllPublishedUpdates(): Promise<RegimeUpdateWithHtml[]> {
  const files = getUpdateFiles();

  const updates: RegimeUpdateWithHtml[] = [];

  for (const file of files) {
    const update = getUpdateByFilename(file);
    if (update && update.published) {
      const htmlContent = await processMarkdown(update.content);
      updates.push({
        ...update,
        htmlContent,
        formattedDate: formatDate(update.date),
      });
    }
  }

  // Sort by date descending (newest first)
  updates.sort((a, b) => {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  return updates;
}

export function getRegimeColor(regime: string): string {
  return regime === "bullish" ? "text-emerald-600" : "text-red-600";
}

export function getRegimeBgColor(regime: string): string {
  return regime === "bullish" ? "bg-emerald-50" : "bg-red-50";
}

export function getRegimeLabel(regime: string): string {
  return regime === "bullish" ? "Bullish" : "Bearish";
}
