"use client";

import { useState } from "react";
import { DailyUpdate } from "@/types/daily-update";
import {
  getRegimeColor,
  getRegimeBgColor,
  getRegimeLabel,
} from "@/lib/regime-helpers";

interface DailyUpdatesProps {
  updates: DailyUpdate[];
  initialCount?: number;
}

export default function DailyUpdates({
  updates,
  initialCount = 5,
}: DailyUpdatesProps) {
  const [showAll, setShowAll] = useState(false);

  const displayedUpdates = showAll ? updates : updates.slice(0, initialCount);
  const hasMore = updates.length > initialCount;

  return (
    <>
      {updates.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No updates yet. Check back soon.
        </p>
      ) : (
        <>
          <div className="space-y-6">
            {displayedUpdates.map((update, index) => (
              <article
                key={update.id}
                className={`border-l-4 pl-6 py-4 ${
                  index === 0 ? "border-gray-900" : "border-gray-200"
                }`}
              >
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <time className="text-sm font-medium text-gray-900">
                    {update.formattedDate}
                  </time>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded ${getRegimeBgColor(
                      update.regime
                    )} ${getRegimeColor(update.regime)}`}
                  >
                    {getRegimeLabel(update.regime)}
                  </span>
                  {index === 0 && (
                    <span className="px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded">
                      Latest
                    </span>
                  )}
                </div>
                <p className="text-gray-700 leading-relaxed">{update.content}</p>
              </article>
            ))}
          </div>

          {hasMore && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-6 w-full py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Show older updates ({updates.length - initialCount} more)
            </button>
          )}

          {showAll && hasMore && (
            <button
              onClick={() => setShowAll(false)}
              className="mt-6 w-full py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Show less
            </button>
          )}
        </>
      )}
    </>
  );
}
