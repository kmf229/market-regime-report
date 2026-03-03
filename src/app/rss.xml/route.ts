import { getAllPublishedArticles } from "@/lib/articles";

export async function GET() {
  const articles = getAllPublishedArticles();
  const siteUrl = "https://marketregimes.com";

  const rssItems = articles
    .map((article) => {
      const pubDate = new Date(article.date).toUTCString();
      return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${siteUrl}/articles/${article.slug}</link>
      <guid isPermaLink="true">${siteUrl}/articles/${article.slug}</guid>
      <description><![CDATA[${article.description}]]></description>
      <pubDate>${pubDate}</pubDate>
      ${article.tags.map((tag) => `<category>${tag}</category>`).join("\n      ")}
    </item>`
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Market Regime Report</title>
    <link>${siteUrl}</link>
    <description>A rules-based approach to navigating markets — without prediction, stress, or noise. Systematic investing with full transparency.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
