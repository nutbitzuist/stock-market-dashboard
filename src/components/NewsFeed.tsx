"use client";

import { useState, useEffect, useCallback } from "react";
import type { NewsItem } from "@/app/api/news/route";

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/news");
      if (!res.ok) return;
      const json = await res.json();
      setNews(json.data || []);
    } catch (err) {
      console.error("News fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="mb-6">
        <h2 className="text-sm font-bold tracking-widest mb-2 border-b-2 border-gray-800 pb-1">MARKET NEWS</h2>
        <div className="text-[10px] text-gray-400 p-3 text-center">Loading news...</div>
      </div>
    );
  }

  if (news.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-sm font-bold tracking-widest mb-2 border-b-2 border-gray-800 pb-1">
        MARKET NEWS
      </h2>
      <p className="text-[9px] text-gray-500 mb-2">Latest market news from Tiingo News API.</p>

      <div className="border border-gray-300 rounded overflow-hidden max-h-[400px] overflow-y-auto">
        {news.map((item, idx) => (
          <div
            key={item.id}
            className={`p-2 border-b border-gray-100 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-gray-900 hover:text-blue-700 leading-tight block"
                >
                  {item.title}
                </a>
                {item.description && (
                  <p className="text-[9px] text-gray-500 mt-0.5 leading-tight line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[8px] text-gray-400">{item.source}</span>
                  <span className="text-[8px] text-gray-300">|</span>
                  <span className="text-[8px] text-gray-400">{timeAgo(item.publishedDate)}</span>
                  {item.tickers.length > 0 && (
                    <>
                      <span className="text-[8px] text-gray-300">|</span>
                      <div className="flex gap-0.5">
                        {item.tickers.map((t) => (
                          <span
                            key={t}
                            className="text-[7px] px-1 py-0.5 bg-blue-100 text-blue-700 rounded font-bold"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
