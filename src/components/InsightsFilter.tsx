"use client";

import { useState } from "react";
import Link from "next/link";
import { ArticlePreview } from "@/types/article";

interface InsightsFilterProps {
  articles: ArticlePreview[];
  categories: string[];
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function InsightsFilter({ articles, categories }: InsightsFilterProps) {
  const [filter, setFilter] = useState<string>("all");

  // Filter articles by category
  const filteredArticles = filter === "all"
    ? articles
    : articles.filter((article) => {
        const articleSection = article.section || article.category;
        return articleSection === filter;
      });

  return (
    <div>
      {/* Filter Buttons */}
      {categories.length > 0 && (
        <section className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex gap-3 overflow-x-auto">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === "all"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors capitalize ${
                    filter === cat
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-20">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No articles found in this category.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="group block"
              >
                <article className="flex flex-col md:flex-row gap-6 p-6 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  {/* Thumbnail */}
                  {article.image && (
                    <div className="md:w-48 md:flex-shrink-0">
                      <div className="aspect-[16/9] md:aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-sm text-gray-500">
                        {formatDate(article.date)}
                      </p>
                      {(article.section || article.category) && (
                        <>
                          <span className="text-gray-300">•</span>
                          <p className="text-sm text-gray-500 capitalize">
                            {article.section || article.category}
                          </p>
                        </>
                      )}
                      {article.readingTime && (
                        <>
                          <span className="text-gray-300">•</span>
                          <p className="text-sm text-gray-500">
                            {article.readingTime} min read
                          </p>
                        </>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 group-hover:text-gray-600 transition-colors mb-2">
                      {article.title}
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      {article.description}
                    </p>
                    {article.tags && article.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {article.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
