"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface TagFilterProps {
  tags: string[];
}

export default function TagFilter({ tags }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTag = searchParams.get("tag");

  const handleTagClick = (tag: string | null) => {
    if (tag === null) {
      router.push("/articles");
    } else {
      router.push(`/articles?tag=${encodeURIComponent(tag)}`);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleTagClick(null)}
        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
          selectedTag === null
            ? "bg-gray-900 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => handleTagClick(tag)}
          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            selectedTag === tag
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
